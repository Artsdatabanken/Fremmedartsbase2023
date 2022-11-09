using Prod.Data.EFCore;
using Prod.Domain;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Prod.Infrastructure.Helpers;

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

        internal static void RunTaxonomyWash(SqlServerProdDbContext _database, string speciesGroup = "",
            bool firstrun = false, bool autoUpdate = false)
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
                var assessments = speciesGroup == ""
                    ? _database.Assessments.OrderBy(x => x.Id).Skip(pointer).Take(batchSize).ToArray()
                    : _database.Assessments.Where(x => x.Expertgroup == speciesGroup).OrderBy(x => x.Id).Skip(pointer)
                        .Take(batchSize).ToArray();
                if (assessments.Length == 0)
                {
                    break;
                }

                pointer += assessments.Length;

                foreach (var item in assessments)
                {
                    var doc = System.Text.Json.JsonSerializer.Deserialize<FA4>(item.Doc);
                    var prosessContext = new ProsessContext
                    {
                        assessment = doc, changes = false, DbAssessment = item, dbcontext = _database,
                        historyWorthyChanges = false
                    };

                    var result = prosessContext
                            //.BatchSetAssessmentsToResult()
                            .CheckTaxonomyForChanges(ts, firstrun, autoUpdate)
                        //.CheckReferencesForChanges(refDict);
                        //.DownLoadArtskartDataIfMissing()
                        ;
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

        internal static void TransferFromHs(SqlServerProdDbContext _database)
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

                pointer += assessments.Length;

                foreach (var item in assessments)
                {
                    var doc = System.Text.Json.JsonSerializer.Deserialize<FA4>(item.Doc);
                    var horizonScanResult = GetHorizonScanResult(doc);
                    if (doc.HorizonDoScanning == false) // && horizonScanResult.HasValue == false)
                    {
                        continue;
                    }

                    if (horizonScanResult.HasValue == false)
                    {
                        continue;
                    }

                    doc.HorizonScanResult = horizonScanResult.Value == true
                        ? "scanned_fullAssessment"
                        : "scanned_noAssessment";
                    doc.HorizonDoScanning = horizonScanResult.Value != true;
                    // todo fix potensielt vurderingsendringer her....
                    if (doc.HorizonScanResult == "scanned_fullAssessment")
                    {
                        if (doc.HorizonEstablismentPotential == "0")
                        {
                            doc.RiskAssessment.Occurrences1Best = 0;
                        }
                        else if (doc.HorizonEstablismentPotential == "1")
                        {
                            doc.RiskAssessment.Occurrences1Best = 1;
                        }
                    }

                    var docLastUpdatedOn = DateTime.Now;
                    item.Doc = System.Text.Json.JsonSerializer.Serialize(doc);
                    item.LastUpdatedAt = docLastUpdatedOn;
                    commentdatetime = item.LastUpdatedAt;
                    batchChanges = true;

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
            var history = new AssessmentHistory()
            {
                Id = assessment.Id, Doc = assessment.Doc, HistoryAt = docLastUpdatedOn,
                UserId = assessment.LastUpdatedByUserId
            };
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

        public static ProsessContext CheckTaxonomyForChanges(this ProsessContext context, TaksonService ts,
            bool firstRun = false, bool autoUpdate = false)
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
            var scientificNameIdChange = false;
            var scientificNameChange = false;
            var taxonIdChange = false;
            var canAutoUpdate = false;

            if (assessment.EvaluatedScientificNameId.Value == currentTaxonomy.ValidScientificNameId)
            {
                FixPopulernavnAndPath(context, currentTaxonomy, assessment);
            }
            else
            {
                scientificNameIdChange = true;
                caseString +=
                    $"Navnid endret {assessment.EvaluatedScientificNameId.Value} => {currentTaxonomy.ValidScientificNameId}. {(nameChange ? preName + " => " + postName + ". " : string.Empty)}";
            }

            if (assessment.TaxonId > 0 && assessment.TaxonId != currentTaxonomy.TaxonId)
            {
                taxonIdChange = true;
                caseString += $"Taksonid endret {assessment.TaxonId} => {currentTaxonomy.TaxonId}. ";
            }

            if (assessment.EvaluatedScientificName != currentTaxonomy.ValidScientificName ||
                assessment.EvaluatedScientificNameAuthor != currentTaxonomy.ValidScientificNameAuthorship)
            {
                // navnet er endret
                scientificNameChange = true;
                if (!taxonIdChange && !scientificNameIdChange) // ingen endring på taxonid!
                {

                    caseString +=
                        $"Navn endret {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor} => {currentTaxonomy.ValidScientificName + " " + currentTaxonomy.ValidScientificNameAuthorship}. ";
                    // her endrer vi automagisk navn
                    UpdateTaxonomicInfoOnAssessment(context, assessment, currentTaxonomy);
                    canAutoUpdate = true;
                    //assessment.LatinsknavnId = currentTaxonomy.ValidScientificNameId;
                    context.changes = true;
                    context.historyWorthyChanges = firstRun == false;
                }
                else if (taxonIdChange && !scientificNameIdChange) // ingen endring på taxonid!
                {

                    caseString +=
                        $"Navn redigert {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor} => {currentTaxonomy.ValidScientificName + " " + currentTaxonomy.ValidScientificNameAuthorship}. ";
                    // her endrer vi automagisk navn
                    UpdateTaxonomicInfoOnAssessment(context, assessment, currentTaxonomy);
                    canAutoUpdate = true;
                    //assessment.LatinsknavnId = currentTaxonomy.ValidScientificNameId;
                    context.changes = true;
                    context.historyWorthyChanges = firstRun == false;
                }
            }
            else if (!string.IsNullOrWhiteSpace(caseString))
            {
                caseString +=
                    $"Navn ikke endret {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor}. ";
                UpdateTaxonomicInfoOnAssessment(context, assessment, currentTaxonomy);
                canAutoUpdate = true; // taxonid endret eller uendret men navnet indetisk

                context.changes = true;
                context.historyWorthyChanges = firstRun == false;
            }

            if ((taxonIdChange || scientificNameIdChange) && autoUpdate && context.historyWorthyChanges == false)
            {
                //caseString = ""; // blank ut denne for å fjerne kommentarer under 
                UpdateTaxonomicInfoOnAssessment(context, assessment, currentTaxonomy);
                canAutoUpdate = true;
                context.changes = true;
                context.historyWorthyChanges = firstRun == false;
            }


            if (!string.IsNullOrWhiteSpace(caseString) && !firstRun)
            {
                var endring = canAutoUpdate ? TaksonomiskEndring : PotensiellTaksonomiskEndring;
                var message = endring + caseString +
                              " http://www.artsportalen.artsdatabanken.no/#/Artsnavn/ref/" +
                              (currentTaxonomy == null
                                  ? assessment.EvaluatedScientificNameId
                                  : currentTaxonomy.ValidScientificNameId)
                              + " " +
                              (canAutoUpdate
                                  ? "Dette kan skyldes at et synonym er lagt til, at populærnavn er lagt til/endret eller lignende. Denne kommentaren er bare til opplysning og trenger ingen handling fra komitéen."
                                  : "Fremmedartsteamet trenger bekreftelse på denne endringen før vurderingen flyttes over på nytt navn. Svar på denne kommentaren eller send en mail til fremmedearter@artsdatabanken.no"
                              );

                CreateOrAddTaxonomicCommentToAssessment(context, context.DbAssessment.Id, message, canAutoUpdate);
            }
            //else if (context.DbAssessment != null)
            //{
            //    RemoveTaxonomicalCommentsFromAssessment(context, context.DbAssessment.Id);
            //}

            return context;
        }

        private static void FixPopulernavnAndPath(ProsessContext context, TaxonInfo currentTaxonomy, FA4 assessment)
        {
            //sjekk om populærnavn er feil...
            if (currentTaxonomy.PrefferedPopularname != null && (assessment.EvaluatedVernacularName == null ||
                                                                 !assessment.EvaluatedVernacularName.Equals(
                                                                     currentTaxonomy
                                                                         .PrefferedPopularname)))
            {
                Console.WriteLine(
                    $"Populærnavn {assessment.EvaluatedVernacularName} => {currentTaxonomy.PrefferedPopularname}");
                assessment.EvaluatedVernacularName = currentTaxonomy.PrefferedPopularname;
                context.changes = true;
            }

            var assessmentVurdertVitenskapeligNavnHierarki =
                TaksonService.GetFullPathScientificName(currentTaxonomy).Item1;

            // eller sti
            if (assessmentVurdertVitenskapeligNavnHierarki != assessment.TaxonHierarcy)
            {
                Console.WriteLine(
                    $"Sti {assessment.TaxonHierarcy} => {assessmentVurdertVitenskapeligNavnHierarki}");
                assessment.TaxonHierarcy = assessmentVurdertVitenskapeligNavnHierarki;
                context.changes = true;
            }

            var assessmentEvaluatedScientificNameRank = currentTaxonomy.CategoryValue; //GetCategory(currentTaxonomy);
            if (assessment.EvaluatedScientificNameRank != assessmentEvaluatedScientificNameRank)
            {
                assessment.EvaluatedScientificNameRank = assessmentEvaluatedScientificNameRank;
                context.changes = true;
            }
        }

        private static string GetCategory(TaxonInfo currentTaxonomy)
        {
            switch (currentTaxonomy.CategoryValue)
            {
                case "21": return "Section";
                case "22": return "Species";
                case "23": return "SubSpecies";
                case "24": return "Variety";
                case "25": return "Form";
                default:
                    return "Species";

            }
            return currentTaxonomy.CategoryValue;
        }

        private static void UpdateTaxonomicInfoOnAssessment(ProsessContext context, FA4 assessment,
            TaxonInfo currentTaxonomy)
        {
            FixPopulernavnAndPath(context, currentTaxonomy, assessment);

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
        }

        private static void CreateOrAddTaxonomicCommentToAssessment(ProsessContext context, int dbAssessmentId,
            string message, bool canAutoUpdate)
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


            var commentType = canAutoUpdate || !message.StartsWith(PotensiellTaksonomiskEndring)
                ? CommentType.TaxonomicChange
                : CommentType.PotentialTaxonomicChange;
            if (eksisting == null)
            {
                eksisting = new AssessmentComment
                {
                    Comment = message,
                    AssessmentId = dbAssessmentId,
                    CommentDate = DateTime.Today,
                    // todo: put in config - think sweeden
                    UserId = new Guid("00000000-0000-0000-0000-000000000001"),
                    Type = commentType
                }; // siris id
                context.dbcontext.Comments.Add(eksisting);
                context.changes = true;
                Console.WriteLine(message);
            }
            else if (eksisting.Comment != message || eksisting.Type != commentType)
            {
                eksisting.Comment = message;
                eksisting.Type = commentType;
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

        private static bool? GetHorizonScanResult(FA4 ass)
        {
            var pot = ass.HorizonEstablismentPotential ?? string.Empty;
            var effects = ass.HorizonEcologicalEffect ?? string.Empty;
            if (pot == string.Empty || effects == string.Empty) return null;
            switch (pot)
            {
                case "0":
                    switch (effects)
                    {
                        case "no":
                        case "yesWhilePresent": return false;
                        case "yesAfterGone": return true;
                        default: return false;
                    }
                case "1":
                    switch (effects)
                    {
                        case "no": return false;
                        case "yesWhilePresent":
                        case "yesAfterGone": return true;
                        default: return false;
                    }
                case "2":
                    return true;
            }

            return false;
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
            var existing = _database.Assessments.Where(x => x.IsDeleted == false)
                .Select(x => new { x.Expertgroup, x.ScientificNameId }).ToArray();

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
                    var ti = taxonService.getTaxonInfo(importFormat.ScientificNameId).GetAwaiter().GetResult();
                    var fa4 = CreateNewAssessment(speciesGroup, user, importFormat.ScientificNameId, true, ti);
                    fa4.EvaluationStatus = "created";
                    fa4.LastUpdatedAt = DateTime.Now;
                    var doc = System.Text.Json.JsonSerializer.Serialize<FA4>(fa4);

                    var prosessContext = new ProsessContext
                    {
                        assessment = fa4, changes = false, DbAssessment = null, dbcontext = _database,
                        historyWorthyChanges = false
                    };

                    var result = prosessContext
                        //.BatchSetAssessmentsToResult()
                        .CheckTaxonomyForChanges(taxonService, true, false);
                    var assessment = new Assessment
                    {
                        Doc = doc,
                        LastUpdatedAt = fa4.LastUpdatedAt,
                        LastUpdatedByUserId = user.Id,
                        ScientificNameId = fa4.EvaluatedScientificNameId.Value,
                        ChangedAt = fa4.LastUpdatedAt
                    };
                    if (fa4.EvaluatedScientificNameId != importFormat.ScientificNameId ||
                        fa4.EvaluatedScientificName != importFormat.ScientificName ||
                        (fa4.EvaluatedScientificNameAuthor == null
                            ? string.Empty
                            : fa4.EvaluatedScientificNameAuthor.ToLowerInvariant()) !=
                        (importFormat.ScientificNameAuthor == null
                            ? string.Empty
                            : importFormat.ScientificNameAuthor.ToLowerInvariant()))
                    {
                        Console.WriteLine(
                            $" ERROR - not imported {fa4.EvaluatedScientificNameId} <> {importFormat.ScientificNameId}  {fa4.EvaluatedScientificName} {fa4.EvaluatedScientificNameAuthor} <> {importFormat.ScientificNameAuthor}");
                    }
                    else
                    {
                        if (existing.Any(x =>
                                x.ScientificNameId == fa4.EvaluatedScientificNameId &&
                                x.Expertgroup == fa4.ExpertGroup))
                        {
                            Console.WriteLine(
                                $" Warn Existing Assessment {fa4.EvaluatedScientificNameId} {fa4.EvaluatedScientificName} {fa4.EvaluatedScientificNameAuthor}");
                        }
                        else
                        {
                            var exst = existing.FirstOrDefault(x =>
                                x.ScientificNameId == fa4.EvaluatedScientificNameId);
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

                if (datetime > DateTime.MinValue)
                {
                    var timestamp = _database.TimeStamp.Single();
                    timestamp.DateTimeUpdated = datetime;
                    _database.SaveChanges();
                }
            }
        }

        public static void RunImportHSAssessments(SqlServerProdDbContext _database, string inputFolder)
        {
            var existing = _database.Assessments.Where(x => x.IsDeleted == false)
                .Select(x => new { x.Expertgroup, x.ScientificNameId }).ToArray();

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
                    var ti = taxonService.getTaxonInfo(importFormat.EvaluatedScientificNameId).GetAwaiter().GetResult();
                    if (ti == null)
                    {
                        Console.WriteLine(
                            $"ERROR - could not find in Artsnavnebase: {importFormat.EvaluatedScientificNameId} {importFormat.EvaluatedScientificName} {importFormat.EvaluatedScientificNameAuthor}");
                        continue;
                    }

                    var fa4 = CreateNewAssessment(importFormat.ExpertGroup, user,
                        importFormat.EvaluatedScientificNameId, horisontScanning, ti);
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
                        if (fa4.HorizonEcologicalEffect != null &&
                            fa4.HorizonEcologicalEffect.ToLowerInvariant() == "yeswhilepresent" &&
                            fa4.HorizonEcologicalEffect != "yesWhilePresent")
                            fa4.HorizonEcologicalEffect = "yesWhilePresent";
                        if (fa4.HorizonEcologicalEffect != null &&
                            fa4.HorizonEcologicalEffect.ToLowerInvariant() == "no" &&
                            fa4.HorizonEcologicalEffect != "no")
                            fa4.HorizonEcologicalEffect = "no";
                        if (fa4.HorizonEcologicalEffect != null &&
                            fa4.HorizonEcologicalEffect.ToLowerInvariant() == "yesaftergone" &&
                            fa4.HorizonEcologicalEffect != "yesAfterGone")
                            fa4.HorizonEcologicalEffect = "yesAfterGone";
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
                        var alternativeIds = ti.ScientificNames.Select(x => x.ScientificNameId).ToArray()
                            .Union(new[]
                                { importFormat.EvaluatedScientificNameId, fa4.EvaluatedScientificNameId.Value })
                            .Distinct().ToArray();
                        var allmatch = existing.Where(x =>
                            alternativeIds.Contains(x.ScientificNameId) && x.Expertgroup == fa4.ExpertGroup).ToArray();
                        //var exst = existing.SingleOrDefault(x => x.ScientificNameId == fa4.EvaluatedScientificNameId && x.Expertgroup != "Testedyr");

                        if (allmatch.Length > 0)
                        {
                            // oppdater den eksisterende
                            var ex = _database.Assessments.SingleOrDefault(x =>
                                alternativeIds.Contains(x.ScientificNameId) && x.Expertgroup == fa4.ExpertGroup);
                            //var ex = allex.First();

                            var theDoc = System.Text.Json.JsonSerializer.Deserialize<FA4>(ex.Doc);
                            theDoc.HorizonEstablismentPotential = fa4.HorizonEstablismentPotential;
                            theDoc.HorizonEstablismentPotentialDescription =
                                fa4.HorizonEstablismentPotentialDescription;
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
            TaxonInfo ti)
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
            string[] ranks =
            {
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
            var names = new List<string>()
            {
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

        public static void RunNightTasks(SqlServerProdDbContext _database)
        {
            var ts = new TaksonService();
            var batchSize = 1000;
            var pointer = 0;
            var commentdatetime = DateTime.MinValue;

            var client = new HttpClient();
            var referenceClient =
                new Prod.Infrastructure.Services.Client("https://referenceapi.artsdatabanken.no/", client);
            var references = referenceClient.ReferencesAllAsync(0, 50000, "").GetAwaiter().GetResult();
            var refDict = references.ToDictionary(x => x.Id, y => y.ReferencePresentation);

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

                pointer += assessments.Length;

                foreach (var item in assessments)
                {
                    var doc = System.Text.Json.JsonSerializer.Deserialize<FA4>(item.Doc);
                    var prosessContext = new ProsessContext
                    {
                        assessment = doc, changes = false, DbAssessment = item, dbcontext = _database,
                        historyWorthyChanges = false
                    };

                    var result = prosessContext
                        //.BatchSetAssessmentsToResult()
                        //.CheckTaxonomyForChanges(ts)
                        .CheckReferencesForChanges(refDict)
                        .DownLoadArtskartDataIfMissing();
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
                    //_database.SaveChanges();
                }
            }

            if (commentdatetime > DateTime.MinValue)
            {

                var stamp = _database.TimeStamp.SingleOrDefault();
                if (stamp != null && stamp.DateTimeUpdated < commentdatetime)
                {
                    stamp.DateTimeUpdated = commentdatetime;
                }

                //_database.SaveChanges();

            }
        }

        public static ProsessContext CheckReferencesForChanges(this ProsessContext context,
            Dictionary<Guid, string> refDict)
        {

            foreach (var reference in context.assessment.References)
            {
                var refr = refDict.ContainsKey(reference.ReferenceId) ? refDict[reference.ReferenceId] : null;
                if (refr == null) continue;
                if (reference.FormattedReference == refr) continue;
                reference.FormattedReference = refr;
                context.changes = true;
            }

            return context;

        }

        public static ProsessContext DownLoadArtskartDataIfMissing(this ProsessContext context)
        {
            var name = "Datagrunnlag fra Artskart";
            var fileName = "ArtskartData.zip";
            var filetype = "application/zip";
            var assessment = context.assessment;
            if (assessment.ArtskartSistOverført != null)
            {
                var attachDate = context.dbcontext.Attachments.Where(x =>
                    x.AssessmentId == context.DbAssessment.Id && x.Name == name && x.Type == filetype &&
                    x.FileName == fileName).Select(x => new { x.Date, x.File.LongLength }).FirstOrDefault();

                if (attachDate == null || attachDate.LongLength < 100 ||
                    (attachDate.Date == DateTime.MinValue || attachDate.Date < DateTime.Parse(
                        assessment.ArtskartSistOverført,
                        null, System.Globalization.DateTimeStyles.AdjustToUniversal)))
                {
                    var zipfile = ArtskartHelper.GetZipDataFromArtskart(assessment).GetAwaiter().GetResult();
                    if (zipfile.Length > 0)
                    {
                        var attach = context.dbcontext.Attachments.FirstOrDefault(x =>
                            x.AssessmentId == assessment.Id && x.Name == name && x.Type == filetype &&
                            x.FileName == fileName);
                        if (attach != null)
                        {
                            attach.File = zipfile;
                            attach.IsDeleted = false;
                            attach.Date = DateTime.Now;
                            attach.UserId = context.DbAssessment.LastUpdatedByUserId;
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
                                UserId = context.DbAssessment.LastUpdatedByUserId
                            };
                            context.dbcontext.Attachments.Add(attach);
                        }

                        context.changes = true;
                    }
                }

            }

            return context;
        }

        public static void RunImportGTData(SqlServerProdDbContext _database, string inputFolder)
        {
            var existing = _database.Assessments.Where(x => x.IsDeleted == false)
                .Select(x => new { x.Id, x.Expertgroup, x.ScientificNameId }).ToArray();

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
                var records = csv.GetRecords<GTFormat>();
                foreach (var importFormat in records)
                {
                    if (importFormat.EvaluatedScientificNameAuthor == "null")
                        importFormat.EvaluatedScientificNameAuthor = null;
                    Console.WriteLine(
                        $"{importFormat.EvaluatedScientificNameId} {importFormat.EvaluatedScientificName} {importFormat.EvaluatedScientificNameAuthor}");

                    //var ti = taxonService.getTaxonInfo(importFormat.EvaluatedScientificNameId).GetAwaiter().GetResult();
                    //if (ti == null)
                    //{
                    //    Console.WriteLine(
                    //        $"ERROR - could not find in Artsnavnebase: {importFormat.EvaluatedScientificNameId} {importFormat.EvaluatedScientificName} {importFormat.EvaluatedScientificNameAuthor}");
                    //    continue;
                    //}

                    var assessment = existing.SingleOrDefault(x => x.Id == importFormat.Id);

                    if (assessment == null)
                    {
                        // sikkert ok
                    }
                    else
                    {
                        var ass = _database.Assessments.Single(x => x.Id == importFormat.Id);
                        var doc = System.Text.Json.JsonSerializer.Deserialize<FA4>(ass.Doc);
                        if (doc.ReproductionGenerationTime != importFormat.reproductionGenerationTime)
                        {
                            Console.WriteLine($"Endret fra {doc.ReproductionGenerationTime} til {importFormat.reproductionGenerationTime}");
                        }
                        doc.ReproductionGenerationTime = importFormat.reproductionGenerationTime;
                        ass.Doc = System.Text.Json.JsonSerializer.Serialize<FA4>(doc);
                    }

                    //var doc = System.Text.Json.JsonSerializer.Serialize<FA4>(fa4);
                    //var allmatch = existing.Where(x =>
                    //                        alternativeIds.Contains(x.ScientificNameId) && x.Expertgroup == fa4.ExpertGroup).ToArray();
                    //var exst = existing.SingleOrDefault(x => x.ScientificNameId == fa4.EvaluatedScientificNameId && x.Expertgroup != "Testedyr");

                    // _database.SaveChanges();
                }

                _database.SaveChanges();
            }
        }
    }


internal class GTFormat
    {
        public int Id { get; set; }
        public string ExpertGroup { get; set; }
        public int EvaluatedScientificNameId { get; set; }
        public string EvaluatedScientificName { get; set; }
        public string EvaluatedScientificNameAuthor { get; set; }
        public int reproductionGenerationTime { get; set; }
    }
}
