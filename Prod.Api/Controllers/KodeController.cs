using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Newtonsoft.Json;
using Prod.Api.Services;
using Prod.Data.EFCore;
using Prod.Domain;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace Prod.Api.Controllers
{
    [Route("api/[controller]")]
    //[DisableCors]
    public class KodeController : Controller
    {
        private readonly ProdDbContext _dbContext;

        public KodeController(ProdDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        //[HttpGet("{id}")]
        //public async System.Threading.Tasks.Task<string> GetAsync(int id)
        //{
        //    var assembly = Assembly.GetEntryAssembly();
        //    var resourceStream = assembly.GetManifestResourceStream("Prod.Api.Resources.Codes.json");
        //    using (var reader = new StreamReader(resourceStream, Encoding.UTF8))
        //    {
        //        return await reader.ReadToEndAsync();
        //    }
        //    //var datastring = _dbContext.Codes.First(x => x.Id == id).JsonData;
        //    ////return !string.IsNullOrWhiteSpace(data) ? Json(data) : null;
        //    //var data = Newtonsoft.Json.Linq.JObject.Parse(datastring);
        //    //return Json(data);
        //}
        [HttpGet("kode")]
        public async Task<Prod.Domain.Code> GetKode()
        {
            return JsonSerializer.Deserialize<Prod.Domain.Code>(await ReadResource("Codes"));
            //await ReadResource("Codes");
        }

        [HttpGet("RedlistedNaturetype")]
        public async Task<RedlistedNaturetypeGroups> RedlistedNaturetype()
        {
            return JsonSerializer.Deserialize<Prod.Domain.RedlistedNaturetypeGroups>(await ReadResource("RedlistedNaturetypeGroups"));
        }
        [HttpGet("NiN10Livsmedium")]
        public async Task<Livsmedium> NiN10Livsmedium()
        {
            return JsonSerializer.Deserialize<Prod.Domain.Livsmedium>(await ReadResource("Livsmedium"));
        }

        private static async Task<string> ReadResource(string codes)
        {
            var assembly = Assembly.GetEntryAssembly();
            var resourceStream = assembly.GetManifestResourceStream("Prod.Api.Resources." + codes + ".json");
            using var reader = new StreamReader(resourceStream, Encoding.UTF8);
            return await reader.ReadToEndAsync();
        }
    }
}
