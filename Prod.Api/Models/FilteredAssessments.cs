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
        public List<Facet> Facets { get; set; }
    }
    public class Facet
    {
        public string Name { get; set; }
        public List<FacetItem> FacetsItems { get; set; } = new List<FacetItem>();
    }
    public class FacetItem
    {
        public string Name { get; set; }
        public int Count { get; set; }
    }
}
