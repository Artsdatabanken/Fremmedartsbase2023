﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using Prod.Api.Helpers;
using Prod.Api.Models;
using Prod.Data.EFCore;
using Prod.Domain;
using Index = Nbic.Indexer.Index;

// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting


namespace Prod.Api.Controllers
{
    [Route("api/[controller]")]
    public class ExpertGroupAssessmentsController : AuthorizeApiController
    {
        private static readonly object IndexingLock = new();

        private readonly ProdDbContext _dbContext;

        private readonly Index _index;

        public ExpertGroupAssessmentsController(IDiscoveryCache discoveryCache, ProdDbContext dbContext, Index index) :
            base(discoveryCache, dbContext)
        {
            _dbContext = dbContext;
            _index = index;
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

            var filteredAssessments = await GetExpertGroupAssessments(expertgroupid, filter);
            var expertgroupAssessments = new ExpertgroupAssessments
            {
                Rolle = roleInGroup,
                Assessments = filteredAssessments.assessmentList,
                Facets = filteredAssessments.Facets,
                TotalCount = filteredAssessments.TotalCount
            };
            return expertgroupAssessments;
        }


        [HttpGet("export/{type}/{id}")]
        //[Authorize]
        public FileResult GetExport(string type, string id)
        {
            var expertgroupid = id.Replace('_', '/');
            var hor = type == "horizonScanning";

            var result = GetAssessmentsFromDb(expertgroupid, Array.Empty<string>()).Where(x=>x.HorizonDoScanning == hor).ToList();
            var mem = CreateCvsMemoryStream(result, hor);

            return new FileStreamResult(mem, "text/csv")
            {
                FileDownloadName = id.Replace(" ", "") + "eksport.csv"
            };
        }

        [HttpGet("export/{type}/all")]
        [Authorize]
        public FileResult GetExport(string type)
        {
            var hor = type == "horizonScanning";
            var exlude = new[] { "LC", "LCº", "NA", "NE" };
            var result = GetAssessmentsFromDb("", exlude).Where(x => x.HorizonDoScanning == hor).ToList(); ;

            var mem = CreateCvsMemoryStream(result, hor);

            return new FileStreamResult(mem, "text/csv")
            {
                FileDownloadName = "eksportall.csv"
            };
        }

        [HttpGet("export/{type}/absoluteall")]
        [Authorize]
        public FileResult GetExportAbsoluteAll(string type)
        {
            var hor = type == "horizonScanning";
            var result = GetAssessmentsFromDb("", Array.Empty<string>()).Where(x => x.HorizonDoScanning == hor).ToList(); ;

            var mem = CreateCvsMemoryStream(result, hor);

            return new FileStreamResult(mem, "text/csv")
            {
                FileDownloadName = "eksportabsoluteall.csv"
            };
        }

        private static MemoryStream CreateCvsMemoryStream(List<FA4WithComments> result, bool hor)
        {
            var mem = new MemoryStream();
            var writer = new StreamWriter(mem, Encoding.Unicode);
            //var csvConfiguration = new CsvConfiguration(new CultureInfo("nb-NO"));
            var config = new CsvConfiguration(CultureInfo.DefaultThreadCurrentCulture)
            {
                Delimiter = "\t"
            };
            //config.Delimiter = "\t";
            //config.TypeConverterCache.RemoveConverter<string>(); 
            //config.TypeConverterCache.AddConverter<string>(new CsvHelpers.CustomStringConverter());
            //config.TypeConverterOptionsCache.GetOptions<string>().NullValues.Add(string.Empty);
            //config.TypeConverterCache.AddConverter<string[]>(new CsvHelpers.CustomStringArrayConverter());
            //config.TypeConverterCache.AddConverter<List<string>>(new CsvHelpers.CustomStringListConverter());
            ////config.TypeConverterCache.AddConverter<List<Rodliste2019.Pavirkningsfaktor>>(new CsvHelpers.CustomPavirkningsfaktorListConverter());
            ////config.TypeConverterCache.AddConverter<Rodliste2019.MinMaxProbable>(new CustomMinMaxProbableConverter());
            ////config.TypeConverterCache.AddConverter<Rodliste2019.MinMaxProbableIntervall>(new CsvHelpers.CustomMinMaxProbableIntervallConverter());
            //config. .RegisterClassMap<CsvHelpers.FremmedartToCsvMap>();
            var csv = new CsvWriter(writer, config);
            //csv.Context.RegisterClassMap<CsvHelpers.FremmedartToCsvMap>();
            csv.Context.TypeConverterCache.RemoveConverter<string>();
            csv.Context.TypeConverterCache.AddConverter<string>(new CsvHelpers.CustomStringConverter());
            csv.Context.TypeConverterOptionsCache.GetOptions<string>().NullValues.Add(string.Empty);
            //var options = new TypeConverterOptions { Formats = new[] { "o" } };
            //csv.Context.TypeConverterOptionsCache.AddOptions<DateTime>(options);
            //csv.Context.TypeConverterOptionsCache.AddOptions<DateTime?>(options);

            var mapper = Helpers.ExportMapper.InitializeMapper();
            switch (hor)
            {
                case true:
                    csv.WriteRecords(mapper.Map<FA4HorizonScanExport[]>(result));
                    break;
                default:
                    csv.WriteRecords(mapper.Map<FA4Export[]>(result));
                    break;
            }
            
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
            result = !string.IsNullOrWhiteSpace(expertgroupid)
                ? result.Where(x => x.Expertgroup == expertgroupid)
                : result.Where(x => x.Expertgroup != "Testarter");

            //if (exlude.Length > 0)
            //{
            //    result = result.Where(x => !exlude.Contains(x.Category));
            //}

            var ids = result.Where(x => x.IsDeleted == false).Select(x => x.Id);
            var fa4WithCommentsList = _dbContext.Assessments.Include(x=>x.LastUpdatedByUser)
                .Where(x => ids.Contains(x.Id))
                //result
                //    .Where(x => x.IsDeleted == false)
                //.OrderBy(x => x.ScientificName)
                .ToList()
                .Select(assessment =>
                {
                    var deserializeObject = JsonSerializer.Deserialize<FA4WithComments>(assessment.Doc);
                    Debug.Assert(deserializeObject != null, nameof(deserializeObject) + " != null");
                    deserializeObject.Id = deserializeObject.Id == 0 ? assessment.Id : deserializeObject.Id;
                    deserializeObject.LastUpdatedBy = assessment.LastUpdatedByUser.FullName;
                    return deserializeObject;
                })
                .OrderBy(x => x.EvaluatedScientificName)
                .ToList();
            if (exlude.Length > 0)
                fa4WithCommentsList = fa4WithCommentsList
                    .Where(x => !exlude.Contains(x.RiskAssessment.RiskLevelCode)).ToList();
            //var ids = rodliste2019WithCommentses.Select(x => int.Parse(x.Id)).ToArray();

            var commentStats = _dbContext.Comments
                .Where(x => ids.Contains(x.AssessmentId) && x.IsDeleted == false).AsEnumerable()
                .GroupBy(x => x.AssessmentId)
                .Select(
                    x => new
                    {
                        AssessmentId = x.Key,
                        Latest = x.Max(y => y.CommentDate),
                        Closed = x.Count(y => y.Closed),
                        Open = x.Count(y => !y.Closed && y.Type == CommentType.Ordinary),
                        TaxonChange =
                            x.Any(y => y.Type == CommentType.PotentialTaxonomicChange && y.IsDeleted == false &&
                                       y.Closed == false) ? 2 :
                            x.Any(y => y.Type == CommentType.TaxonomicChange && y.IsDeleted == false &&
                                       y.Closed == false) ? 1 : 0
                    }).ToDictionary(x => x.AssessmentId);
            foreach (var assessmentListItem in fa4WithCommentsList)
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

            return fa4WithCommentsList;
        }

        private async Task<FilteredAssessments> GetExpertGroupAssessments(string expertgroupid, IndexFilter filter)
        {
            var doReturn = new FilteredAssessments();
            // want to know if index is correct - has the right stuff
            var indexVersion = _index.GetIndexVersion();

            // want to know if index is in sync with db - local index remote db
            var dbTimestamp = await _dbContext.TimeStamp.SingleOrDefaultAsync();

            //var assesmentTimestamp = dbTimestamp.DateTimeUpdated.AddMilliseconds(-dbTimestamp.DateTimeUpdated.Millisecond);
            //var commentTimestamp = dbTimestamp.CommentDateTimeUpdated = dbTimestamp.CommentDateTimeUpdated.AddMilliseconds(-dbTimestamp.DateTimeUpdated.Millisecond);
            if (dbTimestamp == null ||
                indexVersion.Version != IndexHelper.IndexVersion) // not indexed yet or index is different now
            {
                // do full index
                // må da hente alle vurderinger indeksere disse og lagre max dato
                lock (IndexingLock)
                {
                    indexVersion = _index.GetIndexVersion();
                    dbTimestamp = _dbContext.TimeStamp.SingleOrDefault();
                    //dbTimestamp.DateTimeUpdated =
                    //    dbTimestamp.DateTimeUpdated.AddMilliseconds(-dbTimestamp.DateTimeUpdated.Millisecond);
                    if (dbTimestamp == null ||
                        indexVersion.Version != IndexHelper.IndexVersion) // not indexed yet or index is different now
                    {
                        IndexHelper.ReIndex(_dbContext, _index);
                    }
                }


                // index should be complete now
            }
            else if (IndexHelper.DateTimesSignificantlyDifferent(indexVersion.DateTime, dbTimestamp.DateTimeUpdated))
            {
                // index assessments with new date - changes
                // må da hente nye endringer indeksere og lagre max dato
                await IndexHelper.Index(indexVersion.DateTime, _dbContext, _index);
            }

            filter.Page = 0;
            filter.PageSize = 1000;
            //filter.HorizonScan = true;
            var query = IndexHelper.QueryGetDocumentQuery(expertgroupid, filter);

            var result = _index
                .SearchReference(query, filter.Page, filter.PageSize, IndexHelper.Field_ScientificNameAsTerm)
                .Select(IndexHelper.GetDocumentFromIndex)
                .ToList();
            var getAllQuery =
                IndexHelper.QueryGetDocumentQuery(expertgroupid, new IndexFilter { HorizonScan = filter.HorizonScan });
            var facets = _index.SearchFacetsReference(getAllQuery,
                new[]
                {
                    IndexHelper.Facet_Author, IndexHelper.Facet_PotentialDoorKnocker,
                    IndexHelper.Facet_NotAssessedDoorKnocker, IndexHelper.Facet_Progress
                });
            var totalCount = _index.SearchTotalCount(getAllQuery);

            doReturn.assessmentList = result;
            doReturn.TotalCount = totalCount;
            if (doReturn.TotalCount > 0)
                doReturn.Facets = facets.Select(x => new Facet
                {
                    Name = x.Dim,
                    FacetsItems = x.LabelValues.Select(y => new FacetItem { Name = y.Label, Count = (int)y.Value })
                        .ToList()
                }).ToList();
            else
                doReturn.Facets = new List<Facet>
                {
                    new() { Name = "Author", FacetsItems = new List<FacetItem>() },
                    new() { Name = "PotentialDoorKnocker", FacetsItems = new List<FacetItem>() },
                    new() { Name = "NotAssessedDoorKnocker", FacetsItems = new List<FacetItem>() },
                    new() { Name = "Progress", FacetsItems = new List<FacetItem>() }
                };


            return doReturn;
        }

        //[ServiceFilter(typeof(ClientIpCheckActionFilter))]
        [HttpGet("DropIndex")]
        public async Task DoDeleteIndexAsync()
        {
            Response.StatusCode = 200;
            Response.Headers.Add(HeaderNames.ContentType, "text/html");
            var outputStream = Response.Body;
            var uniencoding = new UnicodeEncoding();
            var task = Task.Run(() => { _index.ClearIndex(); });
            while (true)
            {
                if (task.IsCompleted) break;
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
            Response.StatusCode = 200;
            Response.Headers.Add(HeaderNames.ContentType, "text/html");
            var outputStream = Response.Body;
            var uniencoding = new UnicodeEncoding();
            var task = Task.Run(() => { IndexHelper.ReIndex(_dbContext, _index); });
            while (true)
            {
                if (task.IsCompleted) break;
                Thread.Sleep(1000);
                await outputStream.WriteAsync(uniencoding.GetBytes("."), 0, uniencoding.GetBytes(".").Length);
            }

            await outputStream.WriteAsync(uniencoding.GetBytes("done!"), 0, uniencoding.GetBytes("done!").Length);
            await outputStream.FlushAsync();
        }

        public class ExpertgroupAssessments
        {
            public User.UserRoleInExpertGroup Rolle { get; set; }
            public List<AssessmentListItem> Assessments { get; set; }
            public List<Facet> Facets { get; set; }
            public int TotalCount { get; set; }
        }
    }
}