//using System;
//using System.Linq;
//using System.Net.Http;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Mvc;
//using Newtonsoft.Json;
//using Microsoft.EntityFrameworkCore;
//using Prod.Api.Services;
//using Prod.Data.EFCore;
//using Prod.Domain;
//using Microsoft.AspNetCore.SignalR;
//using Prod.Api.Hubs;
//using Databank.Domain;
//using Microsoft.Extensions.Configuration;


//namespace Prod.Api.Controllers
//{
//    [Route("api/[controller]")]
//    //[Authorize]
//    public class ArtsrapportController : Controller
//    {

//        private readonly ProdDbContext _dbContext;
//        private readonly IReferenceService _referenceService;
//        private readonly IHubContext<MessageHub> _hubContext;
//        private readonly string endPoint;


//        public ArtsrapportController(ProdDbContext dbContext, IReferenceService referenceService, IHubContext<MessageHub> hubContext) : base()
//        //public AssessmentController(IDiscoveryCache discoveryCache, ProdDbContext dbContext, IReferenceService referenceService) : base(discoveryCache, dbContext)
//        {
//            _dbContext = dbContext;
//            _referenceService = referenceService;
//            _hubContext = hubContext;
//            //endPoint = configuration.GetValue<string>("FeedbackEndPoint");
//            endPoint = "http://localhost:25807/";
//        }

//        //////private Databank.Domain.RL2021 ToDatabankDomain(Prod.Domain.Rodliste2019 obj, Prod.Domain.KodeGrupper kodegrupper)
//        //private Databank.Domain.RL2021 ToDatabankDomain(Prod.Domain.Rodliste2019 proddoc, Databank.Domain.Code code)
//        //{
//        //    if (proddoc == null)
//        //        return null;
//        //    string jsonstring = JsonConvert.SerializeObject(proddoc);
//        //    var assessment = Prod.LoadingCSharp.TransformRodliste2019toDatabankRL2021.TransformAssessment(-1, code, jsonstring);
//        //    return assessment;
//        //}

//        public ActionResult Index()
//        {
//            return View();
//        }
//        //public ActionResult Norge(string id)
//        //{
//        //    return vurdering("N", id, "MinibankMaster");
//        //}
//        //public ActionResult Svalbard(string id)
//        //{
//        //    return vurdering("S", id, "MinibankMaster");
//        //}

//        //private static Dictionary<string, Dictionary<string, string>> ToKoder(Prod.Domain.KodeGrupper koderraw)
//        //{
//        //    var x = koderraw.Grupper.ToDictionary(
//        //                gruppe => gruppe.Key, gruppe => gruppe.Value.Where(a => !string.IsNullOrEmpty(a.Verdi)).ToDictionary(kode => kode.Verdi, kode => kode.Tekst));
//        //    return x;
//        //}

//        //private static void prossessMPCodes(Databank.Domain.Code c, Dictionary<string, string> acc)
//        //{
//        //    if (c.Children != null)
//        //    {
//        //        var first = c.Children.Values.FirstOrDefault();
//        //        if (first != null)
//        //        {
//        //            foreach (var item in first)
//        //            {
//        //                prossessMPCodes(item, acc);
//        //            }
//        //        }
//        //    }
//        //    else
//        //    {
//        //        acc.Add(c.Value, c.Text);
//        //    }
//        //}

//        //[HttpGet("assessment/{id}")]
//        //public async Task<Databank.Domain.RL2021> GetAssessment(int id)
//        //{
//        //    var ass = await _dbContext.Assessments.Where(x => x.Id == id).FirstOrDefaultAsync();// _dataService.GetAssessmentString(id);
//        //    var data = ass.Doc;
//        //    if (string.IsNullOrWhiteSpace(data)) return null;

//        //    var doc = Prod.LoadingCSharp.TransformRodliste2019toDatabankRL2021.TransformAssessment(ass.Id, null, data);

//        //    return doc;
//        //}

//        [HttpGet("assessmentview/{id}")]
//        public async Task<IActionResult> AssessmentView(int id)
//        {
//            //string url = "http://localhost:25807/api/artsrapport/assessment/" + id;
//            //Databank.Domain.RL2021 doc = null;
//            //using (var httpClient = new HttpClient())
//            //{
//            //    using (var response = await httpClient.GetAsync(url))
//            //    {
//            //        string json = await response.Content.ReadAsStringAsync();
//            //        doc = JsonConvert.DeserializeObject<Databank.Domain.RL2021>(json);
//            //    }
//            //}



//            ////Dictionary<string, IEnumerable<Databank.Domain.Code>>

//            //Code kodecode = await GetCodes("http://localhost:25807/api/Kode/1");
//            //Code labelcode = await GetCodes("http://localhost:25807/api/Kode/3");

//            //var labels = labelcode.Children; //  ViewBag.Codes; //codes["labels"].First().Children;

//            //var codes = kodecode.Children; //???????
//            //var CondLabel = new Func<string, Func<string, string>>(kodeid => new Func<string, string>(key => (string.IsNullOrEmpty(key) ? "" : (labels[kodeid].Where(code => code.Value == key).Select(code => code.Text).FirstOrDefault()))));
//            //var CondKode = new Func<string, Func<string, string>>(kodeid => new Func<string, string>(key => (string.IsNullOrEmpty(key) ? "" : (codes[kodeid].Where(code => code.Value == key).Select(code => code.Text).FirstOrDefault()))));

//            //var NtLabels = CondLabel("NatureTypes");

//            //var ae = NtLabels("affectedArea");






//            //bool vurdert = doc.OverordnetKlassifiseringGruppeKode == "rodlisteVurdertArt";





//            //ViewBag.Vurdert = vurdert;
//            //ViewBag.Labels = labels;
//            //ViewBag.Codes = codes;

//            //return View(doc);


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

//        //private static async Task<Code> GetCodes(string url)
//        //{
//        //    Databank.Domain.Code maincode = null;
//        //    using (var httpClient = new HttpClient())
//        //    {
//        //        using (var response = await httpClient.GetAsync(url))
//        //        {
//        //            string json = await response.Content.ReadAsStringAsync();
//        //            maincode = JsonConvert.DeserializeObject<Databank.Domain.Code>(json);
//        //        }
//        //    }

//        //    return maincode;
//        //}
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
//            //string url = endPoint + "api/Kode/" + id;
//            //return await GetCodes(url);

//            var json = _dbContext.Koder.First(x => x.Id == id).JsonData;
//            var maincode = JsonConvert.DeserializeObject<Databank.Domain.Code>(json);

//            return maincode;
//        }


//        //public async Task<IActionResult> Index()
//        //{
//        //    List<Reservation> reservationList = new List<Reservation>();
//        //    using (var httpClient = new HttpClient())
//        //    {
//        //        using (var response = await httpClient.GetAsync("http://localhost:8888/api/Reservation"))
//        //        {
//        //            string apiResponse = await response.Content.ReadAsStringAsync();
//        //            reservationList = JsonConvert.DeserializeObject<List<Reservation>>(apiResponse);
//        //        }
//        //    }
//        //    return View(reservationList);
//        //}






//        private async Task<ActionResult> vurdering_____(string context, string id, string master)
//        {
//            if (id == null)
//            {
//                //throw new Http.HttpResponseException(HttpStatusCode.BadRequest);
//                throw new Exception("Bad Request");
//            }
//            Prod.Domain.Rodliste2019 obj = null;
//            //Databank.Domain.Taxon taxon = null;
//            //////Prod.Domain.KodeGrupper kodegrupper = null;

//            int assessmentId = int.Parse(id);


//            var data = await _dbContext.Assessments.Where(x => x.Id == assessmentId).Select(x => x.Doc).FirstOrDefaultAsync();
//            if (string.IsNullOrWhiteSpace(data))
//            {
//                return null;
//            }

//            var doc = JsonConvert.DeserializeObject<Rodliste2019>(data);






//            Databank.Domain.Code rootcode = null;

//            var datastring = _dbContext.Koder.First(x => x.Id == 1).JsonData;
//            //return !string.IsNullOrWhiteSpace(data) ? Json(data) : null;
//            var jsondata = Newtonsoft.Json.Linq.JObject.Parse(datastring);
//            var codes = Json(jsondata);

//            ViewBag.ContextId = context;
//            ViewBag.Codes = codes;

//            var v = ToDatabankDomain(obj, rootcode);
//            return View( "Vurdering", v);
//        }

//    }
//}
