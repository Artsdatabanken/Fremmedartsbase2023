using System;
using System.Collections.Generic;
using System.Text;

namespace Prod.Domain
{
    public class Assessment
    {
        public int Id { get; set; }
        public string Expertgroup { get; set; }
        public string EvaluationStatus { get; set; }
        public string LastUpdatedBy { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public string LockedForEditByUser { get; set; }
        public DateTime LockedForEditAt { get; set; }
        public string Doc { get; set; }
        public string ScientificName { get; set; }
        public string PopularName { get; set; }
        public string TaxonHierarcy { get; set; }
        public bool IsDeleted { get; set; }
        public string Category { get; set; }
        //public string Criteria { get; set; }
        //public string[] MainCriteria { get; set; }
        public int ScientificNameId { get; set; }
        //public int AssessmentYear { get; set; } //Vurderingsår
        //public string CategoryLastRedList { get; set; } //KategoriFraForrigeListe
        ////public List<string> NatureTypes { get; set; } = new List<string>(); //NaturtypeHovedenhet (Hovendhabitat)
        //public string NatureTypes { get; set; } //NaturtypeHovedenhet (Hovendhabitat)         List or string ????
        //public string RedListAssessedSpecies { get; set; }
        //public string AssessmentContext { get; set; }

        public List<AssessmentComment> Comments { get; set; }
        public List<Attachment> Attachments { get; set; }
    }

    public class AssessmentHistory {
        public int Id { get; set; }
        public DateTime HistoryAt { get; set; }
        public string Expertgroup { get; set; }
        public string EvaluationStatus { get; set; }
        public string LastUpdatedBy { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public string LockedForEditByUser { get; set; }
        public DateTime LockedForEditAt { get; set; }
        public string Doc { get; set; }
    }
    public class AssessmentComment
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public Assessment Assessment { get; set; }
        public string Comment { get; set; }
        public DateTime CommentDate { get; set; }
        public Bruker User { get; set; }
        public string UserId { get; set; }
        public bool Closed { get; set; }
        public string ClosedById { get; set; }
        public Bruker ClosedBy { get; set; }
        public DateTime? ClosedDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
