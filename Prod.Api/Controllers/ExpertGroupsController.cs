﻿using System;
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

        public class Access
        {
            public Guid Id { get; set; }
            public string FullName { get; set; }
            public bool Admin { get; set; }
            public bool WriteAccess { get; set; }
            //public bool Leser { get; set; }
        }

        [Authorize]
        [HttpGet("members/{id}")]
        public async Task<Access[]> GetMembers(string id)
        {
            var user = await base.GetUser();
            if (user == null || !user.IsAdmin) throw new HttpRequestException("Not admin");
            var members = await _dbContext.Users.Where(x => x.UserRoleInExpertGroups.Any(y => y.ExpertGroupName == id))
                .Select(x => new Access
                {
                    Id = x.Id, FullName = x.FullName + " <" + x.Email + ">", Admin = x.UserRoleInExpertGroups.First(y => y.ExpertGroupName == id).Admin,
                    WriteAccess = x.UserRoleInExpertGroups.First(y => y.ExpertGroupName == id).WriteAccess//,
                    //Leser = x.UserRoleInExpertGroups.First(y => y.ExpertGroupName == id).Leser
                }).ToArrayAsync();
            return members.OrderBy(x=>x.FullName).ToArray();
            //var data = _dataService.GetExpertGroups();
            //return data != null && data.Length > 0 ? data : null;
        }

        public class AddAccess
        {
            public string ExpertGroupName { get; set; }
            public Guid Id { get; set; }
            public bool Admin { get; set; }
            public bool WriteAccess { get; set; }
        }

        [Authorize]
        [HttpPost("members")]
        public async Task<bool> AddMembers([FromBody] AddAccess value)
        {
            var user = await base.GetUser();
            if (user == null || !user.IsAdmin) throw new HttpRequestException("Not admin");
            var bruker = await _dbContext.Users.Include(y => y.UserRoleInExpertGroups).Where(x => x.Id == value.Id)
                .FirstOrDefaultAsync();
            if (bruker == null)
            {
                return false;
            }

            var eid = value.ExpertGroupName.Trim();
            var medlem = bruker.UserRoleInExpertGroups.FirstOrDefault(y => y.ExpertGroupName == eid);
            if (medlem == null)
            {
                medlem = new User.UserRoleInExpertGroup {ExpertGroupName = eid};
                bruker.UserRoleInExpertGroups.Add(medlem);

            }

            medlem.DateCreated = DateTime.Now;
            medlem.RoleGivenByUserId = user.Id;
            medlem.Admin = value.Admin;
            //medlem.Leser = value.Leser;
            medlem.WriteAccess = value.Admin ? value.Admin : value.WriteAccess;
            await _dbContext.SaveChangesAsync();

            return true;
        }

        [Authorize]
        [HttpDelete("members/{bid}/{eid}")]
        public async Task<bool> RemoveMembers(Guid bid, string eid)
        {
            var user = await base.GetUser();
            if (user == null || !user.IsAdmin) throw new HttpRequestException("Not admin");
            var bruker = await _dbContext.Users.Include(y => y.UserRoleInExpertGroups).Where(x => x.Id == bid)
                .FirstOrDefaultAsync();
            if (bruker == null)
            {
                return false;
            }

            eid = eid.Trim();
            var medlem = bruker.UserRoleInExpertGroups.FirstOrDefault(y => y.ExpertGroupName == eid);
            if (medlem == null)
            {
                return false;
            }

            bruker.UserRoleInExpertGroups.Remove(medlem);
            
            await _dbContext.SaveChangesAsync();

            return true;
        }
    }
}
