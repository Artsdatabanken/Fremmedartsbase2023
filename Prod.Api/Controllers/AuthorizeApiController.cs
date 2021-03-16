using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Prod.Data.EFCore;
using Prod.Domain;
// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

namespace Prod.Api.Controllers
{
    [ApiController]
    //[Authorize]
    public class AuthorizeApiController : ControllerBase
    {
        private readonly IDiscoveryCache _discoveryCache;

        private readonly ProdDbContext _dbContext;

        public AuthorizeApiController(IDiscoveryCache discoveryCache, ProdDbContext dbContext)
        {
            _discoveryCache = discoveryCache;
            _dbContext = dbContext;
        }

        protected async 
        Task<Bruker> GetUser()
        {
            var disco = await _discoveryCache.GetAsync();
            if (disco.IsError) throw new Exception(disco.Error);

            var token = await this.HttpContext.GetTokenAsync("access_token");
            
            using var client = new HttpClient(); 
            var infuser = await client.GetUserInfoAsync(new UserInfoRequest()
            {
                Address = disco.UserInfoEndpoint,
                Token = token
            });
            if (infuser.IsError) throw new Exception("Feil ved uthenting av userinfo");

            var infuserId = infuser.Claims.FirstOrDefault(x=>x.Type=="sub")?.Value;
            var isAdmin = infuser.Claims.Any(x => x.Type == "role" && x.Value == "redlist_administrator");
            var userName = infuser.Claims.FirstOrDefault(x => x.Type == "preferred_username")?.Value;
            var name = infuser.Claims.FirstOrDefault(x => x.Type == "name")?.Value;
            var email = infuser.Claims.FirstOrDefault(x => x.Type == "email")?.Value;

            var user = _dbContext.Users.Include(x=>x.EkspertgruppeRoller).FirstOrDefault(x => x.Id == infuserId) ?? new Bruker
            {
                Id = infuserId, ErAdministrator = isAdmin, HarSoktOmTilgang = false, HarTilgang = false,
                Brukernavn = userName, Navn = name, Email = email, DatoOpprettet = DateTime.Now
            };

            // oppdater fra id
            if (!user.ErAdministrator.Equals(isAdmin)) user.ErAdministrator = isAdmin;
            if (email != null && (user.Email == null || !email.Equals(user.Email))) user.Email = email;
            if (name != null && (user.Navn == null || !name.Equals(user.Navn))) user.Navn = name;
            return user;
        }

        protected async Task<Bruker.EkspertgruppeRolle> GetRoleInGroup(string id)
        {
            var user = await GetUser();
            var roleInGroup = user.EkspertgruppeRoller.Select(x=>new Bruker.EkspertgruppeRolle()
                              {
                                  EkspertgruppeId = x.EkspertgruppeId, 
                                  Leder = x.Leder, 
                                  Leser = x.Leser, 
                                  Skriver = x.Skriver,
                                  Bruker = new Bruker() { Brukernavn = user.Brukernavn, Id = user.Id, ErAdministrator = user.ErAdministrator}
            }).FirstOrDefault(x => x.EkspertgruppeId == id);
            if (roleInGroup == null)
            {
                roleInGroup = new Bruker.EkspertgruppeRolle()
                                  { EkspertgruppeId = id, Leder = false, Leser = false, Skriver = false, Bruker = new Bruker(){Brukernavn = user.Brukernavn, Id = user.Id, ErAdministrator = user.ErAdministrator } };
            }

            // gi admin anledning til å låse opp vurderinger o.l.
            if (user.ErAdministrator)
            {
                roleInGroup.Leder = true;
            } 
            return roleInGroup;
        }
    }
}