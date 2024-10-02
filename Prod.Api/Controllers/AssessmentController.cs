using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Prod.Api.Helpers;
using Prod.Api.Hubs;
using Prod.Api.Services;
using Prod.Data.EFCore;
using Prod.Domain;
using Prod.Infrastructure.Helpers;
using Index = Nbic.Indexer.Index;

// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

namespace Prod.Api.Controllers
{
    /// <summary>
    /// Operations on assessments
    /// </summary>
    [Route("api/[controller]")]
    [Authorize]
    public class AssessmentController : AuthorizeApiController
    {
        private readonly ProdDbContext _dbContext;
        private readonly IHubContext<MessageHub> _hubContext;
        private readonly Index _index;
        private readonly IReferenceService _referenceService;

        /// <summary>
        /// known extra fields posted by frontend - that are not stored on assessment
        /// </summary>
        private string[] _knownExtraFields = new[]
            { "critA", "critB", "critC", "critD", "critE", "critF", "critG", "critH", "critI", "furtherInfoAboutImport" };

        public AssessmentController(IDiscoveryCache discoveryCache, ProdDbContext dbContext,
            IReferenceService referenceService, IHubContext<MessageHub> hubContext, Index index) : base(discoveryCache,
            dbContext)
        //public AssessmentController(IDiscoveryCache discoveryCache, ProdDbContext dbContext, IReferenceService referenceService) : base(discoveryCache, dbContext)
        {
            _dbContext = dbContext;
            _referenceService = referenceService;
            _hubContext = hubContext;
            _index = index;
        }

        private Task SendMessage(string context, string message)
        {
            return _hubContext.Clients.All.SendAsync("ReceiveMessage", context, message);
        }

        /// <summary>
        /// Get assessment
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpGet("{id}")]
        public async Task<FA4> Get(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id).Select(x => x.Doc)
                .FirstOrDefaultAsync(); // _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(data);
            //if (doc.C2A2SannhetsverdiKode == null)
            //{
            //    doc.C2A2SannhetsverdiKode = "1";
            //}
            //if (doc.B2BeregnetAreal == null)
            //{
            //    doc.B2BeregnetAreal = "";
            //}

            await SendMessage("assessment", "open");

            // Safeguard
            if (doc.Id != id && doc.Id != 0) throw new Exception("Id is corrupt (" + id + "/" + doc.Id + ")");

            doc.Id = id;
            if (doc.ExtensionData != null)
            {
                doc.ExtensionData = null;
            }
            if (doc.RiskAssessment.ExtensionData != null)
            {
                doc.RiskAssessment.ExtensionData = null;
            }
            return doc;
        }

        /// <summary>
        /// Check if an assessment exists for a scientificname in a specific expertgroup
        /// </summary>
        /// <remarks>
        /// Used for checking if assessment exits before frontend suggests creating one
        /// </remarks>
        /// <param name="expertgroupname"></param>
        /// <param name="scientificNameId"></param>
        /// <returns></returns>
        [AllowAnonymous()]
        [HttpGet("ExistsByExpertgroupAndName/{expertgroupname}/{scientificNameId}")]
        public async Task<bool> ExistsByNames(string expertgroupname, int scientificNameId)
        {
            var query = IndexHelper.QueryGetDocumentQuery(expertgroupname, scientificNameId);
            var result = _index
                .SearchReference(query, 0, 1, IndexHelper.Field_ScientificNameAsTerm)
                .Select(IndexHelper.GetDocumentFromIndex)
                .ToList();

            return result.Any();
        }

        /// <summary>
        /// Locks an assessment to a user
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/lock")]
        public async Task<IActionResult> Lock(int id)
        {
            var assessment =
                await _dbContext.Assessments.Where(x => x.Id == id)
                    .FirstOrDefaultAsync(); // _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(assessment.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(assessment.Doc);
            var role = await GetRoleInGroup(doc.ExpertGroup);

            try
            {
                if (role.WriteAccess)
                {
                    doc.LockedForEditAt = DateTime.Now;
                    doc.LockedForEditByUserId = role.User.Id;
                    assessment.LockedForEditAt = DateTime.Now;
                    assessment.LockedForEditByUserId = role.User.Id;
                    await StoreAssessment(id, doc, role.User, true);
                    await _dbContext.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
                }
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }

            return Ok();
        }

        /// <summary>
        /// Unlocks an assessment from a user
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>

        [HttpGet("{id}/unlock")]
        public async Task<IActionResult> UnLock(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id)
                .FirstOrDefaultAsync(); // _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);
            var role = await GetRoleInGroup(doc.ExpertGroup);
            var force = role.Admin || role.User.IsAdmin;
            try
            {
                if (role.WriteAccess || force)
                {
                    doc.LockedForEditAt = DateTime.Now;
                    doc.LockedForEditByUserId = null;
                    await StoreAssessment(id, doc, role.User, true, force);
                    await _dbContext.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
                }
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }

            return Ok();
        }

        /// <summary>
        /// Marks an assessment as finished/complete
        /// </summary>
        /// <remarks>
        /// Will then not be available for furter edits
        /// </remarks>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/finish")]
        public async Task<IActionResult> Finish(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id)
                .FirstOrDefaultAsync(); // _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);
            var role = await GetRoleInGroup(doc.ExpertGroup);
            var force = role.Admin || role.User.IsAdmin;
            try
            {
                if (force || role.WriteAccess)
                {
                    doc.EvaluationStatus = "finished";
                    doc.LockedForEditAt = DateTime.Now;
                    doc.LockedForEditBy = null;
                    await StoreAssessment(id, doc, role.User, true, force);
                    await _dbContext.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
                }
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }

            return Ok();
        }

        /// <summary>
        /// Drop/deletes an assessment
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/delete")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await DeleteAssessment(id);
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }

            return Ok();
        }

        private async Task<bool> DeleteAssessment(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id)
                .FirstOrDefaultAsync(); // _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data.Doc)) return false;
            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);

            //if (doc.Ekspertgruppe != "Testarter")
            //{
            //    throw new Exception("KAN KUN SLETTE TESTARTER");  // for testing!. Fjern denne begrensningen når det blir behov.
            //}

            var role = await GetRoleInGroup(doc.ExpertGroup);
            var force = role.User.IsAdmin;
            if (force)
            {
                doc.IsDeleted = true;
                await StoreAssessment(id, doc, role.User, false, true);
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
            }

            return true;
        }

        /// <summary>
        /// Remove the finished/complete mark form an assessment
        /// </summary>
        /// <remarks>
        /// Will then be available for furter edits
        /// </remarks>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/unfinish")]
        public async Task<IActionResult> Unfinish(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id)
                .FirstOrDefaultAsync(); // _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);
            var role = await GetRoleInGroup(doc.ExpertGroup);
            var force = role.Admin || role.WriteAccess || role.User.IsAdmin;
            try
            {
                if (role.WriteAccess || force)
                {
                    doc.EvaluationStatus = "inprogress";
                    doc.LockedForEditAt = DateTime.Now;
                    doc.LockedForEditBy = null;
                    await StoreAssessment(id, doc, role.User, true, force);
                    await _dbContext.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
                }
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }

            return Ok();
        }

        /// <summary>
        /// Update an existing assessment
        /// </summary>
        /// <param name="id"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        [HttpPost("{id}")]
        public async Task<IActionResult> Post(string id, [FromBody] FA4 value)
        {
            ThrowErrorIfUnknownPropertiesOnModelIsPostedOnLocalhostAndTestServer(value);

            var role = await GetRoleInGroup(value.ExpertGroup);
            try
            {
                if (role.WriteAccess)
                    await StoreAssessment(int.Parse(id), value, role.User, false);
                else
                    throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }
            
            await SendMessage("assessment", "save");
            
            return Ok();
        }
        
        /// <summary>
        /// Create a new blank assessment with initial parameters on model for a taxon and specific species group
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        [HttpPut("createnew")]
        public async Task<IActionResult> CreateNewAssessment([FromBody] Taxinfo value)
        {
            var now = DateTime.Now;
            var role = await GetRoleInGroup(value.Ekspertgruppe);
            var scientificNameId = value.ScientificNameId;

            try
            {
                if (role.WriteAccess)
                {
                    var userId = role.User;
                    var fa4 = CreateNewAssessment(value.Ekspertgruppe, userId, scientificNameId,
                        value.potensiellDørstokkart == "potentialDoorknocker");
                    fa4.EvaluationStatus = "created";
                    fa4.LastUpdatedAt = now;
                    var doc = JsonSerializer.Serialize(fa4);
                    var assessment = new Assessment
                    {
                        Doc = doc,
                        LastUpdatedAt = fa4.LastUpdatedAt,
                        LastUpdatedByUserId = userId.Id,
                        ScientificNameId = fa4.EvaluatedScientificNameId.Value
                    };
                    _dbContext.Assessments.Add(assessment);
                    assessment.ChangedAt = DateTime.Now;
                    var timestamp = _dbContext.TimeStamp.Single();
                    timestamp.DateTimeUpdated = assessment.ChangedAt;
                    await _dbContext.SaveChangesAsync();
                }
                else
                {
                    throw new Exception("IKKE SKRIVETILGANG TIL EKSPERTGRUPPEN");
                }
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }

            return Ok();
        }
        
        private async Task<FA4> moveAssessment(ProdDbContext dbContext, string expertgroup, User user,
            int scientificNameId, FA4 assessment, int assessmentId) // change taxonomic info
        {
            if (string.IsNullOrWhiteSpace(expertgroup))
            {
                throw new ArgumentNullException("expertgroup");
            }
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }
            var existingAssessment = await dbContext.Assessments.Where(x => x.ScientificNameId == scientificNameId && x.Expertgroup == expertgroup && x.IsDeleted == false).Select(x => x.Id).FirstOrDefaultAsync();
            if (existingAssessment > 0 && existingAssessment != assessmentId)
            {
                throw new ArgumentException("supplied scientificNameId already exists in database");
            }


            var ts = new Prod.Api.Services.TaxonService();
            var titask = ts.GetTaxonInfoAsync(scientificNameId);
            var ti = titask.GetAwaiter().GetResult();
            var (hierarcy, rank) = TaxonService.GetFullPathScientificName(ti);

            if (scientificNameId != ti.ValidScientificNameId)
            {
                throw new ArgumentException("supplied scientificNameId is not ValidScientificNameId");
            }

            var oldTaxonInfo = new TaxonHistory()
            {
                date = DateTime.Now,
                username = user.UserName,
                Ekspertgruppe = assessment.ExpertGroup,
                TaxonId = assessment.TaxonId,
                //TaxonRank = assessment.TaxonRank,
                TaxonRank = assessment.EvaluatedScientificNameRank,
                VitenskapeligNavn = assessment.EvaluatedScientificName,
                VitenskapeligNavnAutor = assessment.EvaluatedScientificNameAuthor,
                VitenskapeligNavnHierarki = assessment.TaxonHierarcy,
                VitenskapeligNavnId = assessment.EvaluatedScientificNameId ?? -1
            };

            assessment.EvaluatedScientificName = ti.ValidScientificName;
            assessment.EvaluatedScientificNameFormatted = ti.ValidScientificNameFormatted;
            var higherHirachy = ti
                .ScientificNameIdHiarchy.Select(x =>
                    ts.GetTaxonInfoAsync(x).GetAwaiter().GetResult())
                .Select(y => new FA4.ScientificNameWithRankId()
                {
                    ScientificName = y.ValidScientificNameFormatted,
                    Author = y.ValidScientificNameAuthorship,
                    Rank = Convert.ToInt32(y.CategoryValue)
                }).ToList();
            assessment.NameHiearchy = higherHirachy;
            assessment.EvaluatedScientificNameId = ti.ValidScientificNameId;
            assessment.EvaluatedScientificNameAuthor = ti.ValidScientificNameAuthorship;
            assessment.TaxonHierarcy = hierarcy;
            //assessment.LatinsknavnId = ti.ValidScientificNameId;
            assessment.TaxonId = ti.TaxonId;
            assessment.EvaluatedScientificNameRank = rank;
            assessment.EvaluatedVernacularName = ti.PrefferedPopularname;

            assessment.TaxonomicHistory.Add(oldTaxonInfo);

            return assessment;
        }

        /// <summary>
        /// Move an assessment with specific id to a new taxon
        /// </summary>
        /// <param name="value"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("{id}/move")]
        public async Task<IActionResult> MoveAssessment([FromBody] Taxinfo value, int id)
        {
            var now = DateTime.Now;
            var data = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();
            if (string.IsNullOrWhiteSpace(data.Doc)) return null;

            //var doc = JsonConvert.DeserializeObject<FA4>(data.Doc);
            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);

            var role = await base.GetRoleInGroup(doc.ExpertGroup);
            try
            {
                //if (role.WriteAccess && (doc.LockedForEditBy == role.User.Brukernavn) && (doc.Ekspertgruppe == value.ExpertGroup))
                if (doc.ExpertGroup == value.Ekspertgruppe)
                {
                    int scientificNameId = value.ScientificNameId;
                    var assessment = await moveAssessment(_dbContext, value.Ekspertgruppe, role.User, scientificNameId, doc, id);
                    await StoreAssessment(id, assessment, role.User, true, true);
                    // 5 lagre
                }
                else
                {
                    throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
                }
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }
            return Ok();
        }


        /// <summary>
        /// Move an assesment between horizontscanning and full assessment
        /// </summary>
        /// <param name="id"></param>
        /// <param name="doorknockerstate">"potentialDoorknocker" or "not/anything". If "potentialDoorknocker" then towards horizontscanning - whatever else back to full assessment</param>
        /// <returns></returns>
        [HttpGet("{id}/movehorizon/{doorknockerstate}")]
        public async Task<IActionResult> MoveHorizon(int id, string doorknockerstate)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();
            if (string.IsNullOrWhiteSpace(data.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);
            var role = await GetRoleInGroup(doc.ExpertGroup);
            var force = role.Admin || role.User.IsAdmin;
            try
            {
                if (role.WriteAccess || force)
                {
                    if (doorknockerstate == "potentialDoorknocker")
                    {
                        // til doorknocker
                        doc.HorizonDoScanning = true;
                        doc.HorizonScanningStatus = "notStarted";
                        doc.AlienSpeciesCategory = "DoorKnocker";
                    }
                    else
                    {
                        // fra horizon til ordinær
                        doc.HorizonDoScanning = false;
                        if (doc.AlienSpeciesCategory == "DoorKnocker")
                        {
                            doc.AlienSpeciesCategory = "AlienSpecie";
                        }
                    }
                    doc.IsAlienSpecies = true;
                    doc.ConnectedToAnother = false;
                    doc.SpeciesStatus = "C2";
                    doc.AlienSpecieUncertainIfEstablishedBefore1800 = false;
                    doc.RiskAssessment.RiskLevelCode = "";
                    doc.RiskAssessment.RiskLevelText = "";
                    doc.LastUpdatedAt = DateTime.Now;
                    data.Doc = JsonSerializer.Serialize(doc);
                    data.LastUpdatedAt = doc.LastUpdatedAt;
                    data.ChangedAt = DateTime.Now;
                    var timestamp = _dbContext.TimeStamp.Single();
                    timestamp.DateTimeUpdated = data.ChangedAt;
                    await _dbContext.SaveChangesAsync();
                    return Ok();

                }
                else
                {
                    throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
                }
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }

            return Ok();
        }


        /// <summary>
        /// Clone an existing assessment into the testarter expertgroup
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/copytotestarter")]
        public async Task<IActionResult> CopyToTestarter(int id)
        {
            var assessment = await Get(id);
            assessment.ExpertGroup = "Testarter"; // dont change any other property for this purpose
            var role = await GetRoleInGroup("Testarter");
            try
            {
                if (role.WriteAccess)
                {
                    var scientificnameid =
                        assessment.EvaluatedScientificNameId; // .LatinsknavnId; // doc.VurdertVitenskapeligNavnId;
                    var existingAssessment = await _dbContext.Assessments.Where(x => x.Expertgroup == "Testarter")
                        .Where(x => x.ScientificNameId == scientificnameid).Select(x => x.Doc).FirstOrDefaultAsync();
                    if (existingAssessment != null)
                    {
                        var doc = JsonSerializer.Deserialize<FA4>(existingAssessment);
                        //var existingid = doc.Id; // int.Parse(doc.Id);
                        // Just delete the existing assessment with same name (in Testarter)
                        await DeleteAssessment(doc.Id);
                    }

                    var copiedassessment = JsonSerializer.Serialize(assessment);
                    var assessmentinfo = new Assessment();
                    assessmentinfo.Doc = copiedassessment;
                    _dbContext.Assessments.Add(assessmentinfo);
                    _dbContext.SaveChanges();
                }
                else
                {
                    throw new Exception("IKKE SKRIVETILGANG TIL EKSPERTGRUPPEN");
                }
            }
            catch (Exception e)
            {
                return Unauthorized(e.Message);
            }

            return Ok();
        }

        private async Task StoreAssessment(int id, FA4 doc, User user, bool notUpdateChangedBy, bool forceStore = false)
        {
            //var dateTimeFormat = "yyyy-MM-dd HH:mm:ss";
            var now = DateTime.Now;
            //doc.LastUpdatedAt = now;

            var assessment = await _dbContext.Assessments.Include(x => x.LastUpdatedByUser)
                .Include(x => x.LockedForEditByUser).Include(x => x.Comments).ThenInclude(x => x.User).SingleOrDefaultAsync(x => x.Id == id);

            if (!forceStore && assessment.LockedForEditByUser != null && assessment.LockedForEditByUser.Id != user.Id)
                throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN - Låst av annen bruker");

            var realUser = await _dbContext.Users.SingleOrDefaultAsync(x => x.Id == user.Id);
            // check and update referenceUsages
            var usedReferences = doc.References.Select(x => x.ReferenceId).Distinct().ToArray();
            if (!forceStore && usedReferences.Any())
            {
                bool ok = await _referenceService.SignalUsage(usedReferences, user.Id);
            }

            var curAss = JsonSerializer.Deserialize<FA4>(assessment.Doc);

            byte[] zipfile;
            var fileName = "ArtskartData.zip";
            const string name = "Datagrunnlag fra Artskart";
            const string filetype = "application/zip";

            if (!forceStore && doc.ArtskartSistOverført != curAss.ArtskartSistOverført)
            {
                try
                {
                    zipfile = await TaskHelper.TimeoutAfter(ArtskartHelper.GetZipDataFromArtskart(doc), TimeSpan.FromSeconds(10));
                }
                catch
                {
                    // ok here
                    zipfile = Array.Empty<byte>();
                }

                if (zipfile.Length > 0)
                {
                    var attach = await _dbContext.Attachments.Where(x =>
                        x.AssessmentId == assessment.Id && x.Name == name && x.Type == filetype &&
                        x.FileName == fileName).FirstOrDefaultAsync();
                    if (attach != null)
                    {
                        attach.File = zipfile;
                        attach.IsDeleted = false;
                        attach.Date = DateTime.Now;
                        attach.UserId = user.Id;
                    }
                    else
                    {
                        attach = new Attachment
                        {
                            AssessmentId = assessment.Id,
                            Date = DateTime.Now,
                            File = zipfile,
                            FileName = fileName,
                            Name = name,
                            Type = filetype,
                            UserId = user.Id
                        };
                        _dbContext.Attachments.Add(attach);
                    }
                }

                }
                //var test = _dbContext.AssessmentHistories.ToArray();
                var history = new AssessmentHistory
            {
                Id = assessment.Id,
                Doc = assessment.Doc,
                HistoryAt = now,
                UserId = assessment.LastUpdatedByUserId
            };

            _dbContext.AssessmentHistories.Add(history);

            if (!notUpdateChangedBy)
            {
                doc.EvaluationStatus = "inprogress";
                doc.LastUpdatedAt = now;
                doc.LastUpdatedBy = realUser.FullName;
                assessment.LastUpdatedAt = doc.LastUpdatedAt;
                assessment.LastUpdatedByUserId = realUser.Id;
                assessment.LastUpdatedByUser = realUser;
            }

            assessment.LockedForEditAt = doc.LockedForEditAt;
            assessment.LockedForEditByUserId = doc.LockedForEditByUserId;
            if (assessment.LockedForEditByUserId.HasValue)
            {
                if (assessment.LockedForEditByUserId.Value == realUser.Id && assessment.LockedForEditByUser == null)
                    assessment.LockedForEditByUser = realUser;
                else if (assessment.LockedForEditByUserId.Value != realUser.Id &&
                         assessment.LockedForEditByUser == null)
                    assessment.LockedForEditByUser = await
                        _dbContext.Users.SingleOrDefaultAsync(x => x.Id == assessment.LockedForEditByUserId.Value);
            }

            var assessmentString = JsonSerializer.Serialize(doc);
            assessment.Doc = assessmentString;
            assessment.ChangedAt = DateTime.Now;
            assessment.IsDeleted = doc.IsDeleted;
            var timestamp = _dbContext.TimeStamp.Single();
            timestamp.DateTimeUpdated = assessment.ChangedAt;
            await _dbContext.SaveChangesAsync().ConfigureAwait(false);
            IndexHelper.Index(assessment, _index);
        }

        private static FA4 CreateNewAssessment(string expertgroup, User user, int scientificNameId, bool DoorKnocker)
        {
            if (string.IsNullOrWhiteSpace(expertgroup)) throw new ArgumentNullException(nameof(expertgroup));
            if (user == null) throw new ArgumentNullException(nameof(user));
            var vurderingscontext = expertgroup.Contains("Svalbard") ? "S" : "N";
            var vurderingsår = 2021;
            var createdby = "createdbyloading";

            var ts = new TaxonService();
            var titask = ts.GetTaxonInfoAsync(scientificNameId);
            var ti = titask.GetAwaiter().GetResult();
            var (hierarcy, rank) = TaxonService.GetFullPathScientificName(ti);


            if (scientificNameId != ti.ValidScientificNameId)
                throw new ArgumentException("supplied scientificNameId is not ValidScientificNameId");

            var rl = FA4.CreateNewFA4();

            rl.ExpertGroup = expertgroup;
            rl.EvaluationContext = vurderingscontext;
            rl.IsDeleted = false;
            rl.LastUpdatedAt = DateTime.Now;
            rl.LastUpdatedBy = user.FullName;

            rl.EvaluationStatus = "created";
            if (DoorKnocker)
            {
                rl.HorizonDoScanning = true;
                rl.HorizonScanningStatus = "notStarted";
            }

            rl.EvaluatedScientificName = ti.ValidScientificName;
            rl.EvaluatedScientificNameId = ti.ValidScientificNameId;
            rl.EvaluatedScientificNameAuthor = ti.ValidScientificNameAuthorship;
            rl.TaxonHierarcy = hierarcy;
            rl.TaxonId = ti.TaxonId;
            //rl.TaxonRank = rank;
            rl.EvaluatedVernacularName = ti.PrefferedPopularname;

            return rl;
        }

        /// <summary>
        /// Checks ExtensionData for fields not mapped - feature of system.text.json
        /// </summary>
        private void ThrowErrorIfUnknownPropertiesOnModelIsPostedOnLocalhostAndTestServer(FA4 value)
        {
            if (value.ExtensionData != null || value.RiskAssessment.ExtensionData != null)
            {
                if (this.Request.Host.Host == "localhost" || this.Request.Host.Host.Contains("test"))
                {
                    if (value.ExtensionData != null)
                        foreach (var element in value.ExtensionData.Where(element =>
                                     !_knownExtraFields.Contains(element.Key)))
                        {
                            throw new Exception("New nonmapped field on Fa4:" + element.Key);
                        }

                    if (value.RiskAssessment.ExtensionData != null)
                        foreach (var element in value.RiskAssessment.ExtensionData.Where(element =>
                                     !_knownExtraFields.Contains(element.Key)))
                        {
                            throw new Exception("New nonmapped field on Fa4.RiskAssessment:" + element.Key);
                        }
                }

                value.ExtensionData = null;
                value.RiskAssessment.ExtensionData = null;
            }
        }

        public class Taxinfo
        {
            public int ScientificNameId { get; set; }

            //public string ExpertGroup { get; set; }
            public string Ekspertgruppe { get; set; }
            public string RedListCategory { get; set; }
            public string ScientificName { get; set; }
            public string ScientificNameAuthor { get; set; }
            public int? TaxonId { get; set; }
            public string TaxonRank { get; set; }
            public string VernacularName { get; set; }
            public string potensiellDørstokkart { get; set; } //: "potentialDoorknocker"
        }
    }
}