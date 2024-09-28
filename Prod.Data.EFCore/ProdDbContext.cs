using System;
using Microsoft.EntityFrameworkCore;
using Prod.Domain;

namespace Prod.Data.EFCore
{
    public partial class ProdDbContext : DbContext
    {
        public ProdDbContext()
        {
        }

        public ProdDbContext(DbContextOptions<ProdDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Assessment> Assessments { get; set; }
        public virtual DbSet<AssessmentHistory> AssessmentHistories { get; set; }

        public virtual DbSet<AssessmentComment> Comments { get; set; }
        public virtual DbSet<Attachment> Attachments { get; set; }
        public virtual DbSet<TimeStamp> TimeStamp { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            const int brukerIdSize = 100;
            const int ekspertgruppeIdSize = 200;

            modelBuilder.Entity<TimeStamp>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).ValueGeneratedNever();
                e.Property(x => x.DateTimeUpdated).IsRequired();
            });

            // User
            modelBuilder
                .Entity<User>(e =>
                {
                    e.HasKey(x => x.Id);
                    e.HasMany(x => x.UserRoleInExpertGroups).WithOne(x => x.User).OnDelete(DeleteBehavior.Cascade);

                    e.Property(x => x.Id);//.HasMaxLength(brukerIdSize);
                    e.Property(x => x.UserName).HasMaxLength(brukerIdSize).IsRequired();
                    e.Property(x => x.FullName).HasMaxLength(ekspertgruppeIdSize).IsRequired();
                    e.Property(x => x.Email).HasMaxLength(ekspertgruppeIdSize).IsRequired();
                    e.Property(x => x.Application).HasMaxLength(2000);
                    e.Property(x => x.DateCreated).HasDefaultValue(new DateTime(2020, 1, 1));
                    e.Property(x => x.DateLastActive).HasDefaultValue(new DateTime(2020, 1, 1));
                })
                ;

            // System user account
            modelBuilder.Entity<User>().HasData(new User
            {
                UserName = "system",
                DateGivenAccess = DateTime.Today,
                DateCreated = DateTime.Today,
                DateLastActive = DateTime.Today,
                Email = "noreply@nodomian.no",
                IsAdmin = false,
                HasAppliedForAccess = false,
                HasAccess = false,
                FullName = "System konto",
                AccessDenied = true,
                Id = new Guid("00000000-0000-0000-0000-000000000001")
            }); 


            // UserRoleInExpertGroup
            modelBuilder.Entity<User.UserRoleInExpertGroup>(e =>
            {
                e.HasKey(x => new
                {
                    x.UserId, GroupName = x.ExpertGroupName
                });
                e.Property(x => x.ExpertGroupName).HasMaxLength(ekspertgruppeIdSize).IsRequired();
                e.Property(x => x.RoleGivenByUserId).HasMaxLength(brukerIdSize).IsRequired();
            });

            // Assessment
            modelBuilder.Entity<Assessment>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Doc).IsRequired();
                e.Property(x=>x.ChangedAt).IsRequired();
                e.HasIndex(x => x.ChangedAt);
                e.Property(x=>x.Expertgroup).HasComputedColumnSql(" isnull(cast(JSON_VALUE(Doc, '$.ExpertGroup') as nvarchar(150)),'mangler')");
                e.Property(x => x.Expertgroup).HasMaxLength(ekspertgruppeIdSize).IsRequired();
                e.HasIndex(x => x.Expertgroup).IncludeProperties(x=>new {x.ScientificNameId, x.IsDeleted, x.LastUpdatedAt, x.LockedForEditAt}); // hurtig tilgang til verdiene i ekspertgruppekontroller
                e.HasOne(x => x.LockedForEditByUser).WithMany().OnDelete(DeleteBehavior.NoAction).IsRequired(false);
                e.Property(x => x.LockedForEditAt).IsRequired(true); //.HasComputedColumnSql("CONVERT(datetime2,JSON_VALUE(Doc, '$.LockedForEditAt'),112)");
                e.HasOne(x => x.LastUpdatedByUser).WithMany().OnDelete(DeleteBehavior.NoAction).IsRequired();
                e.Property(x => x.LastUpdatedAt).IsRequired(true);//.HasComputedColumnSql("CONVERT(datetime2,JSON_VALUE(Doc, '$.LastUpdatedAt'),112)");
                e.Property(x => x.IsDeleted).HasComputedColumnSql("cast((case when JSON_VALUE(Doc,'$.IsDeleted') = 'true' then 1 else 0 end) as bit)");
            });
            // Assessment
            modelBuilder.Entity<AssessmentHistory>(e =>
            {
                // todo: fix table name
                e.ToTable("AssessmentHistory");
                e.HasKey(x => new {x.Id, x.HistoryAt});
                e.Property(x => x.Id).ValueGeneratedNever();
                e.HasIndex(x => x.HistoryAt);
                e.Property(x => x.Doc).IsRequired();
                e.HasOne(x => x.User).WithMany().OnDelete(DeleteBehavior.NoAction).IsRequired();
            });

            // Comments
            modelBuilder.Entity<AssessmentComment>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Assessment).WithMany(x => x.Comments).OnDelete(DeleteBehavior.NoAction).IsRequired();
                e.Property(x => x.Type).IsRequired();
                e.Property(x => x.IsDeleted).IsRequired();
                e.Property(x => x.Closed).IsRequired();
                e.Property(x => x.Comment).IsRequired().HasMaxLength(3900);
                e.Property(x => x.CommentDate).IsRequired();
                e.HasIndex(x => x.CommentDate);
                e.Property(x => x.ClosedDate);
                e.HasOne(x => x.User).WithMany().OnDelete(DeleteBehavior.NoAction).IsRequired();
                e.HasOne(x => x.ClosedBy).WithMany().OnDelete(DeleteBehavior.NoAction).IsRequired(false);
            });

            // attachemnts
            modelBuilder.Entity<Attachment>(e =>
                {
                    e.HasKey(x => x.Id);
                    e.HasOne(x => x.Assessment).WithMany(x => x.Attachments).OnDelete(DeleteBehavior.NoAction).IsRequired();
                    e.Property(x => x.IsDeleted).IsRequired();
                    e.Property(x => x.File).IsRequired();
                    e.Property(x => x.Type).IsRequired().HasMaxLength(300);
                    e.Property(x => x.Date).IsRequired();
                    e.Property(x => x.FileName).IsRequired().HasMaxLength(1000);
                    e.Property(x => x.Name).IsRequired().HasMaxLength(2000);
                    e.HasOne(x => x.User).WithMany().OnDelete(DeleteBehavior.NoAction).IsRequired();
                });
        }

        public void Migrate()
        {
            var test = this.Database.EnsureCreated();
            this.Database.Migrate();
        }
    }

    public class TimeStamp
    {
        public int Id { get; set; }
        public DateTime DateTimeUpdated { get; set; }
    }
}
