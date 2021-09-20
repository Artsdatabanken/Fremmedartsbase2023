using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Lucene.Net.Documents;
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
        public static async Task<DateTime> Index(bool clear, ProdDbContext _dbContext, Index _index)
        {
            //if (_index.IndexCount() > 1 && _index.IndexCount() < 5000) return;


            if (clear) _index.ClearIndex();

            var batchSize = 1000;
            var pointer = 0;
            var maxDate = DateTime.MinValue;
            while (true)
            {
                 var result = await _dbContext.Assessments.Where(x => x.IsDeleted == false).OrderBy(x => x.Id).Skip(pointer).Take(batchSize)
                     .ToArrayAsync();
                 if (result.Length == 0)
                 {
                     break;
                 }
                 pointer += result.Length;
                 var tempDate = result.Max(x => x.LastUpdatedAt);
                 if (maxDate < tempDate)
                 {
                     maxDate = tempDate;
                 }
                
                 var docs = result.Select(GetDocumentFromAssessment).ToArray();
                 _index.AddOrUpdate(docs);
            }

            if (await _dbContext.TimeStamp.SingleOrDefaultAsync() == null)
            {
                _dbContext.TimeStamp.Add(new TimeStamp() { Id = 1, DateTimeUpdated = maxDate });
                await _dbContext.SaveChangesAsync();
            }
            _index.SetIndexVersion(new IndexVersion() { Version = IndexHelper.IndexVersion, DateTime = maxDate });

            return maxDate;
        }

        private const string Field_Id = "Id";
        private const string Field_Group = "Expertgroup";
        private const string Field_EvaluationStatus = "EvaluationStatus";
        private const string Field_LastUpdatedBy = "LastUpdatedBy";
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

        public const int IndexVersion = 3;
        private const string Field_DoHorizonScanning = "DoHorizonScan";

        private static Document GetDocumentFromAssessment(Assessment assessment)
        {
            var ass = JsonSerializer.Deserialize<FA4>(assessment.Doc);
            //string kategori = ass.Kategori; // string.IsNullOrWhiteSpace(ass.Kategori) ? "" : ass.Kategori.Substring(0,2);
            var document = new Document
            {
                new StringField(Field_Id, assessment.Id.ToString(), Field.Store.YES),
                // StringField indexes but doesn't tokenize - Case important
                new StringField(Field_Group, ass.ExpertGroup, Field.Store.YES),
                new StringField(Field_EvaluationStatus, ass.EvaluationStatus, Field.Store.YES),
                //new StoredField(Field_LastUpdatedBy, ass.LastUpdatedBy),
                //new StoredField(Field_LastUpdatedAt, ass.LastUpdatedOn.ToString()),
                //new StoredField(Field_LockedForEditByUser, ass.LockedForEditByUser?? string.Empty),
                //new StoredField(Field_LockedForEditAt, ass.LockedForEditAt.ToString()),
                new TextField(Field_ScientificName, ass.EvaluatedScientificName, Field.Store.YES), // textfield - ignore case
                new StringField(Field_ScientificNameAsTerm, ass.EvaluatedScientificName.ToLowerInvariant(), Field.Store.NO), // textfield - ignore case
                //new StoredField(Field_TaxonHierarcy, ass.VurdertVitenskapeligNavnHierarki),
                //new StringField(Field_Category, kategori, Field.Store.YES),
                //new StringField(Field_AssessmentContext, ass.VurderingsContext, Field.Store.YES),
                new TextField(Field_PopularName, ass.EvaluatedVernacularName??string.Empty, Field.Store.YES),
                new StringField(Field_DoHorizonScanning, ass.HorizonDoScanning ? "1" : "0", Field.Store.YES)
            };

            //Kategori
            //if (ass.Kriterier.Contains("A", StringComparison.InvariantCulture))
            //{
            //    document.Add(new StringField(Field_Criteria, "A", Field.Store.YES));
            //}
            //if (ass.Kriterier.Contains("B", StringComparison.InvariantCulture))
            //{
            //    document.Add(new StringField(Field_Criteria, "B", Field.Store.YES));
            //}
            //if (ass.Kriterier.Contains("C", StringComparison.InvariantCulture))
            //{
            //    document.Add(new StringField(Field_Criteria, "C", Field.Store.YES));
            //}
            //if (ass.Kriterier.Contains("D", StringComparison.InvariantCulture))
            //{
            //    document.Add(new StringField(Field_Criteria, "D", Field.Store.YES));
            //}
            //if (ass.Kriterier.Contains("E", StringComparison.InvariantCulture))
            //{
            //    document.Add(new StringField(Field_Criteria, "E", Field.Store.YES));
            //}
            //document.Add(new StoredField(Field_CriteriaAll, ass.Kriterier));

            // naturtyper
            //foreach (var hab in ass.NaturtypeHovedenhet)
            //{
            //    document.Add(new StringField(Field_Habitat, hab, Field.Store.NO));
            //}

            // Regioner
            //foreach (var s in ass.Regioner)
            //{
            //    document.Add(new StringField(Field_Regioner, s, Field.Store.NO));
            //}

            // art underart
            //if (ass.TaxonRank.ToLowerInvariant() == "Species".ToLowerInvariant())
            //{
            //    document.Add(new StringField(Field_Rank, "Art", Field.Store.NO));
            //}
            //else if (ass.TaxonRank.ToLowerInvariant() == "SubSpecies".ToLowerInvariant())
            //{
            //    document.Add(new StringField(Field_Rank, "UnderArt", Field.Store.NO));
            //}

            // utdødd
            //if (ass.Kategori == "CR" && ass.TroligUtdodd == true)
            //{
            //    document.Add(new StringField(Field_Utdodd, "1", Field.Store.NO));
            //}

            // europeisk bestand
            //if (ass.MaxAndelAvEuropeiskBestand == "< 1 %" || ass.MaxAndelAvEuropeiskBestand == "1 - 5 %" || ass.MaxAndelAvEuropeiskBestand == "< 5 %")
            //{
            //    document.Add(new StringField(Field_EurB, "5", Field.Store.NO));
            //}
            //if (ass.MaxAndelAvEuropeiskBestand == "5 - 25 %")
            //{
            //    document.Add(new StringField(Field_EurB, "5-25", Field.Store.NO));
            //}
            //if (ass.MaxAndelAvEuropeiskBestand == "25 - 50 %")
            //{
            //    document.Add(new StringField(Field_EurB, "25-50", Field.Store.NO));
            //}
            //if (ass.MaxAndelAvEuropeiskBestand == "> 50 %")
            //{
            //    document.Add(new StringField(Field_EurB, "50", Field.Store.NO));
            //}

            // year
            //if (ass.Vurderingsår == 2010)
            //{
            //    document.Add(new StringField(Field_Year, "2010", Field.Store.NO));
            //}
            //else
            //{
            //    if (ass.Vurderingsår == 2021)
            //    {
            //        document.Add(new StringField(Field_Year, "2021", Field.Store.NO));
            //    }

            //    if (!string.IsNullOrWhiteSpace(ass.ImportInfo.Kategori2015))
            //    {
            //        document.Add(new StringField(Field_Year, "2015", Field.Store.NO));
            //    }
            //    if (!string.IsNullOrWhiteSpace(ass.ImportInfo.Kategori2010))
            //    {
            //        document.Add(new StringField(Field_Year, "2010", Field.Store.NO));
            //    }
            //}

            //if (ass.ÅrsakTilEndringAvKategori != null && ass.KategoriFraForrigeListe != ass.Kategori)
            //{
            //    document.Add(new StringField(Field_EndringKat, "1", Field.Store.NO));
            //}

            return document;
        }

        public static AssessmentListItem GetAssessmentListItemFromIndex(Document doc)
        {
            return new AssessmentListItem()
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
                Criteria = doc.Get(Field_CriteriaAll),
                AssessmentContext = doc.Get(Field_AssessmentContext),
                PopularName = doc.Get(Field_PopularName)
                //new TextField("favoritePhrase", source.FavoritePhrase, Field.Store.YES)
                ,
            };
        }

        public static Query CreateDocumentQuery(string expertgroupid, IndexFilter filter)
        {
            Query query = new BooleanQuery();
            if (!string.IsNullOrWhiteSpace(expertgroupid) && expertgroupid != "0")
            {
                ((BooleanQuery)query).Add(GetFieldQuery(Field_Group, new[] { expertgroupid }), Occur.MUST);
            }

            if (filter.HorizonScan)
            {
                ((BooleanQuery)query).Add(GetFieldQuery(Field_DoHorizonScanning, new[] { "1" }), Occur.MUST);
            }
            else
            {
                ((BooleanQuery)query).Add(GetFieldQuery(Field_DoHorizonScanning, new[] { "0" }), Occur.MUST);
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

            //    ((BooleanQuery)query).Add(GetFieldQuery(Field_Group, terms.ToArray()), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Category))
            //{
            //    var terms = filter.Category.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(GetPrefixFieldQuery(Field_Category, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Criteria))
            //{
            //    var terms = filter.Criteria.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(GetFieldQuery(Field_Criteria, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.AssessmentContext))
            //{
            //    var terms = filter.AssessmentContext.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(GetFieldQuery(Field_AssessmentContext, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Habitat))
            //{
            //    var terms = filter.Habitat.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(GetFieldQuery(Field_Habitat, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Regions))
            //{
            //    var terms = filter.Regions.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(GetFieldQuery(Field_Regioner, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Taxonrank))
            //{
            //    var terms = filter.Taxonrank.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(GetFieldQuery(Field_Rank, terms), Occur.MUST);
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
            //    ((BooleanQuery)query).Add(GetFieldQuery(Field_EurB, terms), Occur.MUST);
            //}

            //if (!string.IsNullOrWhiteSpace(filter.Year))
            //{
            //    var terms = filter.Year.Split(',', StringSplitOptions.RemoveEmptyEntries);
            //    ((BooleanQuery)query).Add(GetFieldQuery(Field_Year, terms), Occur.MUST);
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

            if (((BooleanQuery)query).Clauses.Count == 0)
            {
                query = new MatchAllDocsQuery();
            }

            return query;
        }

        private static Query GetFieldQuery(string field, string[] terms)
        {
            Query que;
            if (terms.Length == 1)
            {
                que = new TermQuery(new Term(field, terms[0]));
            }
            else
            {
                que = new BooleanQuery();
                foreach (var term in terms)
                {
                    ((BooleanQuery)que).Add(new TermQuery(new Term(field, term)), Occur.SHOULD);
                }
            }

            return que;
        }
        private static Query GetPrefixFieldQuery(string field, string[] terms)
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
                {
                    ((BooleanQuery)que).Add(new PrefixQuery(new Term(field, term)), Occur.SHOULD);
                }
            }

            return que;
        }
    }
}
