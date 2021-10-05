using Prod.Data.EFCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using Prod.Api.Helpers;

// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

namespace Prod.Api.Controllers
{
    using IdentityModel.Client;

    using Microsoft.AspNetCore.Mvc;

    using Prod.Domain;
    [Route("api/[controller]")]
    
    public class AssessmentCommentsController: AuthorizeApiController
    {
        private readonly ProdDbContext _dbContext;
        public class AssessmentCommentView
        {
            public int Id { get; set; }
            public int AssessmentId { get; set; }
            public string Comment { get; set; }
            public DateTime CommentDate { get; set; }
            public string User { get; set; }
            public bool Closed { get; set; }
            public Guid? ClosedBy { get; set; }
            public DateTime? ClosedDate { get; set; }
            public bool IsDeleted { get; set; }
            public Guid UserId { get; internal set; }
        }

        public AssessmentCommentsController(IDiscoveryCache discoveryCache, ProdDbContext dbContext): base(discoveryCache, dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("{id}")]
        public Task<AssessmentCommentView[]> Get(int id)
        {
            return _dbContext.Comments.Where(x => x.AssessmentId == id)
                .Select(x => new AssessmentCommentView()
                {
                    AssessmentId = x.AssessmentId,
                    Closed = x.Closed,
                    Id = x.Id,
                    ClosedBy = x.ClosedById,
                    CommentDate = x.CommentDate,
                    User = x.User.FullName,
                    UserId = x.User.Id,                   
                    ClosedDate = x.ClosedDate,
                    Comment = x.Comment,
                    IsDeleted = x.IsDeleted
                }).ToArrayAsync();
        }

        [HttpPost("{id}")]
        [Authorize]
        public async Task<bool> Post([FromBody] AssessmentCommentView value, int id)
        {
            var user = await base.GetUser();
            var commentDate = DateTime.Now;
            var assessment = await _dbContext.Assessments.Where(x => x.Id == id).Include(x => x.Comments)
                .FirstOrDefaultAsync();
            assessment.Comments.Add(new AssessmentComment()
            {
                AssessmentId = id,
                IsDeleted = false,
                Closed = false,
                Comment = value.Comment,
                Type = CommentType.Ordinary,
                //CommentDate = DateTime.Now,
                // to avoid time zone issues
                CommentDate = commentDate,
                UserId = user.Id
                
            });
            assessment.ChangedAt = commentDate;
            await _dbContext.SaveChangesAsync();
            IndexHelper.SetCommentTimeStamp(_dbContext, commentDate);
            return true;
        }

        [HttpGet("delete/{id}")]
        [Authorize]
        public async Task<bool> Delete(int id)
        {
            var user = await base.GetUser();
            var comment = await _dbContext.Comments.Where(x => x.Id == id).Include(y=>y.Assessment).FirstOrDefaultAsync();
            if (comment == null)
            {
                return false;
            }

            if (comment.UserId == user.Id || user.IsAdmin)
            {
                var commentDate = DateTime.Now;
                comment.CommentDate = commentDate;
                comment.IsDeleted = true;
                comment.Assessment.ChangedAt = commentDate;
                await _dbContext.SaveChangesAsync();
                IndexHelper.SetCommentTimeStamp(_dbContext, commentDate);
                return true;
            }

            return false;
        }
        [HttpGet("close/{id}")]
        [Authorize]
        public async Task<bool> Close(int id)
        {
            var user = await base.GetUser();
            var comment = await _dbContext.Comments.Include(x=>x.Assessment).Where(x => x.Id == id).FirstOrDefaultAsync();
            if (comment == null)
            {
                return false;
            }

            var roleInGroup = await base.GetRoleInGroup(comment.Assessment.Expertgroup);
            if (roleInGroup.WriteAccess || user.IsAdmin)
            {
                comment.Closed = true;
                var commentClosedDate = DateTime.Now;
                comment.ClosedDate = commentClosedDate;
                comment.CommentDate = commentClosedDate;
                comment.ClosedById = roleInGroup.UserId;
                comment.Assessment.ChangedAt = commentClosedDate;
                await _dbContext.SaveChangesAsync();
                IndexHelper.SetCommentTimeStamp(_dbContext, commentClosedDate);
                return true;
            }

            return false;
        }
    }
}
