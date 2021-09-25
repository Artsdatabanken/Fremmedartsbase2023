﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using System.Threading.Tasks;
using Lucene.Net.Documents;
using Lucene.Net.Facet;
using Lucene.Net.Facet.Taxonomy;
using Lucene.Net.Index;
using Lucene.Net.Search;
using Microsoft.EntityFrameworkCore;
using Nbic.Indexer;
using Prod.Api.Controllers;
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
        public const int IndexVersion = 12;

        private const string Field_Id = "Id";
        private const string Field_Group = "Expertgroup";
        private const string Field_EvaluationStatus = "EvaluationStatus";
        internal const string Field_LastUpdatedBy = "LastUpdatedBy";
        private const string Field_LastUpdatedAt = "LastUpdatedAt";
        private const string Field_LockedForEditByUser = "LockedForEditByUser";
        private const string Field_LockedForEditAt = "LockedForEditAt";
        private const string Field_ScientificName = "ScientificName";
        public const string Field_ScientificNameAsTerm = "ScientificNameTerm";
        private const string Field_TaxonHierarcy = "TaxonHierarcy";
        private const string Field_Category = "Category";
        private const string Field_Criteria = "Criteria";
        private const string Field_CriteriaAll = "CriteriaAll";

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

        private const string Field_Category2018 = "Category";

        private const string Field_DoHorizonScanning = "DoHorizonScan";
        private const string Field_HsStatus = "HsStatus";
        private const string Field_HsDone = "HsDone";
        private const string Field_HsResult = "HsStatus";
        private const string Field_Status = "Status";

        //facets - telle antall!!
        public const string Facet_Author = "Author";
        public const string Facet_Progress = "Progress";
        public const string Facet_Group = "Group";
        private static readonly string Field_NR2018 = "NR2018";
        private static string[] _criterias = new[] { "A", "B", "C", "D", "E", "F", "G", "H", "I" };

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
                    .Where(x => x.IsDeleted == false && x.LastUpdatedAt > minDate)
                    .OrderBy(x => x.Id)
                    .Skip(pointer).Take(batchSize)
                    .ToArrayAsync();
                if (result.Length == 0) break;
                pointer += result.Length;
                var tempDate = result.Max(x => x.LastUpdatedAt);
                if (maxDate < tempDate) maxDate = tempDate;

                var docs = result.Select(GetDocumentFromAssessment).ToArray();
                _index.AddOrUpdate(docs);
            }

            if (await _dbContext.TimeStamp.SingleOrDefaultAsync() == null)
            {
                _dbContext.TimeStamp.Add(new TimeStamp { Id = 1, DateTimeUpdated = maxDate });
                await _dbContext.SaveChangesAsync();
            }

            _index.SetIndexVersion(new IndexVersion { Version = IndexVersion, DateTime = maxDate });

            return maxDate;
        }
        public static DateTime Index(bool clear, ProdDbContext _dbContext, Index _index)
        {
            //if (_index.IndexCount() > 1 && _index.IndexCount() < 5000) return;


            if (clear) _index.ClearIndex();

            var batchSize = 1000;
            var pointer = 0;
            var maxDate = DateTime.MinValue;
            while (true)
            {
                var result = _dbContext.Assessments.Include(x => x.LastUpdatedByUser)
                    .Include(x => x.LockedForEditByUser).Where(x => x.IsDeleted == false).OrderBy(x => x.Id)
                    .Skip(pointer).Take(batchSize)
                    .ToArray();
                if (result.Length == 0) break;
                pointer += result.Length;
                var tempDate = result.Max(x => x.LastUpdatedAt);
                if (maxDate < tempDate) maxDate = tempDate;

                var docs = result.Select(GetDocumentFromAssessment).ToArray();
                _index.AddOrUpdate(docs);
            }

            if (_dbContext.TimeStamp.SingleOrDefault() == null)
            {
                _dbContext.TimeStamp.Add(new TimeStamp { Id = 1, DateTimeUpdated = maxDate });
                _dbContext.SaveChanges();
            }

            _index.SetIndexVersion(new IndexVersion { Version = IndexVersion, DateTime = maxDate });

            return maxDate;
        }

        public static void Index(Assessment assessment, Index index)
        {
            var doc = GetDocumentFromAssessment(assessment);
            index.AddOrUpdate(doc);
            index.SetIndexVersion(new IndexVersion { Version = IndexVersion, DateTime = assessment.LastUpdatedAt });
        }
        //private const string Field_DateLastSave = "DateSave";

        private static Document GetDocumentFromAssessment(Assessment assessment)
        {
            var ass = JsonSerializer.Deserialize<FA4>(assessment.Doc);
            //string kategori = ass.Kategori; // string.IsNullOrWhiteSpace(ass.Kategori) ? "" : ass.Kategori.Substring(0,2);
            var ass2018 = ass.PreviousAssessments.FirstOrDefault(x => x.RevisionYear == 2018);
            var horizonScanResult = GetHorizonScanResult(ass);
            var get2018NotAssessed = Get2018NotAssessed(ass);
            var horResult = horizonScanResult.HasValue == true ? (horizonScanResult.Value ? "1" : "0") :"2";

            var document = new Document
            {
                new StringField(Field_Id, assessment.Id.ToString(), Field.Store.YES),
                // StringField indexes but doesn't tokenize - Case important
                new StringField(Field_Group, ass.ExpertGroup, Field.Store.YES),
                new StringField(Field_EvaluationStatus, ass.EvaluationStatus, Field.Store.YES),
                new StringField(Field_LastUpdatedBy, assessment.LastUpdatedByUser.FullName, Field.Store.YES),
                new StringField(Field_LastUpdatedAt, assessment.LastUpdatedAt.Date.ToString("s"), Field.Store.YES),
                new StoredField(Field_LockedForEditByUser,
                    assessment.LockedForEditByUser != null ? assessment.LockedForEditByUser.FullName : string.Empty),
                new StoredField(Field_LockedForEditAt, assessment.LockedForEditAt.ToString("s")),
                new TextField(Field_ScientificName, ass.EvaluatedScientificName,
                    Field.Store.YES), // textfield - ignore case
                new StringField(Field_ScientificNameAsTerm, ass.EvaluatedScientificName.ToLowerInvariant(),
                    Field.Store.NO), // textfield - ignore case
                //new StoredField(Field_TaxonHierarcy, ass.VurdertVitenskapeligNavnHierarki),
                new StringField(Field_Category, GetCategoryFromRiskLevel(ass.RiskAssessment.RiskLevel),
                    Field.Store.YES),
                new StringField(Field_Category2018, GetCategoryFromRiskLevel(ass2018?.RiskLevel ?? -1),
                    Field.Store.YES),
                //new StringField(Field_AssessmentContext, ass.VurderingsContext, Field.Store.YES),
                new TextField(Field_PopularName, ass.EvaluatedVernacularName ?? string.Empty, Field.Store.YES),
                new StringField(Field_DoHorizonScanning, ass.HorizonDoScanning ? "1" : "0", Field.Store.NO),
                new StringField(Field_NR2018, get2018NotAssessed.ToString(), Field.Store.NO),
                new StringField(Field_HsStatus, ass.HorizonScanningStatus, Field.Store.YES),
                //new StringField(Field_HsDone, ass.HorizonScanningStatus, Field.Store.YES),
                new StringField(Field_HsResult,  horResult, Field.Store.NO),
                new StringField(Field_Status, ass.EvaluationStatus, Field.Store.YES),
                // facets
                new FacetField(Facet_Author, assessment.LastUpdatedByUser.FullName),
                new FacetField(Facet_Progress, horResult),
                new FacetField(Facet_Group, get2018NotAssessed.ToString()),

            };

            if (!string.IsNullOrWhiteSpace(ass.RiskAssessment.DecisiveCriteria))
            {
                foreach (var criteria in _criterias)
                {
                    if (ass.RiskAssessment.DecisiveCriteria.Contains(criteria, StringComparison.InvariantCulture)) document.Add(new StringField(Field_Criteria, criteria, Field.Store.NO));
                }

                document.Add(new StringField(Field_CriteriaAll, ass.RiskAssessment.DecisiveCriteria, Field.Store.YES));
            }

            return document;
        }

        private static bool? GetHorizonScanResult(FA4 ass)
        {
            var pot = ass.HorizonEstablismentPotential ?? string.Empty;
            var effects = ass.HorizonEcologicalEffect ?? string.Empty;
            if (pot == string.Empty || effects == string.Empty)
            {
                return null;
            }
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
                        case "no":return false;
                        case "yesWhilePresent": 
                        case "yesAfterGone": return true;
                        default: return false;
                    }
                case "2":
                    return true;
            }

            return false;
        }

        private static NR2018 Get2018NotAssessed(FA4 ass)
        {
            var ass2018 = ass.PreviousAssessments.FirstOrDefault(x => x.RevisionYear == 2018);
            if (ass2018 == null) return NR2018.Not2018;

            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "canNotEstablishWithin50years")
                return NR2018.CannotEstablish50Years;
            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "traditionalProductionSpecie")
                return NR2018.TraditionalProductionSpecie;
            if (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "noRiskAssessment")
                return NR2018.NotAssessedDoorKnocker;
            return NR2018.Assessed;
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
                default:
                    return "NR";
            }
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
                TaxonHierarcy = doc.Get(Field_TaxonHierarcy),
                Category = doc.Get(Field_Category),
                Category2018 = doc.Get(Field_Category),
                Criteria = doc.Get(Field_CriteriaAll),
                AssessmentContext = doc.Get(Field_AssessmentContext),
                PopularName = doc.Get(Field_PopularName)
            };
        }

        public static Query QueryGetDocumentQuery(string expertgroupid, IndexFilter filter)
        {
            Query query = new BooleanQuery();
            if (!string.IsNullOrWhiteSpace(expertgroupid) && expertgroupid != "0")
                ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Group, new[] { expertgroupid }), Occur.MUST);

            if (!string.IsNullOrWhiteSpace(filter.NameSearch))
            {
                var booleanQuery = new BooleanQuery();
                var lowerInvariant = WebUtility.UrlDecode(filter.NameSearch.ToLowerInvariant())
                    .Replace("×", "")
                    .Replace("-", " ")
                    .Split(" ", StringSplitOptions.RemoveEmptyEntries);
                var booleanQuerySc = new BooleanQuery();
                var booleanQueryP = new BooleanQuery();
                foreach (var s in lowerInvariant)
                {
                    var text = "*" + s + "*";
                    booleanQuerySc.Add(
                        new BooleanClause(new WildcardQuery(new Term(Field_ScientificName, text)),
                            Occur.MUST)); // lowercase - siden det er indeksert som textfield
                    booleanQueryP.Add(new BooleanClause(new WildcardQuery(new Term(Field_PopularName, text)),
                        Occur.MUST));
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
                   queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "2" }), Occur.SHOULD));
                if (filter.Horizon.Finished)
                    queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "1","0" }), Occur.SHOULD));
                if (filter.Horizon.ToAssessment)
                    queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "1" }), Occur.SHOULD));
                if (filter.Horizon.NotAssessed)
                    queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_HsResult, new[] { "0" }), Occur.SHOULD));

                QueryAddOrElements(queryElements, query);

                if (filter.Horizon.NR2018.Any())
                {
                    queryElements = new List<BooleanClause>();
                    foreach (var s in filter.Horizon.NR2018)
                    {
                        var nr2018 = (NR2018)int.Parse(s);
                        switch (nr2018)
                        {
                            case NR2018.NotAssessed:
                                queryElements.Add(new BooleanClause(QueryGetFieldQuery(Field_NR2018,
                                    new[]
                                    {
                                        NR2018.NotAssessedDoorKnocker.ToString(),
                                        NR2018.TraditionalProductionSpecie.ToString(),
                                        NR2018.CannotEstablish50Years.ToString()
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
                {
                    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_LastUpdatedBy, filter.Responsible), Occur.MUST);
                }
            }
            else
            {
                ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_DoHorizonScanning, new[] { "0" }), Occur.MUST);
            }
            //if (!string.IsNullOrWhiteSpace(filter.Groups) && filter.Groups != "0")
            //{
            //    var terms = filter.Groups.Replace("amfibier, reptiler", "amfibier_reptiler").ToLowerInvariant()
            //        .Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
            //    if (terms.Any(x => x == "amfibier_reptiler"))
            //    {
            //        terms.Remove("amfibier_reptiler");
            //        terms.Add("amfibier, reptiler");
            //    }

            //    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Group, terms.ToArray()), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Category))
            //{
            //    var terms = filter.Category.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(QueryGetPrefixFieldQuery(Field_Category, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Criteria))
            //{
            //    var terms = filter.Criteria.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Criteria, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.AssessmentContext))
            //{
            //    var terms = filter.AssessmentContext.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_AssessmentContext, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Habitat))
            //{
            //    var terms = filter.Habitat.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Habitat, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Regions))
            //{
            //    var terms = filter.Regions.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Regioner, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Taxonrank))
            //{
            //    var terms = filter.Taxonrank.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Rank, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Extinct) && filter.Extinct == "true")
            //{
            //    ((BooleanQuery)query).Add(new TermQuery(new Term(Field_Utdodd, "1")), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.CategoryChange) && filter.CategoryChange == "true")
            //{
            //    ((BooleanQuery)query).Add(new TermQuery(new Term(Field_EndringKat, "1")), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Portion))
            //{
            //    var terms = filter.Portion.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_EurB, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Year))
            //{
            //    var terms = filter.Year.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(QueryGetFieldQuery(Field_Year, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Search))
            //{
            //    var booleanQuery = new BooleanQuery();
            //    var lowerInvariant = WebUtility.UrlDecode(filter.Search.ToLowerInvariant())
            //        .Replace("×", "")
            //        .Replace("-", " ")
            //        .Split(" ", StringSplitOptions.RemoveEmptyEntries);
            //    var booleanQuerySc = new BooleanQuery();
            //    var booleanQueryP = new BooleanQuery();
            //    foreach (var s in lowerInvariant)
            //    {
            //        var text = "*" + s + "*";
            //        booleanQuerySc.Add(
            //            new BooleanClause(new WildcardQuery(new Term(Field_ScientificName, text)),
            //                Occur.MUST)); // lowercase - siden det er indeksert som textfield
            //        booleanQueryP.Add(new BooleanClause(new WildcardQuery(new Term(Field_PopularName, text)), Occur.MUST));
            //    }

            //    booleanQuery.Add(booleanQuerySc, Occur.SHOULD);
            //    booleanQuery.Add(booleanQueryP, Occur.SHOULD);
            //    ((BooleanQuery)query).Add(booleanQuery, Occur.MUST);
            //}

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
                    foreach (var clause in queryElements) ((BooleanQuery)que).Add(clause);
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

        /// <summary>
        ///     Categories of assessments
        /// </summary>
        private enum NR2018
        {
            Assessed = 0,
            Not2018 = 1,

            /// <summary>
            ///     Only for gruping - not for index - use specific one below
            /// </summary>
            NotAssessed = 5,
            NotAssessedDoorKnocker = 6,
            CannotEstablish50Years = 7,
            TraditionalProductionSpecie = 8
        }


    }
}