using System;
using System.Collections.Generic;
using Prod.Domain;

namespace Prod.Api.Helpers
{
    internal class ExportMapperHelper
    {
        internal static int? GetScores(string category, string criteria, string v)
        {
            if (category == "NR" || category == "" || category == null)
            {
                return null;
            }
            else 
            {
                int SInv = (int)Char.GetNumericValue(criteria[0]);
                string SEco = criteria.Split(",")[1];
                int SEco2 = (int)Char.GetNumericValue(SEco[0]);
                return  v == "inv"? SInv: SEco2;
            }
        }

        private static string GetAlienSpeciesCategory2018(string AlienCategory)
        {
            if(AlienCategory == null || AlienCategory == "")
            {
                return string.Empty;
            }
            return AlienCategory;
        }
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

        internal static string GetHcritInformation(List<RiskAssessment.SpeciesSpeciesInteraction> genTrans)
        {
            if (genTrans == null || genTrans.Count == 0)
            {
                return string.Empty;
            }
            var Redlistinfo = new List<string>();
            for (var i = 0; i < genTrans.Count; ++i) 
            {
                string interact = genTrans[i].ScientificName + "//" + genTrans[i].RedListCategory + "//" + genTrans[i].KeyStoneSpecie + "//" + genTrans[i].Scale;
                Redlistinfo.Add(interact);
            }
            return string.Join("; ", Redlistinfo);
        }

        internal static object GetIcritInformation(List<RiskAssessment.HostParasiteInteraction> hostParasiteInformations)
        {
            if (hostParasiteInformations == null || hostParasiteInformations.Count == 0)
            {
                return string.Empty;
            }
            var Redlistinfo = new List<string>();
            for (var i = 0; i < hostParasiteInformations.Count; ++i) 
            {
                string interact = hostParasiteInformations[i].ScientificName + "//" + hostParasiteInformations[i].RedListCategory + "//" + hostParasiteInformations[i].KeyStoneSpecie + "//" + hostParasiteInformations[i].ParasiteScientificName + "//" + hostParasiteInformations[i].Scale + "//" + hostParasiteInformations[i].Status + "//" + hostParasiteInformations[i].ParasiteEcoEffect;
                Redlistinfo.Add(interact);
            }
            return string.Join("; ", Redlistinfo);
        }
    }
}
