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

    /// <summary>
    /// Api methods for handling user management
    /// </summary>
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

        /// <summary>
        /// Return Information about authenticated user 
        /// </summary>
        [HttpGet("Access")]
        public async Task<User> Get()
        {
            var user = await base.GetUser();
            await StoreUserInfo(user);
            return user;
        }

        /// <summary>
        /// Get full list of approved users
        /// </summary>
        [HttpGet("users")]
        public async Task<SelectList[]> GetApprovedUsers()
        {
            var user = await base.GetUser();
            if (user == null || !user.IsAdmin) throw new HttpRequestException("Not admin");

            var apps = await _dbContext.Users.Where(x => x.HasAccess || x.IsAdmin)
                .Select(x => new SelectList {Id = x.Id.ToString(), Value = x.FullName + " <" + x.Email + ">"}).ToArrayAsync();
            return apps.OrderBy(x=>x.Value).ToArray();

        }

        /// <summary>
        /// Post application for access database for authenticated user 
        /// </summary>
        [HttpPost(("applications/apply"))]
        public async Task<User> Post([FromBody]string value)
        {
            var user = await base.GetUser();
            user.HasAppliedForAccess = true;
            user.Application = value;
            await StoreUserInfo(user);
            return user;
        }

        /// <summary>
        /// Get list of applications for access
        /// </summary>
        [HttpGet("applications")]
        public async Task<User[]> GetApplications()
        {
            var user = await base.GetUser();
            if (user == null || !user.IsAdmin) throw new HttpRequestException("Not admin");
            var apps = await _dbContext.Users.Where(x => x.HasAppliedForAccess && x.HasAccess == false).ToArrayAsync();
            return apps;

        }

        /// <summary>
        /// Approve user for access
        /// </summary>
        /// <param name="id">Guid user id</param>
        [HttpGet("applications/approve/{id}")]
        public async Task<bool> ApproveApplication(string id)
        {
            var user = await base.GetUser();
            if (user == null || !user.IsAdmin) throw new HttpRequestException("Not admin");
            var dbUser = await _dbContext.Users.Where(x => x.Id == Guid.Parse(id) && x.HasAppliedForAccess && x.HasAccess == false)
                .SingleOrDefaultAsync();
            if (dbUser == null) return false;
            
            dbUser.HasAccess = true;
            dbUser.DateGivenAccess = DateTime.Now;
            await _dbContext.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Reject user application for access
        /// </summary>
        /// <param name="id">Guid user id</param>
        [HttpGet("applications/reject/{id}")]
        public async Task<bool> NotApproveApplication(string id)
        {
            var user = await base.GetUser();
            if (user == null || !user.IsAdmin) throw new HttpRequestException("Not admin");
            var dbUser = await _dbContext.Users.Where(x => x.Id == Guid.Parse(id) && x.HasAppliedForAccess && x.HasAccess == false)
                .SingleOrDefaultAsync();
            if (dbUser == null) return false;

            dbUser.AccessDenied = true;
            dbUser.DateGivenAccess = DateTime.Now;
            await _dbContext.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Add or update local user information
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
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
                if (dbUser.UserName == null || !dbUser.UserName.Equals(user.UserName))
                    dbUser.UserName = user.UserName;
                if (!dbUser.HasAppliedForAccess.Equals(user.HasAppliedForAccess))
                    dbUser.HasAppliedForAccess = user.HasAppliedForAccess;
                if (!dbUser.HasAccess.Equals(user.HasAccess)) dbUser.HasAccess = user.HasAccess;
                if (!dbUser.IsAdmin.Equals(user.IsAdmin)) dbUser.IsAdmin = user.IsAdmin;
                if (dbUser.Email == null || !dbUser.Email.Equals(user.Email)) dbUser.Email = user.Email;
                if (dbUser.FullName == null || !dbUser.FullName.Equals(user.FullName)) dbUser.FullName = user.FullName;
                if (dbUser.Application == null || !dbUser.Application.Equals(user.Application)) dbUser.Application = user.Application;
            }

            await _dbContext.SaveChangesAsync();


            return dbUser;
        }
    }
}
