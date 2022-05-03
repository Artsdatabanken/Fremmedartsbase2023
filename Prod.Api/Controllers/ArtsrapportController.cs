using System;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
//using IdentityModel.Client;
//using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Prod.Api.Helpers;
using Prod.Api.Hubs;
using Prod.Api.Services;
using Prod.Data.EFCore;
using Prod.Domain;
//using Prod.Api.Hubs;
//using Databank.Domain;
using Microsoft.Extensions.Configuration;

namespace Prod.Api.Controllers
{
    [Route("api/[controller]")]
    //[Authorize]
    public class ArtsrapportController : Controller
    {

        private readonly string endPoint;
        private readonly ProdDbContext _dbContext;
        private readonly IHubContext<MessageHub> _hubContext;
        //private readonly Index _index;
        private readonly IReferenceService _referenceService;

        public ArtsrapportController(ProdDbContext dbContext, IReferenceService referenceService, IHubContext<MessageHub> hubContext) : base()
        {
            _dbContext = dbContext;
            _referenceService = referenceService;
            _hubContext = hubContext;
            //endPoint = configuration.GetValue<string>("FeedbackEndPoint");
            endPoint = "http://localhost:25807/";
        }

        private Public.Domain.FA2023 ToPublicDomain(Prod.Domain.FA4 proddoc, Public.Domain.Code code)
        {
            var mapper = SwissKnife.Database.Fab4ToFab2023Mapper.CreateMappingFromFA4ToFA2023();
            Public.Domain.FA2023 newAssessment = mapper.Map<Public.Domain.FA2023>(proddoc);
            return newAssessment;
        }

        //        public ActionResult Index()
        //        {
        //            return View();
        //        }


        [HttpGet("assessment/{id}")]
        public async Task<Public.Domain.FA2023> GetAssessment(int id)
        {
            var data = await _dbContext.Assessments.Where(x => x.Id == id).Select(x => x.Doc).FirstOrDefaultAsync();
            if (string.IsNullOrWhiteSpace(data)) return null;
            var fab4doc = JsonSerializer.Deserialize<FA4>(data);
            var fab2023doc = ToPublicDomain(fab4doc, null);
            return fab2023doc;
        }

        //        [HttpGet("assessmentview/{id}")]
        //        public async Task<IActionResult> AssessmentView(int id)
        //        {
        //            var ass = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();
        //            var data = ass.Doc;
        //            if (string.IsNullOrWhiteSpace(data)) return null;
        //            var doc = Prod.LoadingCSharp.TransformRodliste2019toDatabankRL2021.TransformAssessment(ass.Id, null, data);
        //            //Code kodecode = await GetCodes(endPoint + "api/Kode/101");
        //            //Code labelcode = await GetCodes(endPoint + "api/Kode/3");
        //            Code kodecode = await GetCodes(101);
        //            Code labelcode = await GetCodes(3);
        //            var labels = labelcode.Children;
        //            var codes = kodecode.Children;
        //            var CondLabel = new Func<string, Func<string, string>>(kodeid => new Func<string, string>(key => (string.IsNullOrEmpty(key) ? "" : (labels[kodeid].Where(code => code.Value == key).Select(code => code.Text).FirstOrDefault()))));
        //            var CondKode = new Func<string, Func<string, string>>(kodeid => new Func<string, string>(key => (string.IsNullOrEmpty(key) ? "" : (codes[kodeid].Where(code => code.Value == key).Select(code => code.Text).FirstOrDefault()))));
        //            var NtLabels = CondLabel("NatureTypes");
        //            var ae = NtLabels("affectedArea");
        //            //var fbLabel = CondLabel("feedback");
        //            bool vurdert = doc.OverordnetKlassifiseringGruppeKode == "rodlisteVurdertArt";
        //            //ViewBag.Feedbacks = feedbacks.Where(ufb => ufb.ContextId == context && ufb.TaxonId == taxonId && ufb.FeedbackStatus == Domain.UserFeedbackStatus.ConfirmedByUser); // new List<Prod.Domain.UserFeedback>();
        //            //ViewBag.EncodedChapta = feedbackService.CreateEncryptedKey();  // aes.EncryptToString(chapta);
        //            //ViewBag.Feedbacks = new List<Domain.UserFeedback>(); //todo: implement real
        //            ViewBag.Vurdert = vurdert;
        //            ViewBag.Labels = labels;
        //            ViewBag.Codes = codes;
        //            //ViewBag.FbLabel = fbLabel;
        //            //return View(master, doc );
        //            ViewBag.Layout =  "";
        //            return View("AssessmentView", doc);
        //        }

        //        public static async Task<Code> GetCodes(string url)
        //        {
        //            Databank.Domain.Code maincode = null;
        //            using (var httpClient = new HttpClient())
        //            {
        //                using (var response = await httpClient.GetAsync(url))
        //                {
        //                    string json = await response.Content.ReadAsStringAsync();
        //                    maincode = JsonConvert.DeserializeObject<Databank.Domain.Code>(json);
        //                }
        //            }

        //            return maincode;
        //        }

        //        public async Task<Code> GetCodes(int id)
        //        {
        //            var json = _dbContext.Koder.First(x => x.Id == id).JsonData;
        //            var maincode = JsonConvert.DeserializeObject<Databank.Domain.Code>(json);
        //            return maincode;
        //        }
    }
}
