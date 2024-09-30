namespace Prod.Api.Controllers
{
    using System;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Threading.Tasks;
    using IdentityModel.Client;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Prod.Data.EFCore;

    /// <summary>
    /// Metode for å hente geojson kartfiler over vannområder og vannregioner som brukes i frontend til regionale vurderinger av fisk
    /// Fælgende alternative kartfiler kan hentes "WaterArea" og "WaterRegion"
    /// </summary>
    [Route("api/[controller]")]
    //[Authorize]
    public class StaticController : AuthorizeApiController
    {
        private string[] LegalNames = { "WaterArea", "WaterRegion" };

        public StaticController(IDiscoveryCache discoveryCache, ProdDbContext dbContext) : base(discoveryCache, dbContext)
        {
        }

        // GET api/static/WaterArea
        /// <summary>
        /// Get GeoJson format map file for either "WaterArea" or "WaterRegion"
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [HttpGet("{name}")]
        [ResponseCache(Location = ResponseCacheLocation.Any, Duration = 3600)]
        public async Task<string> Get(string name)
        {
            if (string.IsNullOrEmpty(name)) return "name is empty";
            if (!LegalNames.Any(legalName => legalName.Equals(name, StringComparison.OrdinalIgnoreCase)))
                return $"{name} is illegal";

            var assembly = Assembly.GetExecutingAssembly();
            
            var resourceName = $"Prod.Api.Resources.{name}.geojson";

            await using var stream = assembly.GetManifestResourceStream(resourceName);
            
            if (stream == null) return "stream is null";

            using var reader = new StreamReader(stream);

            return await reader.ReadToEndAsync();
        }
    }
}
