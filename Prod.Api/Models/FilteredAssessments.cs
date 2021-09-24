using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Prod.Domain;

namespace Prod.Api.Models
{
    public class FilteredAssessments
    {
        public List<AssessmentListItem> assessmentList { get; set; }
        public int TotalCount { get; set; }
        public List<string> Authors { get; set; }
    }
}
