using System.Linq;
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
        public JsonResult Get(int id)
        {

            var datastring = _dbContext.Koder.First(x => x.Id == id).JsonData;
            //return !string.IsNullOrWhiteSpace(data) ? Json(data) : null;
            var data = Newtonsoft.Json.Linq.JObject.Parse(datastring);
            return Json(data);
        }

    }
}
