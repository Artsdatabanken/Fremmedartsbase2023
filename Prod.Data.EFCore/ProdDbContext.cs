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

        public virtual DbSet<Bruker> Brukere { get; set; }
        public virtual DbSet<Assessment> Assessments { get; set; }
        public virtual DbSet<AssessmentHistory> AssessmentHistories { get; set; }
        public virtual DbSet<Kode> Koder { get; set; }

        public virtual DbSet<AssessmentComment> Comments { get; set; }
        public virtual DbSet<Attachment> Attachments { get; set; }

        public virtual DbSet<UserFeedback> UserFeedbacks { get; set; }



        //public virtual DbSet<Assessment> Assessment { get; set; }
        //public virtual DbSet<AssessmentRevision> AssessmentRevision { get; set; }
        //public virtual DbSet<ReferenceUsage> ReferenceUsage { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            const int brukerIdSize = 100;
            const int ekspertgruppeIdSize = 200;

            // Bruker
            modelBuilder
                .Entity<Bruker>(e =>
                {
                    e.HasKey(x => x.Id);
                    e.HasMany(x => x.EkspertgruppeRoller).WithOne(x => x.Bruker).OnDelete(DeleteBehavior.Cascade);

                    e.Property(x => x.Id).HasMaxLength(brukerIdSize);
                    e.Property(x => x.Brukernavn).HasMaxLength(brukerIdSize).IsRequired();
                    e.Property(x => x.Navn).HasMaxLength(ekspertgruppeIdSize).IsRequired();
                    e.Property(x => x.Email).HasMaxLength(ekspertgruppeIdSize).IsRequired();
                    e.Property(x => x.Soknad).HasMaxLength(2000);
                    e.Property(x => x.DatoOpprettet).HasDefaultValue(new DateTime(2020, 1, 1));
                    e.Property(x => x.DatoSistAktiv).HasDefaultValue(new DateTime(2020, 1, 1));
                });
                


            // EkspertgruppeRolle
            modelBuilder.Entity<Bruker.EkspertgruppeRolle>(e =>
            {
                e.HasKey(x => new
                {
                    x.BrukerId,
                    x.EkspertgruppeId
                });
                e.Property(x => x.EkspertgruppeId).HasMaxLength(ekspertgruppeIdSize).IsRequired();
                e.Property(x => x.OpprettetAvBrukerId).HasMaxLength(brukerIdSize).IsRequired();
            });

            // Assessment
            modelBuilder.Entity<Assessment>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Doc).IsRequired();
                e.Property(x=>x.Expertgroup).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.Ekspertgruppe') as nvarchar(150))");
                e.Property(x => x.Expertgroup).HasMaxLength(ekspertgruppeIdSize).IsRequired();
                e.HasIndex(x => x.Expertgroup).IncludeProperties(x=>new {x.ScientificName, x.PopularName, x.ScientificNameId, x.TaxonHierarcy, x.IsDeleted, x.EvaluationStatus, x.LastUpdatedAt,x.LastUpdatedBy,x.LockedForEditByUser, x.LockedForEditAt, x.Category}); // hurtig tilgang til verdiene i ekspertgruppekontroller
                e.Property(x => x.LockedForEditByUser).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.LockedForEditByUser') as nvarchar(100))");
                e.Property(x => x.LockedForEditAt).HasComputedColumnSql("CONVERT(datetime2,JSON_VALUE(Doc, '$.LockedForEditAt'),112)");
                e.Property(x => x.LastUpdatedBy).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.LastUpdatedBy') as nvarchar(100))");
                e.Property(x => x.LastUpdatedAt).HasComputedColumnSql("CONVERT(datetime2,JSON_VALUE(Doc, '$.LastUpdatedOn'),112)");
                e.Property(x => x.EvaluationStatus).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.EvaluationStatus') as nvarchar(100))");

                // json props
                e.Property(x => x.ScientificName).HasComputedColumnSql("CONVERT([nvarchar](300),json_value([Doc],'$.VurdertVitenskapeligNavn')) + ISNULL(' ' + CONVERT([nvarchar](300),json_value([Doc],'$.VurdertVitenskapeligNavnAutor')), '')");
                e.Property(x => x.PopularName).HasComputedColumnSql("CONVERT([nvarchar](300),json_value([Doc],'$.PopularName'))");
                e.Property(x => x.TaxonHierarcy).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.VurdertVitenskapeligNavnHierarki') as nvarchar(1500))");
                e.Property(x => x.IsDeleted).HasComputedColumnSql("cast((case when JSON_VALUE(Doc,'$.Slettet') = 'true' then 1 else 0 end) as bit)");
                e.Property(x => x.Category).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.Kategori') as nvarchar(5))");
                e.Property(x => x.Criteria).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.Kriterier') as nvarchar(50))");
                e.Ignore(x => x.MainCriteria);
                e.Property(x => x.ScientificNameId).HasComputedColumnSql("Convert(int,JSON_VALUE(Doc, '$.VurdertVitenskapeligNavnId'))");
                e.Property(x => x.AssessmentYear).HasComputedColumnSql("Convert(int,JSON_VALUE(Doc, '$.\"Vurderingsår\"'))");
                e.Property(x => x.CategoryLastRedList).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.KategoriFraForrigeListe') as nvarchar(100))");
                e.Property(x => x.NatureTypes).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.NaturtypeHovedenhet') as nvarchar(500))");
                e.Property(x => x.RedListAssessedSpecies).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.RodlisteVurdertArt') as nvarchar(100))");
                e.Property(x => x.AssessmentContext).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.VurderingsContext') as nvarchar(10))");
            });
            // Assessment
            modelBuilder.Entity<AssessmentHistory>(e =>
            {
                e.HasKey(x => new {x.Id, x.HistoryAt});
                e.Property(x => x.Id).ValueGeneratedNever();
                e.Property(x => x.Doc).IsRequired();
                e.Property(x => x.Expertgroup).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.Ekspertgruppe') as nvarchar(150))");
                e.HasIndex(x => x.Expertgroup);
                e.Property(x => x.LockedForEditByUser).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.LockedForEditByUser') as nvarchar(100))");
                e.Property(x => x.LockedForEditAt).HasComputedColumnSql("CONVERT(datetime2,JSON_VALUE(Doc, '$.LockedForEditAt'),112)");
                e.Property(x => x.LastUpdatedBy).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.LastUpdatedBy') as nvarchar(100))");
                e.Property(x => x.LastUpdatedAt).HasComputedColumnSql("CONVERT(datetime2,JSON_VALUE(Doc, '$.LastUpdatedOn'),112)");
                e.Property(x => x.EvaluationStatus).HasComputedColumnSql("cast(JSON_VALUE(Doc, '$.EvaluationStatus') as nvarchar(100))");
                e.HasIndex(x => x.HistoryAt);
            });

            // Koder
            modelBuilder.Entity<Kode>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x=>x.Id).ValueGeneratedNever();
                e.Property(x => x.Context).HasMaxLength(20).IsRequired();
                e.Property(x => x.JsonData).IsRequired();
            });

            // Comments
            modelBuilder.Entity<AssessmentComment>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Assessment).WithMany(x => x.Comments).OnDelete(DeleteBehavior.NoAction).IsRequired();
                e.Property(x => x.IsDeleted).IsRequired();
                e.Property(x => x.Closed).IsRequired();
                e.Property(x => x.Comment).IsRequired().HasMaxLength(3900);
                e.Property(x => x.CommentDate).IsRequired();
                e.Property(x => x.ClosedDate);
                e.HasOne(x=> x.User).WithMany().OnDelete(DeleteBehavior.NoAction).IsRequired();
                e.HasOne(x => x.ClosedBy).WithMany().OnDelete(DeleteBehavior.NoAction);
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

}
