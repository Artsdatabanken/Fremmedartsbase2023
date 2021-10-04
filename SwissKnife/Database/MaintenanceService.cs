using Prod.Data.EFCore;
using Prod.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

        internal static void RunTaxonomyWash(SqlServerProdDbContext _database)
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
                        .CheckTaxonomyForChanges(ts, false);
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
                if (stamp != null)
                {
                    stamp.CommentDateTimeUpdated = commentdatetime;
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
            var task = ts.getTaxonInfo(assessment.EvaluatedScientificNameId.Value);
            task.Wait();
            var currentTaxonomy = task.Result;
            //if (assessment.LatinsknavnId != currentTaxonomy.ValidScientificNameId) // latinsknavnid - bare tull
            //{
            if (assessment.IsDeleted)
            {
                return context;
            }

            //}
            var caseString = String.Empty;
            if (currentTaxonomy == null)
            {
                caseString +=
                    $"NB! Navnid ikke funnet {assessment.EvaluatedScientificNameId} {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor}. ";
            }
            else
            {
                var preName = assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor;
                var postName = currentTaxonomy.ValidScientificName + " " + currentTaxonomy.ValidScientificNameAuthorship;
                var nameChange = !preName.Equals(postName);
                //if (assessment.TaxonId != currentTaxonomy.TaxonId && assessment.VurdertVitenskapeligNavnId == currentTaxonomy.ValidScientificNameId)
                //{
                //    caseString = "";
                //}
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

                    var assessmentVurdertVitenskapeligNavnHierarki =
                        TaksonService.GetFullPathScientificName(currentTaxonomy).Item1;
                    if (assessmentVurdertVitenskapeligNavnHierarki != assessment.TaxonHierarcy)
                    {
                        Console.WriteLine(
                            $"Sti {assessment.TaxonHierarcy} => {assessmentVurdertVitenskapeligNavnHierarki}");
                        assessment.TaxonHierarcy = assessmentVurdertVitenskapeligNavnHierarki;
                        context.changes = true;
                    }

                    //if (assessment.LatinsknavnId != assessment.EvaluatedScientificNameId)
                    //{
                    //    Console.WriteLine(
                    //        $"Latinsknavnid <>  {assessment.LatinsknavnId} => {assessment.EvaluatedScientificNameId}{(nameChange ? " " + preName + " => " + postName + ". " : string.Empty)}");
                    //    assessment.LatinsknavnId = assessment.EvaluatedScientificNameId;
                    //    context.changes = true;
                    //}

                }

                if (assessment.TaxonId > 0 && assessment.TaxonId != currentTaxonomy.TaxonId)
                {
                    caseString += $"Taksonid endret {assessment.TaxonId} => {currentTaxonomy.TaxonId}. ";
                }

                if (assessment.EvaluatedScientificName != currentTaxonomy.ValidScientificName ||
                    assessment.EvaluatedScientificNameAuthor != currentTaxonomy.ValidScientificNameAuthorship)
                {
                    if (String.IsNullOrWhiteSpace(caseString))
                    {

                        caseString +=
                            $"Navn endret {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor} => {currentTaxonomy.ValidScientificName + " " + currentTaxonomy.ValidScientificNameAuthorship}. ";
                        // her endrer vi automagisk navn
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
                        //assessment.LatinsknavnId = currentTaxonomy.ValidScientificNameId;
                        context.changes = true;
                        context.historyWorthyChanges = firstRun == false;
                    }
                }
                else if (!String.IsNullOrWhiteSpace(caseString))
                {
                    caseString +=
                        $"Navn ikke endret {assessment.EvaluatedScientificName + " " + assessment.EvaluatedScientificNameAuthor}. ";
                }
            }


            if (!String.IsNullOrWhiteSpace(caseString) && !firstRun)
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

                AssessmentComment eksisting = null;
                var eksistings = context.dbcontext.Comments.Where(x =>
                    x.AssessmentId == context.DbAssessment.Id
                    // && x.Closed == false 
                    && x.IsDeleted == false &&
                    (
                        x.Comment.StartsWith(PotensiellTaksonomiskEndring) ||
                        x.Comment.StartsWith(TaksonomiskEndring))).ToArray();
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
                        AssessmentId = context.DbAssessment.Id,
                        CommentDate = DateTime.Today,
                        // todo: put in config - think sweeden
                        UserId = new Guid("00000000-0000-0000-0000-000000000001")
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
            else
            {
                var existing = context.dbcontext.Comments.SingleOrDefault(x =>
                    x.AssessmentId == context.DbAssessment.Id && x.Closed == false && x.IsDeleted == false &&
                    (x.Comment.StartsWith(PotensiellTaksonomiskEndring) || x.Comment.StartsWith(TaksonomiskEndring)));
                if (existing != null)
                {
                    context.dbcontext.Comments.Remove(existing);
                    context.changes = true;
                }
            }

            return context;
        }
        public class ProsessContext
        {
            public FA4 assessment { get; set; }
            public bool changes { get; set; }
            public Assessment DbAssessment { get; set; }
            public SqlServerProdDbContext dbcontext { get; set; }
            public bool historyWorthyChanges { get; set; }
        }

        public static void RunImportNewAssessments(SqlServerProdDbContext sqlServerProdDbContext, string speciesGroup, string inputFolder)
        {
            throw new NotImplementedException();
        }
    }
}
