using System;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Prod.Data.EFCore;
using Prod.Domain;
// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

namespace Prod.Api.Controllers
{
    [Route("api/[controller]")]
    public class ExpertGroupsController : AuthorizeApiController
    {
        private readonly ProdDbContext _dbContext;

        public ExpertGroupsController(IDiscoveryCache discoveryCache, ProdDbContext dbContext) : base(discoveryCache, dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet()]
        public async Task<string[]> Get()
        {
            var data = await _dbContext.Assessments
                           .FromSqlRaw("SELECT Distinct Expertgroup FROM dbo.Assessments WITH (INDEX(IX_Assessments_Expertgroup))") // index hint - speeds up computed columns
                           .Select(x => x.Expertgroup).OrderBy(x => x).ToArrayAsync();  //_dataService.GetExpertGroups();
            return data != null && data.Length > 0 ? data : null;
        }

        public class Tilgang
        {
            public Guid Id { get; set; }
            public string Navn { get; set; }
            public bool Leder { get; set; }
            public bool Skriver { get; set; }
            public bool Leser { get; set; }
        }

        [Authorize]
        [HttpGet("members/{id}")]
        public async Task<Tilgang[]> GetMembers(string id)
        {
            var user = await base.GetUser();
            if (user == null || !user.ErAdministrator) throw new HttpRequestException("Not admin");
            var members = await _dbContext.Users.Where(x => x.EkspertgruppeRoller.Any(y => y.EkspertgruppeId == id))
                .Select(x => new Tilgang
                {
                    Id = x.Id, Navn = x.Navn + " <" + x.Email + ">", Leder = x.EkspertgruppeRoller.First(y => y.EkspertgruppeId == id).Leder,
                    Skriver = x.EkspertgruppeRoller.First(y => y.EkspertgruppeId == id).Skriver,
                    Leser = x.EkspertgruppeRoller.First(y => y.EkspertgruppeId == id).Leser
                }).ToArrayAsync();
            return members.OrderBy(x=>x.Navn).ToArray();
            //var data = _dataService.GetExpertGroups();
            //return data != null && data.Length > 0 ? data : null;
        }

        public class LeggTilgang
        {
            public string EkspertgruppeId { get; set; }
            public Guid Id { get; set; }
            public bool Leder { get; set; }
            public bool Skriver { get; set; }
            public bool Leser { get; set; }
        }

        [Authorize]
        [HttpPost("members")]
        public async Task<bool> AddMembers([FromBody] LeggTilgang value)
        {
            var user = await base.GetUser();
            if (user == null || !user.ErAdministrator) throw new HttpRequestException("Not admin");
            var bruker = await _dbContext.Users.Include(y => y.EkspertgruppeRoller).Where(x => x.Id == value.Id)
                .FirstOrDefaultAsync();
            if (bruker == null)
            {
                return false;
            }

            var eid = value.EkspertgruppeId.Trim();
            var medlem = bruker.EkspertgruppeRoller.FirstOrDefault(y => y.EkspertgruppeId == eid);
            if (medlem == null)
            {
                medlem = new User.EkspertgruppeRolle {EkspertgruppeId = eid};
                bruker.EkspertgruppeRoller.Add(medlem);

            }

            medlem.DatoOpprettet = DateTime.Now;
            medlem.OpprettetAvBrukerId = user.Id;
            medlem.Leder = value.Leder;
            medlem.Leser = value.Leser;
            medlem.Skriver = value.Leder ? value.Leder : value.Skriver;
            await _dbContext.SaveChangesAsync();

            return true;
        }

        [Authorize]
        [HttpDelete("members/{bid}/{eid}")]
        public async Task<bool> RemoveMembers(Guid bid, string eid)
        {
            var user = await base.GetUser();
            if (user == null || !user.ErAdministrator) throw new HttpRequestException("Not admin");
            var bruker = await _dbContext.Users.Include(y => y.EkspertgruppeRoller).Where(x => x.Id == bid)
                .FirstOrDefaultAsync();
            if (bruker == null)
            {
                return false;
            }

            eid = eid.Trim();
            var medlem = bruker.EkspertgruppeRoller.FirstOrDefault(y => y.EkspertgruppeId == eid);
            if (medlem == null)
            {
                return false;
            }

            bruker.EkspertgruppeRoller.Remove(medlem);
            
            await _dbContext.SaveChangesAsync();

            return true;
        }
    }
}
