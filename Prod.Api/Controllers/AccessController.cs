// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting
namespace Prod.Api.Controllers
{
    using System;
    using System.Linq;
    using System.Net.Http;
    using System.Threading.Tasks;

    using IdentityModel.Client;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    using Prod.Data.EFCore;
    using Prod.Domain;

    [Route("api/[controller]")]
    [Authorize]
    public class AccessController : AuthorizeApiController
    {
        private readonly ProdDbContext _dbContext;

        public AccessController(IDiscoveryCache discoveryCache, ProdDbContext dbContext) : base(discoveryCache, dbContext)
        {
            _dbContext = dbContext;
        }

        public class SelectList
        {
            public string Id { get; set; }
            public string Value { get; set; }
        }

        [HttpGet("Access")]
        public async Task<User> Get()
        {
            var user = await base.GetUser();
            await StoreUserInfo(user);
            return user;
        }

        [HttpGet("users")]
        public async Task<SelectList[]> GetApprovedUsers()
        {
            var user = await base.GetUser();
            if (user == null || !user.ErAdministrator) throw new HttpRequestException("Not admin");

            var apps = await _dbContext.Users.Where(x => x.HarTilgang || x.ErAdministrator)
                .Select(x => new SelectList {Id = x.Id.ToString(), Value = x.Navn + " <" + x.Email + ">"}).ToArrayAsync();
            return apps.OrderBy(x=>x.Value).ToArray();

        }
        [HttpPost(("applications/apply"))]
        public async Task<User> Post([FromBody]string value)
        {
            var user = await base.GetUser();
            user.HarSoktOmTilgang = true;
            user.Soknad = value;
            await StoreUserInfo(user);
            return user;
        }

        [HttpGet("applications")]
        public async Task<User[]> GetApplications()
        {
            var user = await base.GetUser();
            if (user == null || !user.ErAdministrator) throw new HttpRequestException("Not admin");
            var apps = await _dbContext.Users.Where(x => x.HarSoktOmTilgang && x.HarTilgang == false).ToArrayAsync();
            return apps;

        }

        [HttpGet("applications/approve/{id}")]
        public async Task<bool> ApproveApplication(string id)
        {
            var user = await base.GetUser();
            if (user == null || !user.ErAdministrator) throw new HttpRequestException("Not admin");
            var dbUser = await _dbContext.Users.Where(x => x.Id == Guid.Parse(id) && x.HarSoktOmTilgang && x.HarTilgang == false)
                .SingleOrDefaultAsync();
            if (dbUser == null) return false;
            
            dbUser.HarTilgang = true;
            dbUser.DatoForTilgang = DateTime.Now;
            await _dbContext.SaveChangesAsync();

            return true;
        }

        [HttpGet("applications/reject/{id}")]
        public async Task<bool> NotApproveApplication(string id)
        {
            var user = await base.GetUser();
            if (user == null || !user.ErAdministrator) throw new HttpRequestException("Not admin");
            var dbUser = await _dbContext.Users.Where(x => x.Id == Guid.Parse(id) && x.HarSoktOmTilgang && x.HarTilgang == false)
                .SingleOrDefaultAsync();
            if (dbUser == null) return false;

            dbUser.TilgangAvvist = true;
            dbUser.DatoForTilgang = DateTime.Now;
            await _dbContext.SaveChangesAsync();

            return true;
        }

        private async Task<User> StoreUserInfo(User user)
        {
            var dbUser = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == user.Id);
            if (dbUser == null)
            {
                dbUser = user;
                _dbContext.Users.Add(dbUser);
            }
            else
            {
                if (dbUser.Brukernavn == null || !dbUser.Brukernavn.Equals(user.Brukernavn))
                    dbUser.Brukernavn = user.Brukernavn;
                if (!dbUser.HarSoktOmTilgang.Equals(user.HarSoktOmTilgang))
                    dbUser.HarSoktOmTilgang = user.HarSoktOmTilgang;
                if (!dbUser.HarTilgang.Equals(user.HarTilgang)) dbUser.HarTilgang = user.HarTilgang;
                if (!dbUser.ErAdministrator.Equals(user.ErAdministrator)) dbUser.ErAdministrator = user.ErAdministrator;
                if (dbUser.Email == null || !dbUser.Email.Equals(user.Email)) dbUser.Email = user.Email;
                if (dbUser.Navn == null || !dbUser.Navn.Equals(user.Navn)) dbUser.Navn = user.Navn;
                if (dbUser.Soknad == null || !dbUser.Soknad.Equals(user.Soknad)) dbUser.Soknad = user.Soknad;
            }

            await _dbContext.SaveChangesAsync();


            return dbUser;
        }
    }
}
