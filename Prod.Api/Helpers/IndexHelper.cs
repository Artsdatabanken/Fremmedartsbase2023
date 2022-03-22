using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Lucene.Net.Documents;
using Lucene.Net.Facet;
using Lucene.Net.Index;
using Lucene.Net.Search;
using Microsoft.EntityFrameworkCore;
using Nbic.Indexer;
using Prod.Api.Models;
using Prod.Data.EFCore;
using Prod.Domain;
using Index = Nbic.Indexer.Index;

namespace Prod.Api.Helpers
{
    public static class IndexHelper
    {
        /// <summary>
        ///     Change this to force index rebuild!
        /// </summary>
        public const int IndexVersion = 16;
        private static readonly object IndexingLock = new();

        private const string Field_Id = "Id";
        private const string Field_Group = "Expertgroup";
        private const string Field_EvaluationStatus = "EvaluationStatus";
        internal const string Field_LastUpdatedBy = "LastUpdatedBy";
        private const string Field_LastUpdatedAt = "LastUpdatedAt";
        private const string Field_LockedForEditByUser = "LockedForEditByUser";
        private const string Field_LockedForEditAt = "LockedForEditAt";
        private const string Field_ScientificName = "ScientificName";
        private const string Field_ScientificNameAuthor = "ScientificNameAuthor";
        private const string Field_TaxonPath = "TaxonPath";
        private const string Field_ScientificNameId = "ScientificNameId";
        public const string Field_ScientificNameAsTerm = "ScientificNameTerm";
        private const string Field_TaxonHierarcy = "TaxonHierarcy";
        private const string Field_Category = "Category";
        private const string Field_Category2018 = "Category2018";
        private const string Field_Criteria2018 = "Criteria2018";

        private const string Field_Criteria = "Criteria";
        private const string Field_CriteriaAll = "CriteriaAll";
        private const string Field_CriteriaAll2018 = "CriteriaAll2018";

        private const string Field_AssessmentContext = "AssessmentContext";

        //MainCriteria = (x.Criteria ?? "").ToCharArray().Where(c => Char.IsLetter(c) && Char.IsUpper(c)).Select(c => c.ToString()).ToArray(),
        private const string Field_PopularName = "PopularName";

        private const string Field_Habitat = "Habitat";
        private const string Field_Regioner = "Region";
        private const string Field_Rank = "Rank";
        private const string Field_Utdodd = "Utdodd";
        private const string Field_EurB = "EuroB";
        private const string Field_Year = "Year";
        private const string Field_EndringKat = "ChangeCat";


        private const string Field_DoHorizonScanning = "DoHorizonScan";
        private const string Field_HsStatus = "HsStatus";
        private const string Field_HsDone = "HsDone";
        private const string Field_HsResult = "HsResult";
        private const string Field_Progress = "Progress";
        private const string Field_CurrentStatus = "CStatus";
        private const string Field_2018Status = "PStatus";
        private const string Field_ProgressStatus = "ProgressStatus";

        //facets - telle antall!!
        public const string Facet_Author = "Author";
        public const string Facet_Progress = "Progress";
        public const string Facet_PotentialDoorKnocker = "PotentialDoorKnocker";
        public const string Facet_NotAssessedDoorKnocker = "NotAssessedDoorKnocker";
        private const string Field_NewestComment = "NewestComment";
        private static readonly string Field_NR2018 = "S2018";
        private static readonly string[] _criterias = { "A", "B", "C", "D", "E", "F", "G", "H", "I" };
        private static readonly string Field_CommentsClosed = "CommentsClosed";
        private static readonly string Field_CommentsOpen = "CommentsOpen";
        private static readonly string Field_CommentsNew = "CommentsNew";

        private static readonly string Field_TaxonChange = "TaxonChange";

        private static DateTime _dateTimeForHorScanDone = new DateTime(2022, 2,22);
        //private const string PotensiellTaksonomiskEndring = "Potensiell taksonomisk endring: ";
        //private const string TaksonomiskEndring = "Automatisk endring av navn: ";

        public static async Task<DateTime> Index(DateTime indexVersionDateTime, ProdDbContext _dbContext, Index _index)
        {
            var batchSize = 1000;
            var pointer = 0;
            var maxDate = DateTime.MinValue;
            var minDate = indexVersionDateTime;
            while (true)
            {
                var result = await _dbContext.Assessments.Include(x => x.LastUpdatedByUser)
                    .Include(x => x.LockedForEditByUser)
                    .Include(x => x.Comments)
                    .Where(x =>
                        //x.IsDeleted == false && 
                        x.LastUpdatedAt > minDate || x.Comments.Any(y => y.CommentDate > minDate))
                    .OrderBy(x => x.Id)
                    .Skip(pointer).Take(batchSize)
                    .ToArrayAsync();
                if (result.Length == 0) break;
                pointer += result.Length;
                var tempDate = result.Max(x => x.LastUpdatedAt);
                if (maxDate < tempDate) maxDate = tempDate;

                var docs = result.Where(x => x.IsDeleted == false).Select(GetIndexFieldsFromAssessment).ToArray();
                _index.AddOrUpdate(docs);
                var deletedDocs = result.Where(x => x.IsDeleted).Select(x => x.Id).ToArray();
                _index.Delete(deletedDocs);
            }

            SetTimeStamps(_dbContext, _index, maxDate);

            return maxDate;
        }

        private static void SetTimeStamps(ProdDbContext _dbContext, Index _index, DateTime maxDate)
        {
            var stamp = _dbContext.TimeStamp.SingleOrDefault();
            if (stamp == null)
            {
                _dbContext.TimeStamp.Add(new TimeStamp
                    { Id = 1, DateTimeUpdated = maxDate });
            }
            else
            {
                if (DateTimesSignificantlyDifferent(stamp.DateTimeUpdated, maxDate)) stamp.DateTimeUpdated = maxDate;
            }

            _dbContext.SaveChanges();

            _index.SetIndexVersion(new IndexVersion
                { Version = IndexVersion, DateTime = maxDate });
        }

        internal static void SetCommentTimeStamp(ProdDbContext _dbContext,
            DateTime maxCommentDate)
        {
            var stamp = _dbContext.TimeStamp.SingleOrDefault();
            if (stamp != null)
                if (DateTimesSignificantlyDifferent(stamp.DateTimeUpdated, maxCommentDate))
                    stamp.DateTimeUpdated = maxCommentDate;

            _dbContext.SaveChanges();
        }

        public static DateTime ReIndex(ProdDbContext _dbContext, Index _index)
        {
            var batchSize = 1000;
            var pointer = 0;
            var maxDate = DateTime.MinValue;
            //if (_index.IndexCount() > 1 && _index.IndexCount() < 5000) return;
            lock (IndexingLock)
            {
                _index.ClearIndex();

                while (true)
                {
                    var result = _dbContext.Assessments
                        .Include(x => x.LastUpdatedByUser)
                        .Include(x => x.LockedForEditByUser)
                        .Include(x => x.Comments)
                        .Where(x => x.IsDeleted == false).OrderBy(x => x.Id)
                        .Skip(pointer).Take(batchSize)
                        .ToArray();
                    if (result.Length == 0) break;
                    pointer += result.Length;
                    var tempDate = result.Max(x => x.LastUpdatedAt);
                    if (maxDate < tempDate) maxDate = tempDate;

                    var docs = result.Select(GetIndexFieldsFromAssessment).ToArray();
                    _index.AddOrUpdate(docs);
                }

                SetTimeStamps(_dbContext, _index, maxDate);
            }

            return maxDate;
        }

        public static void Index(Assessment assessment, Index index)
        {
            lock (IndexingLock)
            {
                if (assessment.IsDeleted)
                {
                    index.Delete(new[] { assessment.Id }.ToArray());
                }
                else
                {
                    var doc = GetIndexFieldsFromAssessment(assessment);
                    index.AddOrUpdate(doc);
                }

                index.SetIndexVersion(new IndexVersion { Version = IndexVersion, DateTime = assessment.LastUpdatedAt });
            }
        }
        //private const string Field_DateLastSave = "DateSave";

        private static Document GetIndexFieldsFromAssessment(Assessment assessment)
        {
            var ass = JsonSerializer.Deserialize<FA4>(assessment.Doc);
            //string kategori = ass.Kategori; // string.IsNullOrWhiteSpace(ass.Kategori) ? "" : ass.Kategori.Substring(0,2);
            var ass2018 = ass.PreviousAssessments.FirstOrDefault(x => x.RevisionYear == 2018);
            var horizonScanResult = GetHorizonScanResult(ass);
            var get2018NotAssessed = Get2018NotAssessed(ass);
            var horResult = horizonScanResult.HasValue ? horizonScanResult.Value ? "1" : "0" : "2";

            var indexFields = new Document
            {
                new StringField(Field_Id, assessment.Id.ToString(), Field.Store.YES),
                // StringField indexes but doesn't tokenize - Case important
                new StringField(Field_Group, ass.ExpertGroup, Field.Store.YES),
                new StringField(Field_EvaluationStatus, ass.EvaluationStatus, Field.Store.YES),
                new StringField(Field_LastUpdatedBy, assessment.LastUpdatedByUser.FullName.Trim(), Field.Store.YES),
                new StringField(Field_LastUpdatedAt, assessment.LastUpdatedAt.Date.ToString("s"), Field.Store.YES),
                new StoredField(Field_LockedForEditByUser,
                    assessment.LockedForEditByUser != null ? assessment.LockedForEditByUser.FullName.Trim() : string.Empty),
                new StoredField(Field_LockedForEditAt, assessment.LockedForEditAt.ToString("s")),
                new TextField(Field_ScientificName, ass.EvaluatedScientificName, // + (!string.IsNullOrWhiteSpace(ass.EvaluatedScientificNameAuthor) ? " " + ass.EvaluatedScientificNameAuthor : string.Empty),
                    Field.Store.YES), // textfield - ignore case
                new TextField(Field_ScientificNameAuthor, !string.IsNullOrWhiteSpace(ass.EvaluatedScientificNameAuthor)
                        ? ass.EvaluatedScientificNameAuthor
                        : string.Empty,
                    Field.Store.YES), // textfield - ignore case
                new StringField(Field_ScientificNameId, ass.EvaluatedScientificNameId.ToString(), Field.Store.NO),
                new StringField(Field_ScientificNameAsTerm, ass.EvaluatedScientificName.ToLowerInvariant(),
                    Field.Store.NO), // textfield - ignore case
                //new StoredField(Field_TaxonHierarcy, ass.VurdertVitenskapeligNavnHierarki),
                //new StringField(Field_Category, GetCategoryFromRiskLevel(ass.RiskAssessment.RiskLevel),
                //    Field.Store.YES),

                //new StringField(Field_AssessmentContext, ass.VurderingsContext, Field.Store.YES),
                new TextField(Field_PopularName, ass.EvaluatedVernacularName ?? string.Empty, Field.Store.YES),
                new StringField(Field_DoHorizonScanning, ass.HorizonDoScanning ? "1" : "0", Field.Store.NO),
                new StringField(Field_NR2018, get2018NotAssessed.ToString(), Field.Store.NO),
                new StringField(Field_HsStatus, ass.HorizonScanningStatus, Field.Store.YES),
                //new StringField(Field_HsDone, ass.HorizonScanningStatus, Field.Store.YES),
                new StringField(Field_HsResult, horResult, Field.Store.YES),
                new StringField(Field_Progress, ass.EvaluationStatus, Field.Store.YES),
                // facets
                new FacetField(Facet_Author, assessment.LastUpdatedByUser.FullName),
                //new FacetField(Facet_Progress, horResult),
                new FacetField(Facet_PotentialDoorKnocker, ExtractPotentialDoorKnocker(get2018NotAssessed).ToString()),
                new FacetField(Facet_NotAssessedDoorKnocker, ExtractNotAssessedDoorKnocker(get2018NotAssessed).ToString())
            };

            if (ass.TaxonHierarcy != null && ass.TaxonHierarcy.Length > 0)
            {
                var elements = ass.TaxonHierarcy.Split(new[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var item in elements)
                {
                    indexFields.Add(new TextField(Field_TaxonPath, item, Field.Store.NO));
                }

            }

            if (IsDocumentEvaluated(ass))
            {
                indexFields.Add(new StringField(Field_Category, string.IsNullOrWhiteSpace(ass.Category) ? GetCategoryFromRiskLevel(ass.RiskAssessment.RiskLevel) : ass.Category,
                    Field.Store.YES));
                indexFields.Add(new StringField(Field_CurrentStatus, "vurdert", Field.Store.NO));
            }
            else
            {
                indexFields.Add(new StringField(Field_Category, "NR", Field.Store.YES));
                indexFields.Add(new StringField(Field_CurrentStatus, "ikkevurdert", Field.Store.NO));
            }

            // &Current.Status=establishedAfter1800,&Current.Status=doorKnocker,&Current.Status=regionallyAlien,&Current.Status=effectWithoutEstablishment
            // &Current.Status=establishedBefore1800,&Current.Status=sharesMotherSpeciesStatus,&Current.Status=notAlienInNorway,&Current.Status=notAssessedPotentialDoorKnocker
            if (ass.IsRegionallyAlien.HasValue && ass.IsRegionallyAlien.Value)  indexFields.Add(new StringField(Field_CurrentStatus, "regionallyAlien", Field.Store.NO));
            
            if (ass.AlienSpecieUncertainIfEstablishedBefore1800.HasValue)
            {
                indexFields.Add(ass.AlienSpecieUncertainIfEstablishedBefore1800.Value == true
                    ? new StringField(Field_CurrentStatus, "establishedBefore1800", Field.Store.NO)
                    : new StringField(Field_CurrentStatus, "establishedAfter1800", Field.Store.NO));
            }

            if (!(ass.IsAlienSpecies.HasValue && ass.IsAlienSpecies.Value == true))
            {
                indexFields.Add(new StringField(Field_CurrentStatus, "notAlienInNorway", Field.Store.NO));
            }

            if (ass.IsAlienSpecies == true && ass.ConnectedToAnother == true)
            {
                indexFields.Add(new StringField(Field_CurrentStatus, "sharesMotherSpeciesStatus", Field.Store.NO));
            }
            //effectWithoutEstablishment ??
            if (ass.AssumedReproducing50Years.HasValue && ass.AssumedReproducing50Years == false)
            {
                indexFields.Add(new StringField(Field_CurrentStatus, "effectWithoutEstablishment", Field.Store.NO));
            }
            if (ass.IsAlienSpecies == true && ass.ConnectedToAnother != true && ass.SpeciesStatus != "C2" && ass.SpeciesStatus != "C3" && ass.AlienSpecieUncertainIfEstablishedBefore1800 == false)
            {
                indexFields.Add(new StringField(Field_CurrentStatus, "doorKnocker", Field.Store.NO));
            }

            //2018 status
            //Field_2018Status

            //Status=notStarted,&Status=inprogress,&Status=finished
            var fullfacetstatus = "0";
            if (ass.EvaluationStatus == "imported" || (ass.HorizonDoScanning == false && ass.LastUpdatedAt < _dateTimeForHorScanDone))
            {
                indexFields.Add(new StringField(Field_ProgressStatus, "notStarted", Field.Store.NO));
                fullfacetstatus = "2";
            }
            else if (ass.EvaluationStatus == "inprogress")
            {
                indexFields.Add(new StringField(Field_ProgressStatus, "inprogress", Field.Store.NO));
                fullfacetstatus = "1";
            }
            else if (ass.EvaluationStatus == "finished")
            {
                indexFields.Add(new StringField(Field_ProgressStatus, "finished", Field.Store.NO));
                fullfacetstatus = "0";
            }
            indexFields.Add(new FacetField(Facet_Progress, ass.HorizonDoScanning ? horResult: fullfacetstatus));

            if (ass2018 != null)
            {
                if (Is2018DocumentEvaluated(ass2018.MainCategory, ass2018.MainSubCategory, ass2018.MainSubCategory))
                {
                    indexFields.Add(new StringField(Field_Category2018,
                        GetCategoryFromRiskLevel(ass2018?.RiskLevel ?? -1),
                        Field.Store.YES));
                    indexFields.Add(new StringField(Field_2018Status, "vurdert", Field.Store.NO));
                }
                else
                {
                    indexFields.Add(new StringField(Field_Category2018, "NR", Field.Store.YES)); 
                    indexFields.Add(new StringField(Field_2018Status, "ikkevurdert", Field.Store.NO));
                }

                if (ass2018.MainCategory == "RegionallyAlien")
                {
                    indexFields.Add(new StringField(Field_2018Status, "regionallyAlien", Field.Store.NO));
                }
                if (ass2018.MainCategory == "AlienSpecie" || ass2018.MainCategory == "DoorKnocker")
                {
                    if (ass2018.MainCategory == "AlienSpecie") 
                    {
                        indexFields.Add(new StringField(Field_2018Status, "establishedAfter1800", Field.Store.NO));
                    }
                    
                    if (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "doRiskAssessment")
                    {
                        indexFields.Add(new StringField(Field_2018Status, "doorKnocker", Field.Store.NO));
                    }

                    if (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "noRiskAssessment")
                    {
                        indexFields.Add(new StringField(Field_2018Status, "notAssessedDoorKnocker", Field.Store.NO));
                    }
                }
                else if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "establishedBefore1800")
                {
                    indexFields.Add(new StringField(Field_2018Status, "establishedBefore1800", Field.Store.NO));
                }

                if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "canNotEstablishWithin50years")
                {
                    indexFields.Add(new StringField(Field_2018Status, "notEstablishedFor50Years", Field.Store.NO));
                }
                
                if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "traditionalProductionSpecie")
                {
                    indexFields.Add(new StringField(Field_2018Status, "traditionalProductionSpecies", Field.Store.NO));
                }

                if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "NotPresentInRegion")
                {
                    indexFields.Add(new StringField(Field_2018Status, "notFoundInNorway", Field.Store.NO));
                }

                if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "taxonIsEvaluatedInHigherRank")
                {
                    indexFields.Add(new StringField(Field_2018Status, "sharesMotherSpeciesStatus", Field.Store.NO));
                }

                if (ass2018.MainCategory == "EcoEffectWithoutEstablishment")
                {
                    indexFields.Add(new StringField(Field_2018Status, "effectWithoutEstablishment", Field.Store.NO));
                }

                // todo: krever ny migreringspatch
                if (!string.IsNullOrWhiteSpace(ass2018.DecisiveCriteria))
                {
                    foreach (var criteria in _criterias)
                        if (ass2018.DecisiveCriteria.Contains(criteria, StringComparison.InvariantCulture))
                            indexFields.Add(new StringField(Field_Criteria2018, criteria, Field.Store.NO));

                    indexFields.Add(new StringField(Field_CriteriaAll2018, ass2018.DecisiveCriteria, Field.Store.YES));
                }
            }

            if (!string.IsNullOrWhiteSpace(ass.RiskAssessment.DecisiveCriteria))
            {
                foreach (var criteria in _criterias)
                    if (ass.RiskAssessment.DecisiveCriteria.Contains(criteria, StringComparison.InvariantCulture))
                        indexFields.Add(new StringField(Field_Criteria, criteria, Field.Store.NO));

                indexFields.Add(new StringField(Field_CriteriaAll, ass.RiskAssessment.DecisiveCriteria, Field.Store.YES));
            }

            //var ids = result.Select(x => int.Parse(x.Id)).ToArray();
            var comments = assessment.Comments.ToArray();
            var latest = comments.Any() ? comments.Max(x => x.CommentDate) : DateTime.MinValue;
            var closed = comments.Count(x => x.Closed);
            var open = comments.Count(y =>
                !y.Closed); // && !y.Comment.StartsWith(TaksonomiskEndring) &&
            //!y.Comment.StartsWith(PotensiellTaksonomiskEndring));
            var comenters = comments
                .Where(y => y.IsDeleted == false && y.Closed == false)
                .GroupBy(x=>x.UserId).Select(x => new {x.Key, maxDate = x.Max(y=>y.CommentDate) }).ToArray();
            foreach (var comenter in comenters)
            {
                var newCount = comments.Count(y => y.IsDeleted == false && y.Closed == false && y.UserId != comenter.Key &&
                                                   y.CommentDate > comenter.maxDate);
                if (newCount > 0)
                {
                    indexFields.Add(new StringField(Field_CommentsNew, comenter.Key.ToString(), Field.Store.YES));
                }
            }
            //var newCommentsForUserId = (from commenter in comments.Where(y =>
            //        y.IsDeleted == false && y.Closed == false).Select(x => x.UserId).ToArray()
            //    let newones = comments.Count(y => y.IsDeleted == false && y.Closed == false && y.UserId != commenter &&
            //                                      y.CommentDate > (comments.Any(y2 =>
            //                                          y2.IsDeleted == false && y2.UserId == commenter)
            //                                          ? comments.Where(y2 =>
            //                                                  y2.IsDeleted == false && y2.UserId == commenter)
            //                                              .Max(z => z.CommentDate)
            //                                          : DateTime.Now))
            //    select new Tuple<Guid, int>(commenter, newones)).ToList();

            var taxonchange = comments.Any(y =>
                y.Type == CommentType.PotentialTaxonomicChange && y.IsDeleted == false &&
                y.Closed == false)
                ? 2
                : comments.Any(y =>
                    y.Type == CommentType.TaxonomicChange && y.IsDeleted == false &&
                    y.Closed == false)
                    ? 1
                    : 0;

            indexFields.Add(new StringField(Field_NewestComment, latest.ToString("yyyy-dd-MM HH:mm"), Field.Store.YES));
            indexFields.Add(new StringField(Field_CommentsClosed, closed.ToString(), Field.Store.YES));
            //foreach (var tuple in newCommentsForUserId.Where(x=>x.Item2 > 0))
            //    document.Add(new StringField(Field_CommentsNew, tuple.Item1 + ";" + tuple.Item2, Field.Store.YES));
            indexFields.Add(new StringField(Field_CommentsOpen, open.ToString(), Field.Store.YES));
            indexFields.Add(new StringField(Field_TaxonChange, taxonchange.ToString(), Field.Store.YES));


            return indexFields;
        }

        private static S2018 ExtractPotentialDoorKnocker(S2018 s2018)
        {
            switch (s2018)
            {
                case S2018.notEstablishedWithin50Years:
                case S2018.notAssessedDoorKnocker:
                case S2018.traditionalProductionSpecie:
                case S2018.notPresentInRegion:
                    return S2018.NR2018;
                default:
                    return S2018.newPotentialDoorKnocker;
            }
        }

        private static S2018 ExtractNotAssessedDoorKnocker(S2018 s2018)
        {
            switch (s2018)
            {
                case S2018.notEstablishedWithin50Years:
                case S2018.notAssessedDoorKnocker:
                case S2018.traditionalProductionSpecie:
                case S2018.notPresentInRegion:
                    return s2018;
                default:
                    return S2018.assessed;
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

        private static S2018 Get2018NotAssessed(FA4 ass)
        {
            var ass2018 = ass.PreviousAssessments.FirstOrDefault(x => x.RevisionYear == 2018);
            if (ass2018 == null) return S2018.NR2018;

            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "canNotEstablishWithin50years")
                return S2018.notEstablishedWithin50Years;
            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "traditionalProductionSpecie")
                return S2018.traditionalProductionSpecie;
            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "NotPresentInRegion")
                return S2018.notPresentInRegion;
            if (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "noRiskAssessment")
                return S2018.notAssessedDoorKnocker;
            return S2018.assessed;
        }

        private static string GetCategoryFromRiskLevel(int riskLevel2012)
        {
            switch (riskLevel2012)
            {
                case 0: return "NK";
                case 1: return "LO";
                case 2: return "PH";
                case 3: return "HI";
                case 4: return "SE";
                //case -1: return "-";
                default:
                    return "NR";
            }
        }

        private static bool IsDocumentEvaluated(FA4 ass)
        {
            if (!(ass.IsAlienSpecies.HasValue && ass.IsAlienSpecies.Value == true)) return false;

            if (ass.AlienSpeciesCategory == "UncertainBefore1800") return false;

            if (ass.AlienSpeciesCategory == "NotDefined") return false; // todo: This should probably also be "WillNotBeRiskAssessed" (?? check this)
            if (ass.AlienSpeciesCategory == "EffectWithoutReproduction") return false;
            if (ass.AlienSpeciesCategory == "AlienSpecie" ||
                ass.AlienSpeciesCategory == "EcoEffectWithoutEstablishment")
                return true;
            if (ass.AlienSpeciesCategory == "DoorKnocker")
                return ass.DoorKnockerCategory == "doRiskAssessment";
            if (ass.AlienSpeciesCategory == "RegionallyAlien")
                return ass.RegionallyAlienCategory == "doRiskAssessment";
            if (ass.AlienSpeciesCategory == "NotApplicable")
                return false;
            return false; // should not be reachable // todo: replace with exception
        }

        private static bool Is2018DocumentEvaluated(string alienSpeciesCategory, string doorKnockerCategory,
            string regionallyAlienCategory)
        {
            if (alienSpeciesCategory == "AlienSpecie" || alienSpeciesCategory == "EcoEffectWithoutEstablishment")
                return true;
            if (alienSpeciesCategory == "DoorKnocker")
                return doorKnockerCategory == "doRiskAssessment";
            if (alienSpeciesCategory == "RegionallyAlien")
                return regionallyAlienCategory == "doRiskAssessment";
            if (alienSpeciesCategory == "NotApplicable")
                return false;
            return false; // should not be reachable // todo: replace with exception
        }

        public static AssessmentListItem GetDocumentFromIndex(Document doc)
        {
            return new AssessmentListItem
            {
                Id = doc.Get(Field_Id),
                Expertgroup = doc.Get(Field_Group),
                EvaluationStatus = doc.Get(Field_EvaluationStatus),
                LastUpdatedBy = doc.Get(Field_LastUpdatedBy),
                LastUpdatedAt = Convert.ToDateTime(doc.Get(Field_LastUpdatedAt)),
                LockedForEditByUser = doc.Get(Field_LockedForEditByUser),
                LockedForEditAt = Convert.ToDateTime(doc.Get(Field_LockedForEditAt)),
                ScientificName = doc.Get(Field_ScientificName),
                ScientificNameAuthor = doc.Get(Field_ScientificNameAuthor),
                TaxonHierarcy = doc.Get(Field_TaxonHierarcy),
                Category = doc.Get(Field_Category),
                Category2018 = doc.Get(Field_Category2018),
                Criteria = doc.Get(Field_CriteriaAll),
                AssessmentContext = doc.Get(Field_AssessmentContext),
                PopularName = doc.Get(Field_PopularName),
                HorizontScanResult = int.Parse(doc.Get(Field_HsResult)),
                CommentDate = doc.Get(Field_NewestComment),
                CommentClosed = int.Parse(doc.Get(Field_CommentsClosed)),
                CommentOpen = int.Parse(doc.Get(Field_CommentsOpen)),
                TaxonChange = int.Parse(doc.Get(Field_TaxonChange)),
                CommentNew = 1
            };
        }

        public static Query QueryGetDocumentQuery(string expertgroupname, int scientificNameId)
        {
            Query query = new BooleanQuery();
            ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Group, new[] { expertgroupname }), Occur.MUST);
            ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_ScientificNameId, new[] { scientificNameId.ToString() }),
                Occur.MUST);
            return query;
        }

        public static Query QueryGetDocumentQuery(string expertgroupid, IndexFilter filter)
        {
            Query query = new BooleanQuery();
            if (!string.IsNullOrWhiteSpace(expertgroupid) && expertgroupid != "0")
                ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Group, new[] { expertgroupid }), Occur.MUST);

            if (!string.IsNullOrWhiteSpace(filter.NameSearch) && filter.NameSearch != "/")
            {
                var pathSearch = filter.NameSearch.StartsWith("/");
                var booleanQuery = new BooleanQuery();
                var lowerInvariant = WebUtility.UrlDecode(filter.NameSearch.ToLowerInvariant())
                    .Replace("×", "")
                    .Replace("-", " ")
                    .Replace("/", "")
                    .Split(" ", StringSplitOptions.RemoveEmptyEntries);
                var booleanQuerySc = new BooleanQuery();
                var booleanQueryP = new BooleanQuery();
                foreach (var s in lowerInvariant)
                {
                    var text = "*" + s + "*";
                    if (pathSearch)
                    {
                        booleanQuerySc.Add(
                            new BooleanClause(new WildcardQuery(new Term(Field_TaxonPath, text)),
                                Occur.MUST)); // lowercase - siden det er indeksert som textfield
                    }
                    else
                    {
                        booleanQuerySc.Add(
                            new BooleanClause(new WildcardQuery(new Term(Field_ScientificName, text)),
                                Occur.MUST)); // lowercase - siden det er indeksert som textfield
                        booleanQueryP.Add(new BooleanClause(new WildcardQuery(new Term(Field_PopularName, text)),
                            Occur.MUST));

                    }
                }

                booleanQuery.Add(booleanQuerySc, Occur.SHOULD);
                booleanQuery.Add(booleanQueryP, Occur.SHOULD);
                ((BooleanQuery)query).Add(booleanQuery, Occur.MUST);
            }

            // horizonscan filters
            if (filter.HorizonScan)
            {
                ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_DoHorizonScanning, new[] { "1" }), Occur.MUST);

                // or between elements group with must then list of clauses with should
                var queryElements = new List<BooleanClause>();
                if (filter.Horizon.NotStarted)
                    queryElements.Add(
                        new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "2" }), Occur.SHOULD));

                if (filter.Horizon.Finished)
                    queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "1", "0" }),
                        Occur.SHOULD));

                if (filter.Horizon.ToAssessment)
                    queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "1" }), Occur.SHOULD));

                if (filter.Horizon.NotAssessed)
                    queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "0" }), Occur.SHOULD));

                if (filter.Comments.KunUbehandlede)
                    queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_CommentsOpen, new[] { "1" }), Occur.MUST));
                QueryAddOrElements(queryElements, query);

                if (filter.Horizon.NR2018.Any())
                {
                    queryElements = new List<BooleanClause>();
                    foreach (var s in filter.Horizon.NR2018)
                    {
                        var nr2018 = (S2018)int.Parse(s);
                        switch (nr2018)
                        {
                            case S2018.notAssessed:
                                queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_NR2018,
                                    new[]
                                    {
                                        S2018.notAssessedDoorKnocker.ToString(),
                                        S2018.traditionalProductionSpecie.ToString(),
                                        S2018.notEstablishedWithin50Years.ToString()
                                    }), Occur.SHOULD));
                                break;
                            default:
                                queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_NR2018,
                                    new[]
                                    {
                                        nr2018.ToString()
                                    }), Occur.SHOULD));
                                break;
                        }
                    }

                    QueryAddOrElements(queryElements, query);
                }

                if (filter.Responsible.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_LastUpdatedBy, filter.Responsible), Occur.MUST);
            }
            else
            {
                // filter 
                ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_DoHorizonScanning, new[] { "0" }), Occur.MUST);

                // filtrer på vurderingsansvarlig
                if (filter.Responsible.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_LastUpdatedBy, filter.Responsible), Occur.MUST);

                

                // filtrer på framdrift
                if (filter.Status.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_ProgressStatus, filter.Status), Occur.MUST);
                // filtrer på HS-status
                if (filter.HSStatus)
                    ((BooleanQuery)query).Add(new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "1" }), Occur.MUST));
                // filtrer på kommentarer
                if (filter.Comments.CommentType.Contains("allAssessmentsWithComments"))
                    ((BooleanQuery)query).Add(new BooleanClause(QueryGetFieldQuery(Field_CommentsOpen, new[] { "1" }), Occur.MUST));
                if (filter.Comments.CommentType.Contains("newComments") && filter.Comments.UserId != Guid.Empty)
                    ((BooleanQuery)query).Add(new BooleanClause(QueryGetFieldQuery(Field_CommentsNew, new[] { filter.Comments.UserId.ToString() }), Occur.MUST)); //new PrefixQuery(new Term(Field_CommentsNew, filter.Comments.UserId.ToString() + ";*")), Occur.MUST));
                // autoTaxonChange,taxonChangeRequiresUpdate
                if (filter.Comments.CommentType.Contains("autoTaxonChange"))
                    ((BooleanQuery)query).Add(new BooleanClause(QueryGetFieldQuery(Field_TaxonChange, new[] { "1" }), Occur.MUST));
                if (filter.Comments.CommentType.Contains("taxonChangeRequiresUpdate"))
                    ((BooleanQuery)query).Add(new BooleanClause(QueryGetFieldQuery(Field_TaxonChange, new[] { "2" }), Occur.MUST));
                // filtrer på kommentarer

                if (filter.History.Category.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Category2018, filter.History.Category), Occur.MUST);

                if (filter.History.Criteria.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Criteria2018, filter.History.Criteria), Occur.MUST);

                if (filter.History.Status.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_2018Status, filter.History.Status), Occur.MUST);


                if (filter.Current.Category.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Category, filter.Current.Category), Occur.MUST);

                if (filter.Current.Criteria.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Criteria, filter.Current.Criteria), Occur.MUST);

                if (filter.Current.Status.Length > 0)
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_CurrentStatus, filter.Current.Status), Occur.MUST);


            }


            if (((BooleanQuery)query).Clauses.Count == 0) query = new MatchAllDocsQuery();

            return query;
        }

        private static void QueryAddOrElements(List<BooleanClause> queryElements, Query query)
        {
            if (queryElements.Any())
            {
                var que = new BooleanQuery();
                if (queryElements.Count == 1)
                {
                    ((BooleanQuery)query).Add(queryElements[0].Query, Occur.MUST);
                }
                else
                {
                    foreach (var clause in queryElements) que.Add(clause);
                    ((BooleanQuery)query).Add(que, Occur.MUST);
                }
            }
        }

        private static Query QueryGetFieldQuery(string field, string[] terms)
        {
            Query que;
            if (terms.Length == 1)
            {
                que = new TermQuery(new Term(field, terms[0]));
            }
            else
            {
                que = new BooleanQuery();
                foreach (var term in terms) ((BooleanQuery)que).Add(new TermQuery(new Term(field, term)), Occur.SHOULD);
            }

            return que;
        }

        private static Query QueryGetPrefixFieldQuery(string field, string[] terms)
        {
            Query que;
            if (terms.Length == 1)
            {
                que = new PrefixQuery(new Term(field, terms[0]));
            }
            else
            {
                que = new BooleanQuery();
                foreach (var term in terms)
                    ((BooleanQuery)que).Add(new PrefixQuery(new Term(field, term)), Occur.SHOULD);
            }

            return que;
        }


        public static bool DateTimesSignificantlyDifferent(DateTime date1, DateTime date2)
        {
            return Math.Abs((date1 - date2).TotalSeconds) > 1;
        }

        /// <summary>
        ///     Categories of assessments
        /// </summary>
        private enum S2018
        {
            assessed = 0,
            NR2018 = 1,

            /// <summary>
            ///     Only for gruping - not for index - use specific one below
            /// </summary>
            notAssessed = 5,
            notAssessedDoorKnocker = 6,
            notEstablishedWithin50Years = 7,
            traditionalProductionSpecie = 8,
            newPotentialDoorKnocker = 9,
            notPresentInRegion = 10
        }
    }
}
