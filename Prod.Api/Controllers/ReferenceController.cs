using System;
using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Prod.Api.Services;
using Prod.Data.EFCore;
using Prod.Infrastructure.Services;

// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

namespace Prod.Api.Controllers
{
    /// <summary>
    /// Proxy methods for ReferenceAPI - for administrering references. Proxy for: https://referenceapi.artsdatabanken.no/index.html
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReferenceController : AuthorizeApiController
    {
        private readonly IReferenceService _referenceService;
        public ReferenceController(IReferenceService referenceService, IDiscoveryCache discoveryCache, ProdDbContext dbContext) : base(discoveryCache, dbContext)
        {
            this._referenceService = referenceService;
        }

        /// <summary>
        /// Add a new reference
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<Reference>> Post([FromBody] Reference value)
        {
            if (value == null)
            {
                return BadRequest("No data posted");
            }
            var user = await base.GetUser();
            if (value.Id == Guid.Empty)
            {
                value.Id = Guid.NewGuid();
            }

            value.UserId = user.Id;
            value.ApplicationId = ReferenceService.AppId;
            var result = await _referenceService.Store(value);

            return result;
        }

        /// <summary>
        /// Update existing reference - if allowed
        /// </summary>
        /// <param name="id"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<Reference>> Put(Guid id, [FromBody] Reference value)
        {
            if (value == null)
            {
                return BadRequest("No data posted");
            }
            var user = await base.GetUser();
            var reference = await _referenceService.Get(id);
            if (reference == null)
            {
                return NotFound($"Reference with id:{id}");
            }
            if (value.Id == Guid.Empty)
            {
                value.Id = Guid.NewGuid();
            }

            value.UserId = user.Id;
            value.ApplicationId = ReferenceService.AppId;
            var result = await _referenceService.Update(value);

            return result;
        }

        /// <summary>
        /// Delete a reference if allowed
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="HttpRequestException"></exception>
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> Delete(Guid id)
        {
            var user = await base.GetUser();
            var reference = await _referenceService.Get(id);
            if (reference == null)
            {
                return NotFound("Reference with id:" + id);
            }

            if (reference.UserId != user.Id)
            {
                throw new HttpRequestException("Forsøk på å slette referanse oprettet av en annen bruker");
            }

            var result = await _referenceService.Delete(id);

            return result;
        }
    }
}