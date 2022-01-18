using Prod.Data.EFCore;
using Prod.Domain;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;

namespace SwissKnife.Database
{
    internal static class MaintenanceService
    {
        //private readonly SqlServerProdDbContext _database;
        private const string PotensiellTaksonomiskEndring = "Potensiell taksonomisk endring: ";
        private const string TaksonomiskEndring = "Automatisk endring av navn: ";

        //public MaintenanceService(string connectionString)
        //{
        //    _database = new Prod.Data.EFCore.SqlServerProdDbContext(connectionString);
        //}

        internal static void RunTaxonomyWash(SqlServerProdDbContext _database, bool firstrun = false)
        {
            var ts = new TaksonService();
            var batchSize = 1000;
            var pointer = 0;
            var commentdatetime = DateTime.MinValue;
            while (true)
            {
                var batchChanges = false;
                Console.WriteLine(pointer);
                _database.ChangeTracker.Clear();
                var assessments = _database.Assessments.OrderBy(x => x.Id).Skip(pointer).Take(batchSize).ToArray();
                if (assessments.Length == 0)
                {
                    break;
                }
                pointer+= assessments.Length;

                foreach (var item in assessments)
                {
                    var doc = System.Text.Json.JsonSerializer.Deserialize<FA4>(item.Doc);
                    var prosessContext = new ProsessContext { assessment = doc, changes = false, DbAssessment = item, dbcontext = _database, historyWorthyChanges = false };

                    var result = prosessContext
                        //.BatchSetAssessmentsToResult()
                        .CheckTaxonomyForChanges(ts, firstrun);
                        //.CheckReferencesForChanges(refDict)
                        //.DownLoadArtskartDataIfMissing()
                        //;
                    //.Fix0AndNullFields(dict)
                    //.FixArtskartUtvalg()
                    //.DownLoadArtskartDataIfMissing();

                    if (result.changes)
                    {
                        if (result.historyWorthyChanges)
                        {
                            UpdateAndCreateHistory(_database, item, result.assessment);
                        }
                        else
                        {
                            UpdateNoHistory(_database, item, result.assessment);
                        }
                        commentdatetime = item.LastUpdatedAt;
                        batchChanges = true;
                    }
                }

                if (batchChanges)
                {
                    _database.SaveChanges();
                }
            }
            if (commentdatetime > DateTime.MinValue)
            {

                var stamp = _database.TimeStamp.SingleOrDefault();
                if (stamp != null && stamp.DateTimeUpdated < commentdatetime)
                {
                    stamp.DateTimeUpdated = commentdatetime;
                }

                _database.SaveChanges();

            }
        }
        private static void UpdateAndCreateHistory(SqlServerProdDbContext dbcontext, Assessment assessment, FA4 doc)
        {
            var docLastUpdatedOn = DateTime.Now;
            var history = new AssessmentHistory() { Id = assessment.Id, Doc = assessment.Doc, HistoryAt = docLastUpdatedOn, UserId = assessment.LastUpdatedByUserId };
            dbcontext.AssessmentHistories.Add(history);

            doc.LastUpdatedAt = docLastUpdatedOn;

            assessment.Doc = System.Text.Json.JsonSerializer.Serialize(doc);
            // todo: @steinho change to ChangesDate
            assessment.LastUpdatedAt = docLastUpdatedOn;
            dbcontext.SaveChanges();
        }
        private static void UpdateNoHistory(SqlServerProdDbContext dbcontext, Assessment assessment, FA4 doc)
        {
            //var docLastUpdatedOn = DateTime.Now;
            ////var history = new AssessmentHistory() { Id = assessment.Id, Doc = assessment.Doc, HistoryAt = docLastUpdatedOn };
            ////dbcontext.AssessmentHistories.Add(history);

            //doc.LastUpdatedOn = docLastUpdatedOn;
            var docLastUpdatedOn = DateTime.Now;
            assessment.Doc = System.Text.Json.JsonSerializer.Serialize(doc);
            // todo: @steinho change to ChangesDate
            assessment.LastUpdatedAt = docLastUpdatedOn;
            dbcontext.SaveChanges();
        }

        public static ProsessContext CheckTaxonomyForChanges(this ProsessContext context,
    //Dictionary<string, Tuple<object, FA4>> dict, 
    TaksonService ts,
    bool firstRun
    )
        {
            var assessment = context.assessment;
            if (assessment.IsDeleted)
            {
                return context;
            }
            var currentTaxonomy = ts.getTaxonInfo(assessment.EvaluatedScientificNameId.Value).GetAwaiter().GetResult();

            var caseString = string.Empty;
            if (currentTaxonomy == null)
            {
                caseString +=
                    $"NB! Navnid ikke funnet {assessment.EvaluatedScientificNameId} {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor}. ";
                return context;
            }

            var preName = assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor;
            var postName = currentTaxonomy.ValidScientificName + " " + currentTaxonomy.ValidScientificNameAuthorship;
            var nameChange = !preName.Equals(postName);
                
            if (assessment.EvaluatedScientificNameId.Value != currentTaxonomy.ValidScientificNameId)
            {
                caseString +=
                    $"Navnid endret {assessment.EvaluatedScientificNameId.Value} => {currentTaxonomy.ValidScientificNameId}. {(nameChange ? preName + " => " + postName + ". " : string.Empty)}";
            }
            else
            {
                //sjekk om populærnavn eller sti er feil...
                if (currentTaxonomy.PrefferedPopularname != null && (assessment.EvaluatedVernacularName == null ||
                                                                     !assessment.EvaluatedVernacularName.Equals(currentTaxonomy
                                                                         .PrefferedPopularname)))
                {
                    Console.WriteLine(
                        $"Populærnavn {assessment.EvaluatedVernacularName} => {currentTaxonomy.PrefferedPopularname}");
                    assessment.EvaluatedVernacularName = currentTaxonomy.PrefferedPopularname;
                    context.changes = true;
                }

                var assessmentVurdertVitenskapeligNavnHierarki = TaksonService.GetFullPathScientificName(currentTaxonomy).Item1;

                if (assessmentVurdertVitenskapeligNavnHierarki != assessment.TaxonHierarcy)
                {
                    Console.WriteLine(
                        $"Sti {assessment.TaxonHierarcy} => {assessmentVurdertVitenskapeligNavnHierarki}");
                    assessment.TaxonHierarcy = assessmentVurdertVitenskapeligNavnHierarki;
                    context.changes = true;
                }
            }

            if (assessment.TaxonId > 0 && assessment.TaxonId != currentTaxonomy.TaxonId)
            {
                caseString += $"Taksonid endret {assessment.TaxonId} => {currentTaxonomy.TaxonId}. ";
            }

            if (assessment.EvaluatedScientificName != currentTaxonomy.ValidScientificName ||
                assessment.EvaluatedScientificNameAuthor != currentTaxonomy.ValidScientificNameAuthorship)
            {
                if (string.IsNullOrWhiteSpace(caseString)) // ingen endring på taxonid!
                {

                    caseString +=
                        $"Navn endret {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor} => {currentTaxonomy.ValidScientificName + " " + currentTaxonomy.ValidScientificNameAuthorship}. ";
                    // her endrer vi automagisk navn
                    UpdateTaxonomicInfoOnAssessment(assessment, currentTaxonomy);
                    //assessment.LatinsknavnId = currentTaxonomy.ValidScientificNameId;
                    context.changes = true;
                    context.historyWorthyChanges = firstRun == false;
                }
            }
            else if (!string.IsNullOrWhiteSpace(caseString))
            {
                caseString +=
                    $"Navn ikke endret {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor}. ";
            }


            if (!string.IsNullOrWhiteSpace(caseString) && !firstRun)
            {
                var endring = caseString.StartsWith("Navn endret") ? TaksonomiskEndring : PotensiellTaksonomiskEndring;
                var message = endring + caseString +
                              " http://www.artsportalen.artsdatabanken.no/#/Artsnavn/ref/" +
                              (currentTaxonomy == null
                                  ? assessment.EvaluatedScientificNameId
                                  : currentTaxonomy.ValidScientificNameId)
                              + " " +
                              (caseString.StartsWith("Navn endret")
                                  ? "Dette kan skyldes at et synonym er lagt til, at populærnavn er lagt til/endret eller lignende. Denne kommentaren er bare til opplysning og trenger ingen handling fra komitéen."
                                  : "Fremmedartsteamet trenger bekreftelse på denne endringen før vurderingen flyttes over på nytt navn. Svar på denne kommentaren eller send en mail til fremmedearter@artsdatabanken.no"
                              );

                CreateOrAddTaxonomicCommentToAssessment(context, context.DbAssessment.Id, message);
            }
            else if (context.DbAssessment != null)
            {
                RemoveTaxonomicalCommentsFromAssessment(context, context.DbAssessment.Id);
            }

            return context;
        }

        private static void UpdateTaxonomicInfoOnAssessment(FA4 assessment, TaxonInfo currentTaxonomy)
        {
            var oldTaxonInfo = new TaxonHistory()
            {
                date = DateTime.Now,
                username = "steinho",
                Ekspertgruppe = assessment.ExpertGroup,
                TaxonId = assessment.TaxonId,
                TaxonRank = assessment.EvaluatedScientificNameRank,
                VitenskapeligNavn = assessment.EvaluatedScientificName,
                VitenskapeligNavnAutor = assessment.EvaluatedScientificNameAuthor,
                VitenskapeligNavnHierarki = assessment.TaxonHierarcy,
                VitenskapeligNavnId = assessment.EvaluatedScientificNameId.Value
            };
            assessment.TaxonomicHistory.Add(oldTaxonInfo);
            assessment.EvaluatedScientificNameAuthor = currentTaxonomy.ValidScientificNameAuthorship;
            assessment.EvaluatedScientificName = currentTaxonomy.ValidScientificName;
            assessment.EvaluatedVernacularName = currentTaxonomy.PrefferedPopularname;
            assessment.TaxonHierarcy =
                TaksonService.GetFullPathScientificName(currentTaxonomy).Item1;
            assessment.TaxonId = currentTaxonomy.TaxonId;
            assessment.EvaluatedScientificNameRank = currentTaxonomy.CategoryValue;
        }

        private static void CreateOrAddTaxonomicCommentToAssessment(ProsessContext context, int dbAssessmentId, string message)
        {
            AssessmentComment eksisting = null;
            var eksistings = context.dbcontext.Comments.Where(x =>
                x.AssessmentId == dbAssessmentId
                // && x.Closed == false 
                && x.IsDeleted == false &&
                (x.Type == CommentType.TaxonomicChange || x.Type == CommentType.PotentialTaxonomicChange)).ToArray();
            if (eksistings.Length > 1)
            {
                // for mange - slett
                eksisting = eksistings[0];
                for (int i = 1; i < eksistings.Length; i++)
                {
                    context.dbcontext.Comments.Remove(eksistings[i]);
                    context.changes = true;
                }
            }
            else if (eksistings.Length == 1)
            {
                eksisting = eksistings[0];
            }


            if (eksisting == null)
            {
                eksisting = new AssessmentComment
                {
                    Comment = message,
                    AssessmentId = dbAssessmentId,
                    CommentDate = DateTime.Today,
                    // todo: put in config - think sweeden
                    UserId = new Guid("00000000-0000-0000-0000-000000000001"),
                    Type = message.StartsWith(PotensiellTaksonomiskEndring)
                        ? CommentType.PotentialTaxonomicChange
                        : CommentType.TaxonomicChange
                }; // siris id
                context.dbcontext.Comments.Add(eksisting);
                context.changes = true;
                Console.WriteLine(message);
            }
            else if (eksisting.Comment != message)
            {
                eksisting.Comment = message;
                eksisting.CommentDate = DateTime.Today;
                context.changes = true;
                Console.WriteLine(message);
            }
        }

        private static void RemoveTaxonomicalCommentsFromAssessment(ProsessContext context, int assessmentId)
        {
            var existing = context.dbcontext.Comments.SingleOrDefault(x =>
                x.AssessmentId == assessmentId && x.Closed == false && x.IsDeleted == false &&
                (x.Type == CommentType.TaxonomicChange || x.Type == CommentType.PotentialTaxonomicChange)
            );
            if (existing != null)
            {
                context.dbcontext.Comments.Remove(existing);
                context.changes = true;
            }
        }

        public class ProsessContext
        {
            public FA4 assessment { get; set; }
            public bool changes { get; set; }
            public Assessment DbAssessment { get; set; }
            public SqlServerProdDbContext dbcontext { get; set; }
            public bool historyWorthyChanges { get; set; }
        }


        public class ImportFormat
        {
            public int ScientificNameId { get; set; }
            public string ScientificName { get; set; }
            public string ScientificNameAuthor { get; set; }

        }
        public class VascularPlantsImportFormat
        {
            public string ExpertGroup { get; set; }
            public int EvaluatedScientificNameId { get; set; }
            public string EvaluatedScientificName { get; set; }
            public string EvaluatedScientificNameAuthor { get; set; }
            public string DoorknockerType { get; set; }
            public string HorizonEstablismentPotential { get; set; }
            public string HorizonEstablismentPotentialDescription { get; set; }
            public string HorizonEcologicalEffect { get; set; }
            public string HorizonEcologicalEffectDescription { get; set; }
            public string AssessedBy { get; set; }
            public string Code { get; set; }
        }

        public static void RunImportNewAssessments(SqlServerProdDbContext _database, string speciesGroup,
            string inputFolder)
        {
            var existing = _database.Assessments.Where(x=>x.IsDeleted == false).Select(x => new { x.Expertgroup, x.ScientificNameId }).ToArray();

            var theCsvConfiguration = new CsvConfiguration(new CultureInfo("nb-NO"))
            {
                Delimiter = "\t",
                Encoding = Encoding.UTF8
            };
            var taxonService = new SwissKnife.Database.TaksonService();
            var datetime = DateTime.MinValue;
            using (var reader = new StreamReader(inputFolder))
            using (var csv = new CsvReader(reader, theCsvConfiguration))
            {
                var records = csv.GetRecords<ImportFormat>();
                foreach (var importFormat in records)
                {
                    Console.WriteLine(
                        $"{importFormat.ScientificNameId} {importFormat.ScientificName} {importFormat.ScientificNameAuthor}");
                    var user = _database.Users
                        .Single(x => x.Id == new Guid("00000000-0000-0000-0000-000000000001"));
                    var fa4 = CreateNewAssessment(speciesGroup, user, importFormat.ScientificNameId, true, taxonService);
                    fa4.EvaluationStatus = "created";
                    fa4.LastUpdatedAt = DateTime.Now;
                    var doc = System.Text.Json.JsonSerializer.Serialize<FA4>(fa4);

                    var prosessContext = new ProsessContext { assessment = fa4, changes = false, DbAssessment = null, dbcontext = _database, historyWorthyChanges = false };

                    var result = prosessContext
                        //.BatchSetAssessmentsToResult()
                        .CheckTaxonomyForChanges(taxonService, true);
                    var assessment = new Assessment
                    {
                        Doc = doc,
                        LastUpdatedAt = fa4.LastUpdatedAt,
                        LastUpdatedByUserId = user.Id,
                        ScientificNameId = fa4.EvaluatedScientificNameId.Value,
                        ChangedAt = fa4.LastUpdatedAt
                    };
                    if (fa4.EvaluatedScientificNameId != importFormat.ScientificNameId || fa4.EvaluatedScientificName != importFormat.ScientificName || (fa4.EvaluatedScientificNameAuthor == null ? string.Empty : fa4.EvaluatedScientificNameAuthor.ToLowerInvariant()) != (importFormat.ScientificNameAuthor == null ? string.Empty : importFormat.ScientificNameAuthor.ToLowerInvariant()))
                    {
                        Console.WriteLine(
                            $" ERROR - not imported {fa4.EvaluatedScientificNameId} <> {importFormat.ScientificNameId}  {fa4.EvaluatedScientificName} {fa4.EvaluatedScientificNameAuthor} <> {importFormat.ScientificNameAuthor}");
                    }
                    else
                    {
                        if (existing.Any(x=>x.ScientificNameId == fa4.EvaluatedScientificNameId && x.Expertgroup == fa4.ExpertGroup))
                        {
                            Console.WriteLine(
                                $" Warn Existing Assessment {fa4.EvaluatedScientificNameId} {fa4.EvaluatedScientificName} {fa4.EvaluatedScientificNameAuthor}");
                        }
                        else
                        {
                            var exst = existing.FirstOrDefault(x => x.ScientificNameId == fa4.EvaluatedScientificNameId);
                            if (exst != null)
                            {
                                Console.WriteLine(
                                    $" There is an existing Assessment for this name in expertgroup {exst.Expertgroup} {fa4.EvaluatedScientificNameId} {fa4.EvaluatedScientificName} {fa4.EvaluatedScientificNameAuthor}");
                            }
                            _database.Assessments.Add(assessment);
                            datetime = assessment.LastUpdatedAt;
                            _database.SaveChanges();
                        }
                    }

                }

                if (datetime>DateTime.MinValue)
                {
                    var timestamp = _database.TimeStamp.Single();
                    timestamp.DateTimeUpdated = datetime;
                    _database.SaveChanges();
                }
            }
        }
        public static void RunImportHSAssessments(SqlServerProdDbContext _database, string inputFolder)
        {
            var existing = _database.Assessments.Where(x => x.IsDeleted == false).Select(x => new { x.Expertgroup, x.ScientificNameId }).ToArray();

            var theCsvConfiguration = new CsvConfiguration(new CultureInfo("nb-NO"))
            {
                Delimiter = ";",
                Encoding = Encoding.UTF8
            };
            var taxonService = new SwissKnife.Database.TaksonService();
            var datetime = DateTime.MinValue;
            using (var reader = new StreamReader(inputFolder))
            using (var csv = new CsvReader(reader, theCsvConfiguration))
            {
                var records = csv.GetRecords<VascularPlantsImportFormat>();
                foreach (var importFormat in records)
                {
                    if (importFormat.EvaluatedScientificNameAuthor == "null")
                        importFormat.EvaluatedScientificNameAuthor = null;
                    Console.WriteLine(
                        $"{importFormat.EvaluatedScientificNameId} {importFormat.EvaluatedScientificName} {importFormat.EvaluatedScientificNameAuthor}");
                    if (importFormat.Code == "S: H")
                    {
                        Console.WriteLine(
                            $"Ane ordner denne - S: H");
                        continue;
                    }

                    var horisontScanning = importFormat.Code != "S: R";
                    var user = _database.Users
                        .Single(x => x.Email == importFormat.AssessedBy);
                    var fa4 = CreateNewAssessment(importFormat.ExpertGroup, user,
                        importFormat.EvaluatedScientificNameId, horisontScanning, taxonService);
                    fa4.EvaluationStatus = "inprogress";
                    fa4.LastUpdatedAt = DateTime.Now;


                    switch (importFormat.DoorknockerType)
                    {
                        case "canNotEstablishWithin50years":
                            fa4.NotApplicableCategory = "canNotEstablishWithin50years";
                            break;
                        case "NewPotentialDoorknocker":
                            break;
                        case "NotPresentInRegion":
                            fa4.NotApplicableCategory = "NotPresentInRegion";
                            break;
                        case "traditionalProductionSpecie":
                            fa4.NotApplicableCategory = "traditionalProductionSpecie";
                            break;
                        default:
                            throw new NotImplementedException();
                    }

                    if (horisontScanning)
                    {
                        if (!string.IsNullOrWhiteSpace(importFormat.HorizonEstablismentPotential))
                            fa4.HorizonEstablismentPotential = importFormat.HorizonEstablismentPotential;
                        if (!string.IsNullOrWhiteSpace(importFormat.HorizonEstablismentPotentialDescription))
                            fa4.HorizonEstablismentPotentialDescription =
                                importFormat.HorizonEstablismentPotentialDescription;
                        if (!string.IsNullOrWhiteSpace(importFormat.HorizonEcologicalEffect))
                            fa4.HorizonEcologicalEffect = importFormat.HorizonEcologicalEffect;
                        if (!string.IsNullOrWhiteSpace(importFormat.HorizonEcologicalEffectDescription))
                            fa4.HorizonEcologicalEffectDescription = importFormat.HorizonEcologicalEffectDescription;
                    }

                    var doc = System.Text.Json.JsonSerializer.Serialize<FA4>(fa4);

                    var prosessContext = new ProsessContext
                    {
                        assessment = fa4, changes = false, DbAssessment = null, dbcontext = _database,
                        historyWorthyChanges = false
                    };

                    var result = prosessContext
                        //.BatchSetAssessmentsToResult()
                        .CheckTaxonomyForChanges(taxonService, true);
                    var assessment = new Assessment
                    {
                        Doc = doc,
                        LastUpdatedAt = fa4.LastUpdatedAt,
                        LastUpdatedByUserId = user.Id,
                        ScientificNameId = fa4.EvaluatedScientificNameId.Value,
                        ChangedAt = fa4.LastUpdatedAt
                    };
                    if (fa4.EvaluatedScientificNameId != importFormat.EvaluatedScientificNameId 
                        //||
                        //fa4.EvaluatedScientificName != importFormat.EvaluatedScientificName ||
                        //(fa4.EvaluatedScientificNameAuthor == null
                        //    ? string.Empty
                        //    : fa4.EvaluatedScientificNameAuthor.ToLowerInvariant()) !=
                        //(importFormat.EvaluatedScientificNameAuthor == null
                        //    ? string.Empty
                        //    : importFormat.EvaluatedScientificNameAuthor.ToLowerInvariant())
                        )
                    {
                        Console.WriteLine(
                            $" ERROR - not imported {fa4.EvaluatedScientificNameId} <> {importFormat.EvaluatedScientificNameId}  {fa4.EvaluatedScientificName} {fa4.EvaluatedScientificNameAuthor} <> {importFormat.EvaluatedScientificNameAuthor}");
                    }
                    else
                    {
                        var allmatch = existing.Where(x => (x.ScientificNameId == importFormat.EvaluatedScientificNameId || x.ScientificNameId == fa4.EvaluatedScientificNameId) && x.Expertgroup == fa4.ExpertGroup).ToArray();
                        //var exst = existing.SingleOrDefault(x => x.ScientificNameId == fa4.EvaluatedScientificNameId && x.Expertgroup != "Testedyr");
                        if (allmatch.Length > 0)
                        {
                            // oppdater den eksisterende
                            var ex = _database.Assessments.SingleOrDefault(x =>
                                (x.ScientificNameId == importFormat.EvaluatedScientificNameId || x.ScientificNameId == fa4.EvaluatedScientificNameId) && x.Expertgroup == fa4.ExpertGroup);
                            //var ex = allex.First();

                            var theDoc = System.Text.Json.JsonSerializer.Deserialize<FA4>(ex.Doc);
                            theDoc.HorizonEstablismentPotential = fa4.HorizonEstablismentPotential;
                            theDoc.HorizonEstablismentPotentialDescription = fa4.HorizonEstablismentPotentialDescription;
                            theDoc.HorizonEcologicalEffect = fa4.HorizonEcologicalEffect;
                            theDoc.HorizonEcologicalEffectDescription = fa4.HorizonEcologicalEffectDescription;
                            
                            theDoc.HorizonDoScanning = fa4.HorizonDoScanning;
                            if (string.IsNullOrEmpty(theDoc.HorizonScanningStatus) && theDoc.HorizonDoScanning)
                            {
                                theDoc.HorizonScanningStatus = fa4.HorizonScanningStatus;
                            }

                            //theDoc.HorizonScanningStatus = fa4.HorizonDoScanning;


                            theDoc.NotApplicableCategory = fa4.NotApplicableCategory;
                            theDoc.EvaluationStatus = fa4.EvaluationStatus;
                            theDoc.LastUpdatedAt = fa4.LastUpdatedAt;
                            theDoc.LastUpdatedBy = fa4.LastUpdatedBy;

                            theDoc.EvaluatedScientificName = fa4.EvaluatedScientificName;
                            theDoc.EvaluatedScientificNameId = fa4.EvaluatedScientificNameId;
                            theDoc.EvaluatedScientificNameAuthor = fa4.EvaluatedScientificNameAuthor;
                            theDoc.TaxonHierarcy = fa4.TaxonHierarcy;
                            theDoc.TaxonId = fa4.TaxonId;
                            theDoc.EvaluatedVernacularName = fa4.EvaluatedVernacularName;

                            ex.Expertgroup = fa4.ExpertGroup;
                            ex.LastUpdatedAt = fa4.LastUpdatedAt;
                            ex.LastUpdatedByUserId = user.Id;
                            ex.ScientificNameId = fa4.EvaluatedScientificNameId.Value;
                            ex.ChangedAt = fa4.LastUpdatedAt;
                            ex.Doc = System.Text.Json.JsonSerializer.Serialize<FA4>(theDoc);

                            datetime = ex.LastUpdatedAt;
                            _database.SaveChanges();
                        }
                        //if (existing.Any(x => x.ScientificNameId == fa4.EvaluatedScientificNameId && x.Expertgroup == fa4.ExpertGroup))
                        //{
                        //    Console.WriteLine(
                        //        $" Warn Existing Assessment {fa4.EvaluatedScientificNameId} {fa4.EvaluatedScientificName} {fa4.EvaluatedScientificNameAuthor}");
                        //}
                        //else
                        //{
                        //    var exst = existing.FirstOrDefault(x => x.ScientificNameId == fa4.EvaluatedScientificNameId);
                        //    if (exst != null)
                        //    {
                        //        Console.WriteLine(
                        //            $" There is an existing Assessment for this name in expertgroup {exst.Expertgroup} {fa4.EvaluatedScientificNameId} {fa4.EvaluatedScientificName} {fa4.EvaluatedScientificNameAuthor}");
                        //    }
                        else
                        {
                            _database.Assessments.Add(assessment);
                            datetime = assessment.LastUpdatedAt;
                            _database.SaveChanges();
                        }

                    }

                }

                if (datetime > DateTime.MinValue)
                {
                    //var timestamp = _database.TimeStamp.Single();
                    //timestamp.DateTimeUpdated = datetime;
                    //_database.SaveChanges();
                }
            }
        }
        private static FA4 CreateNewAssessment(string expertgroup, User user, int scientificNameId, bool DoorKnocker,
            TaksonService ts)
        {
            if (string.IsNullOrWhiteSpace(expertgroup))
            {
                throw new ArgumentNullException(nameof(expertgroup));
            }
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }
            var vurderingscontext = expertgroup.Contains("Svalbard") ? "S" : "N";
            var vurderingsår = 2021;
            var createdby = "createdbyloading";

            //var ts = new Prod.Api.Services.TaxonService();
            var titask = ts.getTaxonInfo(scientificNameId);
            var ti = titask.GetAwaiter().GetResult();
            var (hierarcy, rank) = GetFullPathScientificName(ti);


            if (scientificNameId != ti.ValidScientificNameId)
            {
                throw new ArgumentException("supplied scientificNameId is not ValidScientificNameId");
            }

            var rl = FA4.CreateNewFA4();

            rl.ExpertGroup = expertgroup;
            rl.EvaluationContext = vurderingscontext;
            rl.IsDeleted = false;
            rl.LastUpdatedAt = DateTime.Now;
            rl.LastUpdatedBy = user.FullName;
            //rl.Vurderingsår = vurderingsår;
            //rl.SistVurdertAr = vurderingsår;
            rl.EvaluationStatus = "created";
            if (DoorKnocker)
            {
                rl.HorizonDoScanning = true;
                rl.HorizonScanningStatus = "notStarted";
            }
            //rl.OverordnetKlassifiseringGruppeKode = "rodlisteVurdertArt";
            //rl.RodlisteVurdertArt = "etablertBestandINorge";
            rl.EvaluatedScientificName = ti.ValidScientificName;
            rl.EvaluatedScientificNameId = ti.ValidScientificNameId;
            rl.EvaluatedScientificNameAuthor = ti.ValidScientificNameAuthorship;
            rl.TaxonHierarcy = hierarcy;
            rl.TaxonId = ti.TaxonId;
            //rl.TaxonRank = rank;
            rl.EvaluatedVernacularName = ti.PrefferedPopularname;

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
        public static (string, string) GetFullPathScientificName(TaxonInfo ti)
        {
            string[] ranks = {
                "Kingdom",
                "Phylum",
                "Class",
                "Order",
                "Family",
                "Genus",
                "Species",
                "SubSpecies"
            };

            var result = ti.Kingdom;
            var names = new List<string>() {
                ti.Phylum,
                ti.Class,
                ti.Order,
                ti.Family,
                ti.Genus,
                ti.Species,
                ti.SubSpecies
            };
            var n = 0; // 0 = "Kingdom"
            foreach (var name in names)
            {
                if (name != null)
                {
                    n++;
                    result += "/" + name;
                }
            }
            return (result, ranks[n]);
        }
    }
}
