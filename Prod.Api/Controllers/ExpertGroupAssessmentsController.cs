using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CsvHelper;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using Nbic.Indexer;
// using Newtonsoft.Json;
using Prod.Api.Helpers;
using Prod.Api.Models;
using Prod.Data.EFCore;
using Prod.Domain;
using Prod.Feedback.Services;
using Index = Nbic.Indexer.Index;

// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting


//using Raven.Client.Documents;

namespace Prod.Api.Controllers
{
    [Route("api/[controller]")]
    public partial class ExpertGroupAssessmentsController : AuthorizeApiController
    {

        private readonly ProdDbContext _dbContext;
        private readonly Index _index;
        //private const string PotensiellTaksonomiskEndring = "Potensiell taksonomisk endring: ";
        //private const string TaksonomiskEndring = "Automatisk endring av navn: ";

        public ExpertGroupAssessmentsController(IDiscoveryCache discoveryCache, ProdDbContext dbContext, Nbic.Indexer.Index index) : base(discoveryCache, dbContext)
        {
            _dbContext = dbContext;
            _index = index;
        }
        public class ExpertgroupAssessments
        {
            public User.UserRoleInExpertGroup Rolle { get; set; }
            public List<AssessmentListItem> Assessments { get; set; }
            public List<Facet> Facets { get; set; }
            public int TotalCount { get; set; }
        }

        //// GET api/assessment/5
        //[HttpGet("{id}")]
        //[Authorize]
        //public async Task<ExpertgroupAssessments> Get(string id)
        //{
        //    var expertgroupid = id.Replace('_', '/');
        //    var roleInGroup = await GetRoleInGroup(id);
        //    var expertgroupAssessments = new ExpertgroupAssessments
        //    {
        //        Rolle = roleInGroup,
        //        Assessments = await GetExpertGroupAssessments(expertgroupid,new IndexFilter(), roleInGroup.User.Id)
        //    };
        //    return expertgroupAssessments;

        //}// GET api/assessment/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ExpertgroupAssessments> Get(string id, [FromQuery] IndexFilter filter)
        {
            var expertgroupid = id.Replace('_', '/');
            var roleInGroup = await GetRoleInGroup(id);

            FilteredAssessments filteredAssessments = await GetExpertGroupAssessments(expertgroupid, filter, roleInGroup.User.Id);
            var expertgroupAssessments = new ExpertgroupAssessments
            {
                Rolle = roleInGroup,
                Assessments =filteredAssessments.assessmentList,
                Facets = filteredAssessments.Facets,
                TotalCount = filteredAssessments.TotalCount 
            };
            return expertgroupAssessments;

        }
        

        [HttpGet("export/{id}")]
        //[Authorize]
        public FileResult GetExport(string id)
        {
            var expertgroupid = id.Replace('_', '/');

            var result = GetAssessmentsFromDb(expertgroupid, Array.Empty<string>());
            var mem = CreateCvsMemoryStream(result);

            return new FileStreamResult(mem, "text/csv")
            {
                FileDownloadName = id.Replace(" ", "") + "eksport.csv"
            };

        }

        [HttpGet("export/all")]
        //[Authorize]
        public FileResult GetExport()
        {
            //var expertgroupid = id.Replace('_', '/');
            var exlude = new[] { "LC", "LCº", "NA", "NE" };
            var result = GetAssessmentsFromDb("", exlude);

            var mem = CreateCvsMemoryStream(result);

            return new FileStreamResult(mem, "text/csv")
            {
                FileDownloadName = "eksportall.csv"
            };
        }
        [HttpGet("export/absoluteall")]
        //[Authorize]
        public FileResult GetExportAbsoluteAll()
        {
            //var expertgroupid = id.Replace('_', '/');
            var result = GetAssessmentsFromDb("", Array.Empty<string>());

            var mem = CreateCvsMemoryStream(result);

            return new FileStreamResult(mem, "text/csv")
            {
                FileDownloadName = "eksportabsoluteall.csv"
            };
        }

        private static MemoryStream CreateCvsMemoryStream(List<FA4WithComments> result)
        {
            var mem = new MemoryStream();
            var writer = new StreamWriter(mem, Encoding.Unicode);
            //var csvConfiguration = new CsvConfiguration(new CultureInfo("nb-NO"));
            var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
            var config = csv.Configuration;
            //config.Delimiter = "\t";
            //config.TypeConverterCache.RemoveConverter<string>();
            //config.TypeConverterCache.AddConverter<string>(new CsvHelpers.CustomStringConverter());
            //config.TypeConverterOptionsCache.GetOptions<string>().NullValues.Add(string.Empty);
            //config.TypeConverterCache.AddConverter<string[]>(new CsvHelpers.CustomStringArrayConverter());
            //config.TypeConverterCache.AddConverter<List<string>>(new CsvHelpers.CustomStringListConverter());
            ////config.TypeConverterCache.AddConverter<List<Rodliste2019.Pavirkningsfaktor>>(new CsvHelpers.CustomPavirkningsfaktorListConverter());
            ////config.TypeConverterCache.AddConverter<Rodliste2019.MinMaxProbable>(new CustomMinMaxProbableConverter());
            ////config.TypeConverterCache.AddConverter<Rodliste2019.MinMaxProbableIntervall>(new CsvHelpers.CustomMinMaxProbableIntervallConverter());
            //config.RegisterClassMap<CsvHelpers.RodlisteToCsvMap>();

            csv.WriteRecords(result);
            csv.Flush();
            writer.Flush();

            //byte[] fileBytes = ... ;
            mem.Position = 0;
            return mem;
        }

        private List<FA4WithComments> GetAssessmentsFromDb(string expertgroupid, string[] exlude)
        {
            var result = _dbContext.Assessments
                .FromSqlRaw(
                    "SELECT Id, Expertgroup, IsDeleted FROM dbo.Assessments WITH (INDEX(IX_Assessments_Expertgroup))"); // index hint - speeds up computed columns
            result = !string.IsNullOrWhiteSpace(expertgroupid) ? result.Where(x => x.Expertgroup == expertgroupid) : result.Where(x => x.Expertgroup != "Testarter");

            //if (exlude.Length > 0)
            //{
            //    result = result.Where(x => !exlude.Contains(x.Category));
            //}

            var rodlisteIds = result.Where(x => x.IsDeleted == false).Select(x => x.Id);
            var rodliste2019WithCommentses = _dbContext.Assessments.FromSqlRaw(
                    "SELECT * FROM dbo.Assessments WITH (INDEX(IX_Assessments_Expertgroup))").Where(x => rodlisteIds.Contains(x.Id))
            //result
            //    .Where(x => x.IsDeleted == false)
                //.OrderBy(x => x.ScientificName)
                .ToList()
                .Select(assessment =>
                {
                    var deserializeObject = System.Text.Json.JsonSerializer.Deserialize<FA4WithComments>(assessment.Doc);
                    deserializeObject.Id = deserializeObject.Id == 0 ? assessment.Id : deserializeObject.Id;
                    return deserializeObject;
                })
                .OrderBy(x=>x.EvaluatedScientificName)
            .ToList();
            if (exlude.Length > 0)
            {
                rodliste2019WithCommentses = rodliste2019WithCommentses.Where(x => !exlude.Contains(x.RiskAssessment.RiskLevelCode)).ToList();
            }
            //var ids = rodliste2019WithCommentses.Select(x => int.Parse(x.Id)).ToArray();

            var commentStats = _dbContext.Comments.Where(x => rodlisteIds.Contains(x.AssessmentId) && x.IsDeleted == false).AsEnumerable()
                    .GroupBy(x => x.AssessmentId)
                    .Select(
                        x => new
                        {
                            AssessmentId = x.Key,
                            Latest = x.Max(y => y.CommentDate),
                            Closed = x.Count(y => y.Closed),
                            Open = x.Count(y => !y.Closed && y.Type == CommentType.Ordinary),
                            TaxonChange = x.Any(y => y.Type == CommentType.PotentialTaxonomicChange && y.IsDeleted == false && y.Closed == false) ? 2 : (x.Any(y => y.Type == CommentType.TaxonomicChange && y.IsDeleted == false && y.Closed == false) ? 1 : 0)
                        }).ToDictionary(x => x.AssessmentId);
            foreach (var assessmentListItem in rodliste2019WithCommentses)
            {
                var key = assessmentListItem.Id;
                if (commentStats.ContainsKey(key))
                {
                    var stats = commentStats[key];
                    assessmentListItem.NewestCommentDate = stats.Latest.ToString("yyyy-dd-MM HH:mm");
                    assessmentListItem.CommentClosed = stats.Closed;
                    assessmentListItem.CommentOpen = stats.Open;
                    //assessmentListItem.CommentNew = stats.New;
                    assessmentListItem.TaxonChange = stats.TaxonChange;
                }
            }

            return rodliste2019WithCommentses;
        }
        private static readonly object _indexingLock = new object();
        private async Task<FilteredAssessments> GetExpertGroupAssessments(string expertgroupid, IndexFilter filter, Guid userId)
        {
            var doReturn = new FilteredAssessments();
            // want to know if index is correct - has the right stuff
            var indexVersion = _index.GetIndexVersion();
            
            // want to know if index is in sync with db - local index remote db
            var dbTimestamp = await _dbContext.TimeStamp.SingleOrDefaultAsync();

            //var assesmentTimestamp = dbTimestamp.DateTimeUpdated.AddMilliseconds(-dbTimestamp.DateTimeUpdated.Millisecond);
            //var commentTimestamp = dbTimestamp.CommentDateTimeUpdated = dbTimestamp.CommentDateTimeUpdated.AddMilliseconds(-dbTimestamp.DateTimeUpdated.Millisecond);
            if (dbTimestamp == null || indexVersion.Version != IndexHelper.IndexVersion) // not indexed yet or index is different now
            {
                // do full index
                // må da hente alle vurderinger indeksere disse og lagre max dato
                lock (_indexingLock)
                {
                    indexVersion = _index.GetIndexVersion();
                    dbTimestamp = _dbContext.TimeStamp.SingleOrDefault();
                    //dbTimestamp.DateTimeUpdated =
                    //    dbTimestamp.DateTimeUpdated.AddMilliseconds(-dbTimestamp.DateTimeUpdated.Millisecond);
                    if (dbTimestamp == null ||
                        indexVersion.Version != IndexHelper.IndexVersion) // not indexed yet or index is different now
                    {
                        var maxDate = IndexHelper.Index(true, _dbContext, _index);
                    }
                }


                // index should be complete now
            }
            else if (IndexHelper.DateTimesSignificantlyDifferent(indexVersion.DateTime, dbTimestamp.DateTimeUpdated))
            {
                // index assessments with new date - changes
                // må da hente nye endringer indeksere og lagre max dato
                var maxDate = await IndexHelper.Index(indexVersion.DateTime, _dbContext, _index);
            }

            filter.Page = 0;
            filter.PageSize = 1000;
            //filter.HorizonScan = true;
            var query = IndexHelper.QueryGetDocumentQuery(expertgroupid, filter);
            
            var result = _index.SearchReference(query, filter.Page, filter.PageSize, IndexHelper.Field_ScientificNameAsTerm).Select(IndexHelper.GetDocumentFromIndex)
                .ToList();
            var getAllQuery = IndexHelper.QueryGetDocumentQuery(expertgroupid, new IndexFilter(){ HorizonScan = filter.HorizonScan});
            var facets = _index.SearchFacetsReference(getAllQuery, new[] { IndexHelper.Facet_Author, IndexHelper.Facet_PotentialDoorKnocker, IndexHelper.Facet_NotAssessedDoorKnocker, IndexHelper.Facet_Progress });
            var totalCount = _index.SearchTotalCount(getAllQuery);
            //var result = await _dbContext.Assessments
            //    .FromSqlRaw("SELECT Id, TaxonHierarcy, LockedForEditBy, LastUpdatedBy, Expertgroup, EvaluationStatus, Category, LockedForEditAt, LastUpdatedAt, ScientificName, ScientificNameId, PopularName, IsDeleted FROM dbo.Assessments WITH (INDEX(IX_Assessments_Expertgroup))") // index hint - speeds up computed columns
            //    .Where(x => x.Expertgroup == expertgroupid && x.IsDeleted == false).OrderBy(x => x.ScientificName)
            //    .Select(x =>
            //        new AssessmentListItem()
            //        {
            //            Id = x.Id.ToString(),
            //            Expertgroup = x.Expertgroup,
            //            EvaluationStatus = x.EvaluationStatus,
            //            LastUpdatedBy = x.LastUpdatedByUser.FullName,
            //            LastUpdatedByUserId = x.LastUpdatedByUser.Id,
            //            LastUpdatedAt = x.LastUpdatedAt,
            //            LockedForEditByUser = x.LockedForEditByUser != null ? x.LockedForEditByUser.FullName : string.Empty,
            //            LockedForEditByUserId = x.LockedForEditByUser != null ? x.LockedForEditByUser.Id : Guid.Empty,
            //            LockedForEditAt = x.LockedForEditAt,
            //            ScientificName = x.ScientificName,
            //            TaxonHierarcy = x.TaxonHierarcy,
            //            Category = x.Category,
            //            PopularName = x.PopularName
            //        }).OrderBy(x => x.ScientificName).ToListAsync();

            //var ids = result.Select(x => int.Parse(x.Id)).ToArray();
            //var commentStats = _dbContext.Comments.Where(x => ids.Contains(x.AssessmentId) && x.IsDeleted == false).AsEnumerable()
            //    .GroupBy(x => x.AssessmentId)
            //    .Select(
            //        x => new
            //        {
            //            AssessmentId = x.Key,
            //            Latest = x.Max(y => y.CommentDate),
            //            Closed = x.Count(y => y.Closed),
            //            Open = x.Count(y => !y.Closed && !y.Comment.StartsWith(TaksonomiskEndring) && !y.Comment.StartsWith(PotensiellTaksonomiskEndring)),
            //            New = x.Count(y => y.IsDeleted == false && y.Closed == false && y.UserId != userId && y.CommentDate >
            //                (x.Any(y2 => y2.IsDeleted == false && y2.UserId == userId)
            //                ? x.Where(y2 => y2.IsDeleted == false && y2.UserId == userId).Max(z => z.CommentDate)
            //                : DateTime.Now)
            //                     ),// x.Where(y=>y.IsDeleted == false && y.Closed == false && y.UserId == brukerId).Max(z=>z.CommentDate),
            //            TaxonChange = x.Any(y => y.Comment.StartsWith(PotensiellTaksonomiskEndring) && y.IsDeleted == false && y.Closed == false) ? 2 : (x.Any(y => y.Comment.StartsWith(TaksonomiskEndring) && y.IsDeleted == false && y.Closed == false) ? 1 : 0)
            //        }).ToDictionary(x => x.AssessmentId);
            //foreach (var assessmentListItem in result)
            //{
            //    var key = int.Parse(assessmentListItem.Id);
            //    if (commentStats.ContainsKey(key))
            //    {
            //        var stats = commentStats[key];
            //        assessmentListItem.CommentDate = stats.Latest.ToString("yyyy-dd-MM HH:mm");
            //        assessmentListItem.CommentClosed = stats.Closed;
            //        assessmentListItem.CommentOpen = stats.Open;
            //        assessmentListItem.CommentNew = stats.New;
            //        assessmentListItem.TaxonChange = stats.TaxonChange;
            //    }
            //}
            //foreach (var ali in result)
            //{
            //    if (ali.TaxonHierarcy != null)
            //    {
            //        var s = ali.TaxonHierarcy.ToLower().Split('/');
            //        //var t = s.Skip(Math.Max(0, s.Count() - 4));
            //        var t = s.Skip(3);
            //        //var u = t.Concat(new[] { ali.ScientificName });
            //        ali.SearchStrings = t.ToList();
            //    }
            //    else
            //    {
            //        ali.SearchStrings = new List<string>();
            //    }
            //}
            doReturn.assessmentList = result;
            doReturn.TotalCount = totalCount;
            doReturn.Facets = facets.Select(x => new Facet()
            {
                Name = x.Dim,
                FacetsItems = x.LabelValues.Select(y => new FacetItem() { Name = y.Label, Count = (int)y.Value })
                    .ToList()
            }).ToList();
            
            return doReturn;
        }

        //[ServiceFilter(typeof(ClientIpCheckActionFilter))]
        [HttpGet("DropIndex")]
        public async Task DoDeleteIndexAsync()
        {
            this.Response.StatusCode = 200;
            this.Response.Headers.Add(HeaderNames.ContentType, "text/html");
            var outputStream = this.Response.Body;
            UnicodeEncoding uniencoding = new UnicodeEncoding();
            Task task = Task.Run(() => { _index.ClearIndex(); });
            while (true)
            {
                if (task.IsCompleted)
                {
                    break;
                }
                Thread.Sleep(1000);
                await outputStream.WriteAsync(uniencoding.GetBytes("."), 0, uniencoding.GetBytes(".").Length);
            }

            await outputStream.WriteAsync(uniencoding.GetBytes("done!"), 0, uniencoding.GetBytes("done!").Length);
            await outputStream.FlushAsync();
        }
        //[ServiceFilter(typeof(ClientIpCheckActionFilter))]
        [HttpGet("Reindex")]
        public async Task DoReindexAsync()
        {
            this.Response.StatusCode = 200;
            this.Response.Headers.Add(HeaderNames.ContentType, "text/html");
            var outputStream = this.Response.Body;
            UnicodeEncoding uniencoding = new UnicodeEncoding();
            Task task = Task.Run(() => { IndexHelper.Index(true, _dbContext, _index); });
            while (true)
            {
                if (task.IsCompleted)
                {
                    break;
                }
                Thread.Sleep(1000);
                await outputStream.WriteAsync(uniencoding.GetBytes("."), 0, uniencoding.GetBytes(".").Length);
            }

            await outputStream.WriteAsync(uniencoding.GetBytes("done!"), 0, uniencoding.GetBytes("done!").Length);
            await outputStream.FlushAsync();
        }
        // [Route("Index")]
        // public ActionResult<bool> Doindex()
        // {
        //     Index(false);
        //     return true;
        // }
        //private async Task<List<AssessmentListItem>> GetExpertGroupAssessments(string expertgroupid, Guid brukerId)
        //{
        //    var result = await _dbContext.Assessments
        //                     //.FromSqlRaw("SELECT Id, TaxonHierarcy, LockedForEditBy, LastUpdatedBy, Expertgroup, EvaluationStatus, Category, LockedForEditAt, LastUpdatedAt, ScientificName, ScientificNameId, PopularName, IsDeleted FROM dbo.Assessments WITH (INDEX(IX_Assessments_Expertgroup))") // index hint - speeds up computed columns
        //                     .Where(x => x.Expertgroup == expertgroupid && x.IsDeleted == false).OrderBy(x => x.ScientificName)
        //        .Select(x =>
        //            new AssessmentListItem()
        //            {
        //                Id = x.Id.ToString(),
        //                Expertgroup = x.Expertgroup,
        //                EvaluationStatus = x.EvaluationStatus,
        //                LastUpdatedBy = x.LastUpdatedByUser.FullName,
        //                LastUpdatedByUserId = x.LastUpdatedByUser.Id,
        //                LastUpdatedAt = x.LastUpdatedAt,
        //                LockedForEditByUser = x.LockedForEditByUser != null ? x.LockedForEditByUser.FullName : string.Empty,
        //                LockedForEditByUserId = x.LockedForEditByUser != null ? x.LockedForEditByUser.Id : Guid.Empty,
        //                LockedForEditAt = x.LockedForEditAt,
        //                ScientificName = x.ScientificName,
        //                TaxonHierarcy = x.TaxonHierarcy,
        //                Category = x.Category,
        //                PopularName = x.PopularName
        //            }).OrderBy(x => x.ScientificName).ToListAsync();
        //    var ids = result.Select(x => int.Parse(x.Id)).ToArray();
        //    var commentStats = _dbContext.Comments.Where(x => ids.Contains(x.AssessmentId) && x.IsDeleted == false).AsEnumerable()
        //        .GroupBy(x => x.AssessmentId)
        //        .Select(
        //            x => new
        //            {
        //                AssessmentId = x.Key,
        //                Latest = x.Max(y => y.CommentDate),
        //                Closed = x.Count(y => y.Closed),
        //                Open = x.Count(y => !y.Closed && y.Type == CommentType.Ordinary),
        //                New = x.Count(y => y.IsDeleted == false && y.Closed == false && y.UserId != brukerId && y.CommentDate >
        //                    (x.Any(y2 => y2.IsDeleted == false && y2.UserId == brukerId)
        //                    ? x.Where(y2 => y2.IsDeleted == false && y2.UserId == brukerId).Max(z => z.CommentDate)
        //                    : DateTime.Now)
        //                         ),// x.Where(y=>y.IsDeleted == false && y.Closed == false && y.UserId == brukerId).Max(z=>z.CommentDate),
        //                TaxonChange = x.Any(y => y.Type == CommentType.PotentialTaxonomicChange && y.IsDeleted == false && y.Closed == false) ? 2 : (x.Any(y => y.Type == CommentType.TaxonomicChange && y.IsDeleted == false && y.Closed == false) ? 1 : 0)
        //            }).ToDictionary(x => x.AssessmentId);
        //    foreach (var assessmentListItem in result)
        //    {
        //        var key = int.Parse(assessmentListItem.Id);
        //        if (commentStats.ContainsKey(key))
        //        {
        //            var stats = commentStats[key];
        //            assessmentListItem.CommentDate = stats.Latest.ToString("yyyy-dd-MM HH:mm");
        //            assessmentListItem.CommentClosed = stats.Closed;
        //            assessmentListItem.CommentOpen = stats.Open;
        //            assessmentListItem.CommentNew = stats.New;
        //            assessmentListItem.TaxonChange = stats.TaxonChange;
        //        }
        //    }
        //    //foreach (var ali in result)
        //    //{
        //    //    if (ali.TaxonHierarcy != null)
        //    //    {
        //    //        var s = ali.TaxonHierarcy.ToLower().Split('/');
        //    //        //var t = s.Skip(Math.Max(0, s.Count() - 4));
        //    //        var t = s.Skip(3);
        //    //        //var u = t.Concat(new[] { ali.ScientificName });
        //    //        ali.SearchStrings = t.ToList();
        //    //    }
        //    //    else
        //    //    {
        //    //        ali.SearchStrings = new List<string>();
        //    //    }
        //    //}

        //    return result;
        //}
    }
}
