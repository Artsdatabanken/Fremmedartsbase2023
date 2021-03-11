using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Prod.Domain
{
    public class Taxon
    {
        public string Id { get; set; }
        public int taxonID { get; set; }
        public ScientificName acceptedName { get; set; }
        public ScientificName[] scientificNames { get; set; }
        public VernacularName[] vernacularNames { get; set; }

        public void Extend()
        {
            ScientificName acceptedName = scientificNames.FirstOrDefault();
            if (acceptedName != null)
            {
                foreach (ScientificName sciName in scientificNames.Skip(1))
                {
                    sciName.acceptedNameUsage = acceptedName.scientificName;
                    sciName.acceptedNameUsageID = acceptedName.scientificNameID;
                }
            }
        }
    }

    public class ScientificName
    {
        public int? scientificNameID { get; set; }
        public string scientificName { get; set; }
        public string scientificNameAuthorship { get; set; }
        public string taxonRank { get; set; }
        public string taxonomicStatus { get; set; }
        public int? acceptedNameUsageID { get; set; }
        public string acceptedNameUsage { get; set; }
        public string kingdom { get; set; }
        public string phylum { get; set; }
        public string @class { get; set; }
        public string @order { get; set; }
        public string family { get; set; }
        public string genus { get; set; }
        public string subgenus { get; set; }
        public string specificEpithet { get; set; }
        public string infraspecificEpithet { get; set; }
        public int? parentNameUsageID { get; set; }
        public string parentNameUsage { get; set; }
        public int? parentMainNameUsageID { get; set; }
        public string parentMainNameUsage { get; set; }
        public string[] higherClassification { get; set; }
        public int[] higherClassificationID { get; set; }
        public SpeciesGroup[] speciesGrouping { get; set; }
    }

    public class SpeciesGroup
    {
        public string groupContextName { get; set; }
        public string groupName { get; set; }
    }

    public class VernacularName
    {
        public int? vernacularNameID { get; set; }
        public string vernacularName { get; set; }
        public string nomenclaturalStatus { get; set; }
        public string language { get; set; }
    }
}
