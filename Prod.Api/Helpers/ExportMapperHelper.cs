using System.Collections.Generic;
using Prod.Domain;

namespace Prod.Api.Helpers
{
    internal class ExportMapperHelper
    {
        internal static string GetDEcritInformation(List<RiskAssessment.SpeciesSpeciesInteraction> speciesSpeciesInteractions)
        {
            if (speciesSpeciesInteractions == null || speciesSpeciesInteractions.Count == 0)
            {
                return string.Empty;
            }
            var redlistinfo = new List<string>();
            string background = string.Empty;
            
            for (var i = 0; i < speciesSpeciesInteractions.Count; ++i) 
            {
                
                if (speciesSpeciesInteractions[i].BasisOfAssessment.Count > 0)
                {
                    background = string.Join("|", speciesSpeciesInteractions[i].BasisOfAssessment.ToArray());
                }
                string interact = speciesSpeciesInteractions[i].ScientificName + "//" + speciesSpeciesInteractions[i].RedListCategory + "//" + speciesSpeciesInteractions[i].KeyStoneSpecie 
                + "//" + speciesSpeciesInteractions[i].Effect + "//" + speciesSpeciesInteractions[i].Scale + "//" + speciesSpeciesInteractions[i].InteractionType + "//" + background;
                redlistinfo.Add(interact);
            }
            return string.Join("; ", redlistinfo);

        }

        internal static string GetDEcritInformationNaturetypes(List<RiskAssessment.SpeciesNaturetypeInteraction> speciesNatInt)
        {
            if (speciesNatInt == null || speciesNatInt.Count == 0)
            {
                return string.Empty;
            }
            var redlistinfo = new List<string>();
            string background = string.Empty;
            for (var i = 0; i < speciesNatInt.Count; ++i) 
            {
                if (speciesNatInt[i].BasisOfAssessment.Count > 0)
                {
                    background = string.Join("|", speciesNatInt[i].BasisOfAssessment.ToArray());
                }
                string interact = speciesNatInt[i].NiNCode + "//" + speciesNatInt[i].KeyStoneSpecie 
                + "//" + speciesNatInt[i].Effect + "//" + speciesNatInt[i].Scale + "//" + speciesNatInt[i].InteractionType + "//" + background;
                redlistinfo.Add(interact);
            }
            return string.Join("; ", redlistinfo);
        }
    }
}
