﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityModel.Client;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using Prod.Data.EFCore;
using Prod.Domain;
// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Prod.Api.Controllers
{ 
    using Microsoft.AspNetCore.Http;

    /// <summary>
    /// For handling upload and download of attachments / documentation
    /// </summary>
    [Route("api/[controller]")]
    public class DocumentController : AuthorizeApiController
    {
        private readonly ProdDbContext _dbContext;

        public DocumentController(IDiscoveryCache discoveryCache, ProdDbContext dbContext) : base(discoveryCache, dbContext)
        {
            _dbContext = dbContext;
        }

        //[Authorize]
        /// <summary>
        /// Get list of attachments for assessment
        /// </summary>
        /// <param name="assessmentId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("{assessmentId}")]
        public Task<AttachmentView[]> GetFilesForAssessmentAsync(int assessmentId)
        {
            return _dbContext.Attachments.Where(x => x.AssessmentId == assessmentId && x.IsDeleted == false).Select(
                x => new AttachmentView()
                {
                    AssessmentId = x.AssessmentId,
                    Id = x.Id,
                    Date = x.Date.ToString("yyyy-dd-MM HH:mm"),
                    User = x.User.FullName,
                    UserId = x.User.Id,
                    Name = x.Name,
                    FileName = x.FileName,
                    Description = x.Description,
                    IsDeleted = x.IsDeleted
                }).ToArrayAsync();
        }


        /// <summary>
        /// Upload new attachments for an assessment
        /// </summary>
        /// <param name="files"></param>
        /// <param name="assessmentId"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        [Authorize]
        [HttpPost]
        [Route("{assessmentId}")]
        public async Task<IActionResult> OnPostUploadAsync(List<IFormFile> files, int assessmentId, [FromForm]string name)
        {
            var user = await base.GetUser();
            long size = files.Sum(f => f.Length);

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    var attachment = new Attachment
                    {
                        AssessmentId = assessmentId,
                        Date = DateTime.Now,
                        FileName = formFile.FileName,
                        Type = formFile.ContentType,
                        Name = name,
                        UserId = user.Id
                    };

                    await using (var stream = new System.IO.MemoryStream())
                    {
                        await formFile.CopyToAsync(stream);
                        stream.Position = 0;
                        attachment.File = stream.ToArray();
                    }

                    await _dbContext.Attachments.AddAsync(attachment);
                    await _dbContext.SaveChangesAsync();
                }
            }

            return Ok(new { count = files.Count, size });
        }

        /// <summary>
        /// Get single file/attachement
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpGet("getfile/{id}")]
        //[Authorize]
        public async Task<FileResult> Get(int id)
        {
            //var user = await base.GetUser();
            var attachment =await _dbContext.Attachments.Where(x=>x.Id == id).FirstOrDefaultAsync();
            if (attachment == null)
            {
                throw new Exception("Attachment not found");
            }

            return new FileContentResult(attachment.File, MediaTypeHeaderValue.Parse(attachment.Type))
                       {
                           FileDownloadName = attachment.FileName
                       };
        }

        /// <summary>
        /// Drop/delete an attachment
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("delete/{id}")]
        [Authorize]
        public async Task<bool> Delete(int id)
        {
            var value = await _dbContext.Attachments.Include(x => x.Assessment).FirstOrDefaultAsync(x => x.Id == id);
                
            if (value == null ||  string.IsNullOrWhiteSpace(value.Assessment.Expertgroup))
            {
                return false;
            }

            var user = await base.GetRoleInGroup(value.Assessment.Expertgroup);
            if (!user.WriteAccess && !user.Admin && !user.User.IsAdmin) return false;
            
            value.IsDeleted = true;
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
