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
        Task<User> GetUser()
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
            var isAdmin = infuser.Claims.Any(x => x.Type == "role" && x.Value == "fab_administrator");
            var userName = infuser.Claims.FirstOrDefault(x => x.Type == "preferred_username")?.Value;
            var name = infuser.Claims.FirstOrDefault(x => x.Type == "name")?.Value;
            var email = infuser.Claims.FirstOrDefault(x => x.Type == "email")?.Value;

            var user = _dbContext.Users.Include(x=>x.UserRoleInExpertGroups).FirstOrDefault(x => x.Id == Guid.Parse(infuserId)) ?? new User
            {
                Id = Guid.Parse(infuserId), IsAdmin = isAdmin, HasAppliedForAccess = false, HasAccess = false,
                UserName = userName, FullName = name, Email = email, DateCreated = DateTime.Now
            };

            // oppdater fra id
            if (!user.IsAdmin.Equals(isAdmin)) user.IsAdmin = isAdmin;
            if (email != null && (user.Email == null || !email.Equals(user.Email))) user.Email = email;
            if (name != null && (user.FullName == null || !name.Equals(user.FullName))) user.FullName = name;
            return user;
        }

        protected async Task<User.UserRoleInExpertGroup> GetRoleInGroup(string id)
        {
            var user = await GetUser();
            var roleInGroup = user.UserRoleInExpertGroups.Select(x=>new User.UserRoleInExpertGroup()
                              {
                                  ExpertGroupName = x.ExpertGroupName, 
                                  Admin = x.Admin, 
                                  //Leser = x.Leser, 
                                  WriteAccess = x.WriteAccess,
                                  User = new User() { UserName = user.UserName, Id = user.Id, IsAdmin = user.IsAdmin}
            }).FirstOrDefault(x => x.ExpertGroupName == id);
            if (roleInGroup == null)
            {
                roleInGroup = new User.UserRoleInExpertGroup()
                                  { ExpertGroupName = id, Admin = false, WriteAccess = false, User = new User(){UserName = user.UserName, Id = user.Id, IsAdmin = user.IsAdmin }, UserId = user.Id };
            }

            // gi admin anledning til å låse opp vurderinger o.l.
            if (user.IsAdmin)
            {
                roleInGroup.Admin = true;
            } 
            return roleInGroup;
        }
    }
}