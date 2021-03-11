using System;
using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Prod.Api.Services;
using Prod.Data.EFCore;
// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

namespace Prod.Api.Controllers
{
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

            value.UserId = new Guid(user.Id);
            value.ApplicationId = ReferenceService.AppId;
            var result = await _referenceService.Store(value);

            return result;
        }

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

            value.UserId = new Guid(user.Id);
            value.ApplicationId = ReferenceService.AppId;
            var result = await _referenceService.Update(value);

            return result;
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> Delete(Guid id)
        {
            var user = await base.GetUser();
            var reference = await _referenceService.Get(id);
            if (reference == null)
            {
                return NotFound("Reference with id:" + id);
            }

            if (reference.UserId.ToString() != user.Id)
            {
                throw new HttpRequestException("Forsøk på å slette referanse oprettet av en annen bruker");
            }

            var result = await _referenceService.Delete(id);

            return result;
        }
    }
}