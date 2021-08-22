using System;
using System.Linq;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Prod.Api.Services;
using Prod.Data.EFCore;
using Prod.Domain;
using Microsoft.AspNetCore.SignalR;
using Prod.Api.Hubs;
// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

namespace Prod.Api.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class AssessmentController : AuthorizeApiController
    {

        private readonly ProdDbContext _dbContext;
        private readonly IReferenceService _referenceService;
        private readonly IHubContext<MessageHub> _hubContext;

        public AssessmentController(IDiscoveryCache discoveryCache, ProdDbContext dbContext, IReferenceService referenceService, IHubContext<MessageHub> hubContext) : base(discoveryCache, dbContext)
        //public AssessmentController(IDiscoveryCache discoveryCache, ProdDbContext dbContext, IReferenceService referenceService) : base(discoveryCache, dbContext)
        {
            _dbContext = dbContext;
            _referenceService = referenceService;
            _hubContext = hubContext;
        }

        private Task SendMessage(string context, string message)
        {
            return _hubContext.Clients.All.SendAsync("ReceiveMessage", context, message);
        }

        // GET api/assessment/5
        [HttpGet("{id}")]
        public async Task<FA4> Get(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id).Select(x => x.Doc).FirstOrDefaultAsync();// _dataService.GetAssessmentString(id);
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




            await this.SendMessage("assessment", "open");

            // Safeguard
            if(doc.Id != id && doc.Id != 0)
            {
                throw new Exception("Id is corrupt (" + id + "/" + doc.Id + ")");
            }

            doc.Id = id;

            return doc;
        }

        [HttpGet("{id}/lock")]
        public async Task<IActionResult> Lock(int id)
        {
            var assessment = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();// _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(assessment.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(assessment.Doc);
            var role = await base.GetRoleInGroup(doc.ExpertGroup);

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
        [HttpGet("{id}/unlock")]
        public async Task<IActionResult> UnLock(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();// _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);
            var role = await base.GetRoleInGroup(doc.ExpertGroup);
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
        [HttpGet("{id}/finish")]
        public async Task<IActionResult> Finish(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();// _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);
            var role = await base.GetRoleInGroup(doc.ExpertGroup);
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
        //[HttpGet("{id}/delete")]
        //public async Task<IActionResult> Delete(int id)
        //{
        //    var data = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();// _dataService.GetAssessmentString(id);
        //    if (string.IsNullOrWhiteSpace(data.Doc)) return null;

        //    var doc = JsonConvert.DeserializeObject<Rodliste2019>(data.Doc);
        //    var role = await base.GetRoleInGroup(doc.ExpertGroup);
        //    var force = role.User.ErAdministrator;
        //    try
        //    {
        //        if (force)
        //        {
        //            doc.Slettet = true;
        //            await StoreAssessment(id, doc, role.User, false, true);
        //            await _dbContext.SaveChangesAsync();
        //        }
        //        else
        //        {
        //            throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        return Unauthorized(e.Message);
        //    }

        //    return Ok();
        //}
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
            var data = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();// _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data.Doc))
            {
                return false;
            }
            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);

            //if (doc.Ekspertgruppe != "Testarter")
            //{
            //    throw new Exception("KAN KUN SLETTE TESTARTER");  // for testing!. Fjern denne begrensningen når det blir behov.
            //}

            var role = await base.GetRoleInGroup(doc.ExpertGroup);
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
        [HttpGet("{id}/unfinish")]
        public async Task<IActionResult> Unfinish(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id)
                .FirstOrDefaultAsync(); // _dataService.GetAssessmentString(id);
            if (string.IsNullOrWhiteSpace(data.Doc)) return null;

            var doc = JsonSerializer.Deserialize<FA4>(data.Doc);
            var role = await base.GetRoleInGroup(doc.ExpertGroup);
            var force = role.Admin || role.User.IsAdmin;
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
        //// POST api/assessment
        //[HttpPost]
        //public void Post([FromBody]string value)
        //{
        //}

        //// PUT api/assessment/5
        //[HttpPut("{id}")]
        //public void Put____(int id, [FromBody]string value)
        //{
        //}

        [HttpPost("{id}")]
        public async Task<IActionResult> Post(string id, [FromBody] FA4 value)
        {
            var role = await base.GetRoleInGroup(value.ExpertGroup);
            try
            {
                if (role.WriteAccess)
                {
                    await StoreAssessment(int.Parse(id), value, role.User, false);
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




            await this.SendMessage("assessment", "save");




            return Ok();
        }

        public class Taxinfo
        {
            public string ScientificNameId { get; set; }
            public string Ekspertgruppe { get; set; }
            public string ExpertGroup { get; set; }
        }



        [HttpPost("createnew")]
        public async Task<IActionResult> CreateNewAssessment([FromBody] Taxinfo value)
        {
            var now = DateTime.Now;
            var role = await base.GetRoleInGroup(value.ExpertGroup);
            var scientificNameId = int.Parse(value.ScientificNameId);
            try
            {
                if (role.WriteAccess)
                {
                    var userId = role.User.Id;
                    var rlRodliste2019 = CreateNewAssessment(value.Ekspertgruppe, userId, scientificNameId);
                    rlRodliste2019.EvaluationStatus = "created";
                    rlRodliste2019.LastUpdatedAt = now;
                    var doc = JsonSerializer.Serialize(rlRodliste2019);
                    var assessment = new Assessment();
                    assessment.Doc = doc;
                    _dbContext.Assessments.Add(assessment);
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
        [HttpGet("{id}/copytotestarter")]
        public async Task<IActionResult> CopyToTestarter(int id)
        {
            var assessment = await Get(id);
            assessment.ExpertGroup = "Testarter"; // dont change any other property for this purpose
            var role = await base.GetRoleInGroup("Testarter");
            try
            {
                if (role.WriteAccess)
                {
                    var scientificnameid = assessment.EvaluatedScientificNameId; // .LatinsknavnId; // doc.VurdertVitenskapeligNavnId;
                    var existingAssessment = await _dbContext.Assessments.Where(x => x.Expertgroup == "Testarter").Where(x => x.ScientificNameId == scientificnameid).Select(x => x.Doc).FirstOrDefaultAsync();
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

        //private async Task StoreAssessment(int id, FA4 doc, User user, bool notUpdateChangedBy, bool forceStore = false)
        //{
        //    //todo: implement. see below 
        //}


        private async Task StoreAssessment(int id, FA4 doc, User user, bool notUpdateChangedBy, bool forceStore = false)
        {
            //var dateTimeFormat = "yyyy-MM-dd HH:mm:ss";
            var now = DateTime.Now;
            doc.LastUpdatedAt = now;

            var assessment = _dbContext.Assessments.SingleOrDefault(x => x.Id == id);

            if (!forceStore && (assessment.LockedForEditByUser != null && assessment.LockedForEditByUser.Id != user.Id))
            {
                throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN - Låst av annen bruker");
            }


            //// check and update referenceUsages
            //var usedReferences = doc.References.Select(x => x.ReferenceId).ToArray();
            //if (!forceStore && usedReferences.Any())
            //{
            //    bool ok = await _referenceService.SignalUsage(usedReferences, user.Id);
            //}

            var curAss = JsonSerializer.Deserialize<FA4>(assessment.Doc);

            byte[] zipfile;
            var fileName = "ArtskartData.zip";
            const string name = "Datagrunnlag fra Artskart";
            const string filetype = "application/zip";

            //if (!forceStore && doc.ArtskartSistOverført != curAss.ArtskartSistOverført)
            //{
            //    try
            //    {
            //        zipfile = await TaskHelper.TimeoutAfter(GetZipDataFromArtskart(doc), TimeSpan.FromSeconds(10));
            //    }
            //    catch
            //    {
            //        // ok here
            //        zipfile = Array.Empty<byte>();
            //    }

            //    if (zipfile.Length > 0)
            //    {
            //        var attach = await _dbContext.Attachments.Where(x =>
            //            x.AssessmentId == assessment.Id && x.Name == name && x.Type == filetype &&
            //            x.FileName == fileName).FirstOrDefaultAsync();
            //        if (attach != null)
            //        {
            //            attach.File = zipfile;
            //            attach.IsDeleted = false;
            //            attach.Date = DateTime.Now;
            //            attach.UserId = user.Id;
            //        }
            //        else
            //        {
            //            attach = new Attachment
            //            {
            //                AssessmentId = assessment.Id,
            //                Date = DateTime.Now,
            //                File = zipfile,
            //                FileName = fileName,
            //                Name = name,
            //                Type = filetype,
            //                UserId = user.Id
            //            };
            //            _dbContext.Attachments.Add(attach);
            //        }
            //    }

            //}
            //var test = _dbContext.AssessmentHistories.ToArray();
            var history = new AssessmentHistory()
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
                doc.LastUpdatedBy = user.UserName;
                assessment.LastUpdatedAt = doc.LastUpdatedAt;
                assessment.LastUpdatedByUserId = user.Id;
            }

            assessment.LockedForEditAt = doc.LockedForEditAt;
            assessment.LockedForEditByUserId = doc.LockedForEditByUserId;

            var assessmentString = JsonSerializer.Serialize(doc);
            assessment.Doc = assessmentString;
            await _dbContext.SaveChangesAsync().ConfigureAwait(false);

        }
        //private static async Task<byte[]> GetZipDataFromArtskart(FA4 rlRodliste2019)
        //{
        //    // hent datasett fra artskart
        //    var date = DateTime.Parse(rlRodliste2019.ArtskartSistOverført);
        //    var kriterier = rlRodliste2019.ArtskartModel;

        //    var apibase =
        //        "https://artskart.artsdatabanken.no/PublicApi/api/listhelper/";
        //    var type =
        //        kriterier.IncludeObjects == kriterier.IncludeObservations
        //            ? "all"
        //            : kriterier.IncludeObjects
        //                ? "specimen"
        //                : "observations";
        //    var region =
        //        kriterier.IncludeNorge == kriterier.IncludeSvalbard
        //            ? "all"
        //            : kriterier.IncludeNorge
        //                ? "fastland"
        //                : "svalbard";
        //    var excludeGbif =
        //    kriterier.ExcludeGbif ? "&sourcedatabases[]=-40,-211" : "";
        //    var queryparams =
        //        $"&fromYear={kriterier.ObservationFromYear}&toYear={kriterier.ObservationToYear}&fromMonth={kriterier.FromMonth}&toMonth={kriterier.ToMonth}&type={type}&region={region}{excludeGbif}";
        //    queryparams += $"&scientificNameId={rlRodliste2019.VurdertVitenskapeligNavnId}";

        //    if (!string.IsNullOrWhiteSpace(rlRodliste2019.ArtskartSelectionGeometry))
        //    {
        //        queryparams += $"&geojsonPolygon=";
        //        dynamic json = JsonConvert.DeserializeObject(rlRodliste2019.ArtskartSelectionGeometry);
        //        dynamic coordinates = json.geometry.coordinates;
        //        dynamic items = coordinates[0];
        //        foreach (dynamic item in items)
        //        {
        //            foreach (dynamic o in item)
        //            {
        //                string s = o.ToString();
        //                queryparams += s.Replace(",", ".") + ",";
        //            }
        //        }

        //        queryparams = queryparams.Substring(0, queryparams.Length - 1);
        //    }

        //    if (!string.IsNullOrWhiteSpace(rlRodliste2019.ArtskartAdded))
        //    {
        //        queryparams += $"&addPoints={rlRodliste2019.ArtskartAdded}";
        //    }

        //    if (!string.IsNullOrWhiteSpace(rlRodliste2019.ArtskartRemoved))
        //    {
        //        queryparams += $"&removePoints={rlRodliste2019.ArtskartRemoved}";
        //    }

        //    var urlen = apibase + rlRodliste2019.TaxonId + "/downloadObservations/?" + queryparams;
        //    using var client = new HttpClient();

        //    var zipfile = await client.GetByteArrayAsync(urlen);
        //    return zipfile;
        //}

        private static FA4 CreateNewAssessment(string expertgroup, Guid userId, int scientificNameId)
        {
            if (string.IsNullOrWhiteSpace(expertgroup))
            {
                throw new ArgumentNullException(nameof(expertgroup));
            }
            if (userId == Guid.Empty)
            {
                throw new ArgumentNullException(nameof(userId));
            }
            var vurderingscontext = expertgroup.Contains("Svalbard") ? "S" : "N";
            var vurderingsår = 2021;
            var createdby = "createdbyloading";

            var ts = new Prod.Api.Services.TaxonService();
            var titask = ts.GetTaxonInfoAsync(scientificNameId);
            var ti = titask.GetAwaiter().GetResult();
            var (hierarcy, rank) = TaxonService.GetFullPathScientificName(ti);


            if (scientificNameId != ti.ValidScientificNameId)
            {
                throw new ArgumentException("supplied scientificNameId is not ValidScientificNameId");
            }

            var rl = new FA4();

            //rl.Ekspertgruppe = expertgroup;
            //rl.VurderingsContext = vurderingscontext;
            //rl.Slettet = false;
            //rl.LastUpdatedOn = DateTime.Now;
            //rl.LastUpdatedBy = userName;
            //rl.Vurderingsår = vurderingsår;
            //rl.SistVurdertAr = vurderingsår;
            //rl.EvaluationStatus = createdby;
            //rl.OverordnetKlassifiseringGruppeKode = "rodlisteVurdertArt";
            //rl.RodlisteVurdertArt = "etablertBestandINorge";
            //rl.VurdertVitenskapeligNavn = ti.ValidScientificName;
            //rl.VurdertVitenskapeligNavnId = ti.ValidScientificNameId;
            //rl.VurdertVitenskapeligNavnAutor = ti.ValidScientificNameAuthorship;
            //rl.VurdertVitenskapeligNavnHierarki = hierarcy;
            //rl.TaxonId = ti.TaxonId;
            //rl.TaxonRank = rank;
            //rl.PopularName = ti.PrefferedPopularname;

            ////ekstra standardverdier
            //rl.ImportInfo.VurderingsId2015 = string.Empty;
            //rl.AndelNåværendeBestand = "-";
            //rl.A1OpphørtOgReversibel = "-";
            //rl.A2Forutgående10År = "-";
            //rl.A3Kommende10År = "-";
            //rl.A4Intervall10År = "-";
            //rl.BA2FåLokaliteterProdukt = "";
            //rl.B1BeregnetAreal = "";
            //rl.B1UtbredelsesområdeKode = "-";
            //rl.B2ForekomstarealKode = "-";
            //rl.BA1KraftigFragmenteringKode = "-";
            //rl.BA2FåLokaliteterKode = "-";
            //rl.CVurdertpopulasjonsstørrelseProdukt = "";
            //rl.C1PågåendePopulasjonsreduksjonKode = "-";
            //rl.C2A1PågåendePopulasjonsreduksjonKode = "-";
            //rl.D1FåReproduserendeIndividKode = "-";
            //rl.D2MegetBegrensetForekomstarealKode = "-";
            //rl.EKvantitativUtryddingsmodellKode = "-";

            ////gudene vet om disse har betydning:
            //rl.WktPolygon = "";
            //rl.SistVurdertAr = 2021;
            //rl.C2A2PågåendePopulasjonsreduksjonKode = "-";
            //rl.C2BPågåendePopulasjonsreduksjonKode = "-";
            //rl.CPopulasjonsstørrelseKode = "-";
            //rl.B2ForekomstarealProdukt = "";
            //rl.B1UtbredelsesområdeProdukt = "";
            //rl.OppsummeringAKriterier = "";
            //rl.OppsummeringBKriterier = "";
            //rl.OppsummeringCKriterier = "";
            //rl.OppsummeringDKriterier = "";
            //rl.OppsummeringEKriterier = "";
            //rl.B2BeregnetAreal = "";
            //if (rl.Ekspertgruppe == "Leddormer") // special case - ville ha LC som standard
            //{
            //    rl.C2A2SannhetsverdiKode = "1";
            //    rl.OverordnetKlassifiseringGruppeKode = "sikkerBestandLC";
            //    rl.Kategori = "LC";
            //}

            //AddFylkeslister(rl);
            //rl.NaturtypeHovedenhet = new List<string>();
            //SetArtskartImportSettings(rl);
            return rl;
        }

        //private async Task<FA4> moveAssessment(ProdDbContext dbContext, string expertgroup, User user,
        //    int scientificNameId, FA4 assessment, int assessmentId) // change taxonomic info
        //{
        //    if (string.IsNullOrWhiteSpace(expertgroup))
        //    {
        //        throw new ArgumentNullException("expertgroup");
        //    }
        //    if (user == null)
        //    {
        //        throw new ArgumentNullException("user");
        //    }
        //    var existingAssessment = await dbContext.Assessments.Where(x => x.ScientificNameId == scientificNameId && x.Expertgroup == expertgroup && x.IsDeleted == false).Select(x => x.Id).FirstOrDefaultAsync();
        //    if (existingAssessment > 0 && existingAssessment != assessmentId)
        //    {
        //        throw new ArgumentException("supplied scientificNameId already exists in database");
        //    }



        //    var ts = new Prod.Api.Services.TaxonService();
        //    var titask = ts.GetTaxonInfoAsync(scientificNameId);
        //    var ti = titask.GetAwaiter().GetResult();
        //    var (hierarcy, rank) = TaxonService.GetFullPathScientificName(ti);

        //    if (scientificNameId != ti.ValidScientificNameId)
        //    {
        //        throw new ArgumentException("supplied scientificNameId is not ValidScientificNameId");
        //    }

        //    var oldTaxonInfo = new FA4.TaxonHistory()
        //    {
        //        date = DateTime.Now,
        //        username = user.Brukernavn,
        //        Ekspertgruppe = assessment.Ekspertgruppe,
        //        TaxonId = assessment.TaxonId,
        //        TaxonRank = assessment.TaxonRank,
        //        VitenskapeligNavn = assessment.VurdertVitenskapeligNavn,
        //        VitenskapeligNavnAutor = assessment.VurdertVitenskapeligNavnAutor,
        //        VitenskapeligNavnHierarki = assessment.VurdertVitenskapeligNavnHierarki,
        //        VitenskapeligNavnId = assessment.VurdertVitenskapeligNavnId
        //    };

        //    assessment.VurdertVitenskapeligNavn = ti.ValidScientificName;
        //    assessment.VurdertVitenskapeligNavnId = ti.ValidScientificNameId;
        //    assessment.VurdertVitenskapeligNavnAutor = ti.ValidScientificNameAuthorship;
        //    assessment.VurdertVitenskapeligNavnHierarki = hierarcy;
        //    assessment.LatinsknavnId = ti.ValidScientificNameId;
        //    assessment.TaxonId = ti.TaxonId;
        //    assessment.TaxonRank = rank;
        //    assessment.PopularName = ti.PrefferedPopularname;

        //    assessment.TaxonomicHistory.Add(oldTaxonInfo);

        //    return assessment;
        //}

        //[HttpPost("{id}/move")]
        //public async Task<IActionResult> MoveAssessment([FromBody] Taxinfo value, int id)
        //{
        //    var now = DateTime.Now;
        //    var data = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();
        //    if (string.IsNullOrWhiteSpace(data.Doc)) return null;

        //    var doc = JsonConvert.DeserializeObject<FA4>(data.Doc);
        //    var role = await base.GetRoleInGroup(doc.ExpertGroup);
        //    try
        //    {
        //        //if (role.WriteAccess && (doc.LockedForEditBy == role.User.Brukernavn) && (doc.Ekspertgruppe == value.ExpertGroup))
        //        if (doc.Ekspertgruppe == value.ExpertGroup)
        //        {
        //            int scientificNameId = int.Parse(value.ScientificNameId);
        //            var assessment = await moveAssessment(_dbContext, value.Ekspertgruppe, role.User, scientificNameId, doc, id);
        //            await StoreAssessment(id, assessment, role.User, true, true);
        //            // 5 lagre
        //        }
        //        else
        //        {
        //            throw new Exception("IKKE SKRIVETILGANG TIL DENNE VURDERINGEN");
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        return Unauthorized(e.Message);
        //    }
        //    return Ok();
        //}

        //internal static void AddFylkeslister(FA4 assessment)
        //{
        //    var fylker =
        //    new Dictionary<string, FA4.Fylkesforekomst>()
        //    {
        //        {"Trøndelag", new FA4.Fylkesforekomst() {Fylke = "Tø", State = 2}},
        //        {"Nordland", new FA4.Fylkesforekomst() {Fylke = "No", State = 2}},
        //        {"Finnmark", new FA4.Fylkesforekomst() {Fylke = "Fi", State = 2}},
        //        {"Troms", new FA4.Fylkesforekomst() {Fylke = "Tr", State = 2}},
        //        {"Hedmark", new FA4.Fylkesforekomst() {Fylke = "He", State = 2}},
        //        {"Oppland", new FA4.Fylkesforekomst() {Fylke = "Op", State = 2}},
        //        {"Møre og Romsdal", new FA4.Fylkesforekomst() {Fylke = "Mr", State = 2}},
        //        {"Sogn og Fjordane", new FA4.Fylkesforekomst() {Fylke = "Sf", State = 2}},
        //        {"Hordaland", new FA4.Fylkesforekomst() {Fylke = "Ho", State = 2}},
        //        {"Buskerud", new FA4.Fylkesforekomst() {Fylke = "Bu", State = 2}},
        //        {"Oslo og Akershus", new FA4.Fylkesforekomst() {Fylke = "OsA", State = 2}},
        //        {"Østfold", new FA4.Fylkesforekomst() {Fylke = "Øs", State = 2}},
        //        {"Vestfold", new FA4.Fylkesforekomst() {Fylke = "Ve", State = 2}},
        //        {"Telemark", new FA4.Fylkesforekomst() {Fylke = "Te", State = 2}},
        //        {"Aust-Agder", new FA4.Fylkesforekomst() {Fylke = "Aa", State = 2}},
        //        {"Vest-Agder", new FA4.Fylkesforekomst() {Fylke = "Va", State = 2}},
        //        {"Rogaland", new FA4.Fylkesforekomst() {Fylke = "Ro", State = 2}},
        //        {"Nordsjøen", new FA4.Fylkesforekomst() {Fylke = "Ns", State = 2}},
        //        {"Norskehavet", new FA4.Fylkesforekomst() {Fylke = "Nh", State = 2}},
        //        {"asdfs", new FA4.Fylkesforekomst() {Fylke = "Gh", State = 2}},
        //        {"Polhavet", new FA4.Fylkesforekomst() {Fylke = "Bn", State = 2}},
        //        {"Barentshavet", new FA4.Fylkesforekomst() {Fylke = "Bs", State = 2}}
        //    };

        //    assessment.Fylkesforekomster = new List<FA4.Fylkesforekomst>();
        //    foreach (var fylkesforekomst in fylker)
        //    {
        //        var valueFylke = fylkesforekomst.Value.Fylke;
        //        assessment.Fylkesforekomster.Add(new FA4.Fylkesforekomst()
        //        { Fylke = valueFylke, State = 2 });
        //    }
        //}

        //private static void SetArtskartImportSettings(FA4 assessment)
        //{
        //    if (assessment.Ekspertgruppe.ToLowerInvariant().Contains("svalbard"))
        //    {
        //        assessment.ArtskartModel.IncludeNorge = false;
        //        return;
        //    }
        //    if (assessment.Ekspertgruppe.ToLowerInvariant().Contains("norge"))
        //    {
        //        assessment.ArtskartModel.IncludeSvalbard = false;
        //    }

        //    if (assessment.Ekspertgruppe == "Amfibier, reptiler")
        //    {
        //        assessment.ArtskartModel.ObservationFromYear = 1960;
        //    }
        //    if (assessment.Ekspertgruppe == "Biller")
        //    {
        //        assessment.ArtskartModel.ObservationFromYear = 1970;
        //    }
        //    if (assessment.Ekspertgruppe == "Vepser")
        //    {
        //        assessment.ArtskartModel.ObservationFromYear = 1970;
        //    }
        //    if (assessment.Ekspertgruppe.StartsWith("Fugler"))
        //    {
        //        assessment.ArtskartModel.ObservationFromYear = 1901;
        //    }
        //    if (assessment.Ekspertgruppe.StartsWith("Pattedyr"))
        //    {
        //        assessment.ArtskartModel.ObservationFromYear = 1901;
        //    }
        //}
    }
}
