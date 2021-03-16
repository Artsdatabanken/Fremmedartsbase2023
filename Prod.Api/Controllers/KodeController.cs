using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Prod.Api.Services;
using Prod.Data.EFCore;

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

        [HttpGet("{id}")]
        public async System.Threading.Tasks.Task<string> GetAsync(int id)
        {
            var assembly = Assembly.GetEntryAssembly();
            var resourceStream = assembly.GetManifestResourceStream("Prod.Api.Resources.Codes.json");
            using (var reader = new StreamReader(resourceStream, Encoding.UTF8))
            {
                return await reader.ReadToEndAsync();
            }
            //var datastring = _dbContext.Codes.First(x => x.Id == id).JsonData;
            ////return !string.IsNullOrWhiteSpace(data) ? Json(data) : null;
            //var data = Newtonsoft.Json.Linq.JObject.Parse(datastring);
            //return Json(data);
        }

    }
}
