using System;
using System.Collections.Generic;
using System.Text;

namespace Prod.Domain
{
    public class AssessmentListItem
    {
        public string Id { get; set; }
        public string Expertgroup { get; set; }
        public string EvaluationStatus { get; set; }
        public string LastUpdatedBy { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public string LockedForEditByUser { get; set; }
        public DateTime LockedForEditAt { get; set; }
        public string ScientificName { get; set; }
        public string TaxonHierarcy { get; set; }

        public string Category { get; set; }
        public string Criteria { get; set; }
        public string[] MainCriteria { get; set; }
        public string AssessmentContext { get; set; }



        public string PopularName { get; set; }

        public string CommentDate { get; set; }

        public int CommentClosed { get; set; }

        public int CommentOpen { get; set; }

        public int CommentNew { get; set; }

        public int TaxonChange { get; set; }

        //public List<string> Criteria { get; set; }
        //public List<string> SearchStrings { get; set; }

    }
}
