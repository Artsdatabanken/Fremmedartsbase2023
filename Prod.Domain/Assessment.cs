using System;
using System.Collections.Generic;
using System.Text;

namespace Prod.Domain
{
    public class Assessment
    {
        public int Id { get; set; }
        /// <summary>
        /// datetime for everyChange - system or user
        /// </summary>
        public DateTime ChangedAt { get; set; }
        public string Expertgroup { get; set; }
        public User LastUpdatedByUser { get; set; }
        public Guid LastUpdatedByUserId { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public User LockedForEditByUser { get; set; }
        public Guid? LockedForEditByUserId { get; set; }
        public DateTime LockedForEditAt { get; set; }
        public string Doc { get; set; }
        public bool IsDeleted { get; set; }
        public int ScientificNameId { get; set; }

        public List<AssessmentComment> Comments { get; set; }
        public List<Attachment> Attachments { get; set; }
    }

    public class AssessmentHistory {
        public int Id { get; set; }
        public DateTime HistoryAt { get; set; }
        public User User { get; set; }
        public Guid UserId { get; set; }
        public string Doc { get; set; }
    }

    public enum CommentType
    {
        Ordinary = 0,
        System = 1,
        TaxonomicChange = 10,
        PotentialTaxonomicChange = 11
    }
    public class AssessmentComment
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public Assessment Assessment { get; set; }
        public string Comment { get; set; }
        public CommentType Type { get; set; }
        public DateTime CommentDate { get; set; }
        public User User { get; set; }
        public Guid UserId { get; set; }
        public bool Closed { get; set; }
        public Guid? ClosedById { get; set; }
        public User ClosedBy { get; set; }
        public DateTime? ClosedDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
