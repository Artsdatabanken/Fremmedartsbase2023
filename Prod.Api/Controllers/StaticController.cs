using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Prod.Api.Controllers
{
    using System;
    using System.Linq;
    using System.Reflection;
    using System.Threading.Tasks;
    using IdentityModel.Client;
    using Prod.Data.EFCore;

    [Route("api/[controller]")]
    [Authorize]
    public class StaticController : AuthorizeApiController
    {
        private string[] LegalNames = { "WaterArea", "WaterRegion" };

        public StaticController(IDiscoveryCache discoveryCache, ProdDbContext dbContext) : base(discoveryCache, dbContext)
        {
        }

        // GET api/static/WaterArea
        [HttpGet("{name}")]
        public async Task<FileStreamResult> Get(string name)
        {
            if (string.IsNullOrEmpty(name)) throw new ArgumentNullException($"name is empty");
            if (!LegalNames.Any(legalName => legalName.Equals(name, StringComparison.OrdinalIgnoreCase)))
                throw new ArgumentOutOfRangeException($"{name} is illegal");

            var basePath = Assembly.GetExecutingAssembly().Location;
            basePath = basePath.Substring(0, basePath.LastIndexOf("\\", StringComparison.Ordinal));
            var filePath = System.IO.Path.Combine(basePath, "Resources", $"{name}.geojson");

            if (!System.IO.File.Exists(filePath)) throw new Exception($"{name} not found");

            return Task.FromResult(new FileStreamResult(System.IO.File.OpenRead(filePath), "application/geo+json")).Result;
        }
    }
}
