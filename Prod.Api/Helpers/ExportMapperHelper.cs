using System;
using System.Collections.Generic;
using System.Linq;
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

        private static int GetABScoreUncertainties(int AValue, int BValue)
        {
            int ABValue = int.Parse(AValue.ToString() + BValue.ToString());
            return (ABValue) switch 
            {
                12 => 2,
                13 => 2,
                14 => 3,
                21 => 1,
                23 => 3,
                24 => 3,
                31 => 2,
                32 => 3,
                34 => 4,
                41 => 2,
                42 => 3,
                43 => 4,
                _ => AValue //when A = B, the result is their value
            };
        }

        internal static int? GetScoreUncertainties(string category, string decisiveCriteria, List<RiskAssessment.Criterion> criteria, string matrixAxis, string uncertainty)
        {
            if (category == "NR" || category == "" || category == null)
            {
                return null;
            }
            
            bool ecologicalEffectAxis = matrixAxis == "yAxis";
            bool uncertaintyHigh = uncertainty == "high";
            if (ecologicalEffectAxis) //y-axis
            {
                List<RiskAssessment.Criterion> criteriaAxis = criteria.Where(x => new[] {"D", "E", "F", "G", "H", "I"}.Any(y => x.CriteriaLetter.Contains(y))).ToList();
                // Only use decisive criteria (i.e. criteria with value equal to axis-score):
                int? ecologicalEffectAxisScore = GetScores(category, decisiveCriteria, "eco");
                criteriaAxis.RemoveAll(s => (s.Value + 1 != ecologicalEffectAxisScore)); 
                var uncertaintyValuesLow = criteriaAxis.Select(x => x.UncertaintyValues.DefaultIfEmpty().Min()).Distinct();
                var uncertaintyValueLow = uncertaintyValuesLow.Count() == 1 ? uncertaintyValuesLow.FirstOrDefault() + 1 : ecologicalEffectAxisScore;
                
                return uncertaintyHigh ? criteriaAxis.Select(x => x.UncertaintyValues.DefaultIfEmpty().Max()).Max() + 1
                : uncertaintyValueLow;
            }

            else //x-axis
            {
                List<RiskAssessment.Criterion> criteriaAxis = criteria.Where(x => new[] {"A", "B", "C"}.Any(y => x.CriteriaLetter.Contains(y))).ToList();
                
                //when no uncertainties, A and B values are equal to score
                int AValue = criteriaAxis.Where(x => x.CriteriaLetter == "A").Select(x => x.Value).FirstOrDefault();
                int BValue = criteriaAxis.Where(x => x.CriteriaLetter == "B").Select(x => x.Value).FirstOrDefault();
                int CValue = criteriaAxis.Where(x => x.CriteriaLetter == "C").Select(x => x.Value).FirstOrDefault();
                
                if (uncertaintyHigh)
                {
                    int AValueUncertain = criteriaAxis.Where(x => x.CriteriaLetter == "A").Select(x => x.UncertaintyValues.DefaultIfEmpty().Max()).FirstOrDefault() + 1;   
                    int BValueUncertain = criteriaAxis.Where(x => x.CriteriaLetter == "B").Select(x => x.UncertaintyValues.DefaultIfEmpty().Max()).FirstOrDefault() + 1;    
                    CValue = criteriaAxis.Where(x => x.CriteriaLetter == "C").Select(x => x.UncertaintyValues.DefaultIfEmpty().Max()).FirstOrDefault() + 1; 
                    int scoreAB = GetABScoreUncertainties(AValueUncertain, BValueUncertain);
                    //difference from score cannot exceed 1:
                    int resultScoreAB = (int)(scoreAB - GetScores(category, decisiveCriteria, "inv") > 1 ? GetScores(category, decisiveCriteria, "inv") + 1 : scoreAB);
                    //Always return maximum value:
                    return (Math.Max(resultScoreAB, CValue));
                }

                else
                {
                    //Only use decisive criteria for lower uncertainty:
                    var listOfLetters = new List<string>();
                    if (decisiveCriteria.Contains("A") || decisiveCriteria.Contains("B")) 
                    {
                        listOfLetters.AddRange(new List<string>
                        {
                            "A",
                            "B",
                        });
                    }

                    if (decisiveCriteria.Contains("C")) 
                    {
                        listOfLetters.Add("C");
                    }  

                    //Get uncertaintyvalues from decisive criteria 
                    if (listOfLetters.Count == 3)
                    {
                        AValue = criteriaAxis.Where(x => x.CriteriaLetter == "A").Select(x => x.UncertaintyValues.DefaultIfEmpty().Min()).FirstOrDefault() + 1;   
                        BValue = criteriaAxis.Where(x => x.CriteriaLetter == "B").Select(x => x.UncertaintyValues.DefaultIfEmpty().Min()).FirstOrDefault() + 1;   
                        CValue = criteriaAxis.Where(x => x.CriteriaLetter == "C").Select(x => x.UncertaintyValues.DefaultIfEmpty().Min()).FirstOrDefault() + 1; 
                        int scoreAB = GetABScoreUncertainties(AValue, BValue);
                        //difference from axis-score cannot exceed 1:
                        int resultScoreAB = (int)(GetScores(category, decisiveCriteria, "inv") - scoreAB > 1 ? GetScores(category, decisiveCriteria, "inv") - 1 : scoreAB);
                        //only return minimum value if all values are equal:
                        return resultScoreAB == CValue ? CValue : Math.Max(resultScoreAB, CValue);
                    }
                    
                    if (listOfLetters.Count == 2)
                    {
                        AValue = criteriaAxis.Where(x => x.CriteriaLetter == "A").Select(x => x.UncertaintyValues.DefaultIfEmpty().Min()).FirstOrDefault() + 1;   
                        BValue = criteriaAxis.Where(x => x.CriteriaLetter == "B").Select(x => x.UncertaintyValues.DefaultIfEmpty().Min()).FirstOrDefault() + 1;   
                        int scoreAB = GetABScoreUncertainties(AValue, BValue);
                        //difference from axis-score cannot exceed 1:
                        int resultScoreAB = (int)(GetScores(category, decisiveCriteria, "inv") - scoreAB > 1 ? GetScores(category, decisiveCriteria, "inv") - 1 : scoreAB);
                        return resultScoreAB;
                    }

                    if (listOfLetters.Count == 1)
                    {
                        CValue = criteriaAxis.Where(x => x.CriteriaLetter == "C").Select(x => x.UncertaintyValues.DefaultIfEmpty().Min()).FirstOrDefault() + 1; 
                        int scoreAB = GetABScoreUncertainties(AValue, BValue);
                        return CValue;
                    }

                    else return 1; //NK-species has lowest value 1
                }
            }
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

        internal static string GetProgress(FA4 ass)
        {
            if (ass.EvaluationStatus == "imported" || (ass.HorizonDoScanning == false &&
                                                       ass.LastUpdatedAt < IndexHelper._dateTimeForHorScanDone))
            {
                return "notStarted";
            }

            if (ass.EvaluationStatus == "inprogress")
            {
                return "inprogress";
            }
            else if (ass.EvaluationStatus == "finished")
            {
                return "finished";
            }

            return string.Empty;
        }

        internal static string GetRiskAssessmentChosenMethodBcrit(RiskAssessment ra, string assConc)
        {
            string result = //using terms suggested by Hanno
            (ra.ChosenSpreadYearlyIncrease == "a") ? "modelling" : 
            (assConc == "AssessedDoorknocker" && ra.ChosenSpreadYearlyIncrease == "b") ? "introductionpressure":
            (assConc == "AssessedSelfReproducing" && ra.ChosenSpreadYearlyIncrease == "b" && ra.AOOfirstOccurenceLessThan10Years == "yes") ? "AOO":
            (assConc == "AssessedSelfReproducing" && ra.ChosenSpreadYearlyIncrease == "b" && ra.AOOfirstOccurenceLessThan10Years == "no") ? "AOO_periodlessthan10years":
            ""; //retun empty for species not assessed
            return result;
        }
        internal static int? GetRiskAssessmentCritera(FA4 ass, List<RiskAssessment.Criterion> criteria, string critLetter, string scoretab)
        { 
           int? CritScore = 0;
           int? CritLow = 0;
           int? CritHigh = 0;
            if (critLetter == "A")
            {
                if(GetProgress(ass) == "notStarted" || ass.RiskAssessment.ChosenSpreadMedanLifespan == "RedListCategoryLevel") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else
                {
                    CritScore = criteria[0].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    //UncertaintyValues not always ordered from smallest to largest - sometimes high comes at [0] and low at [1]..
                    CritLow = (criteria[0].UncertaintyValues == null || criteria[0].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[0].UncertaintyValues[0] + 1 ,criteria[0].UncertaintyValues[criteria[0].UncertaintyValues.Length-1] + 1);
                    CritHigh = (criteria[0].UncertaintyValues == null || criteria[0].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[0].UncertaintyValues[0] + 1 ,criteria[0].UncertaintyValues[criteria[0].UncertaintyValues.Length-1] + 1);
                }
            }

            if (critLetter == "B")
            {
                if(GetProgress(ass) == "notStarted" || GetRiskAssessmentChosenMethodBcrit(ass.RiskAssessment, ass.AssessmentConclusion) == "") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else
                {
                    CritScore = criteria[1].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    CritLow = (criteria[1].UncertaintyValues == null || criteria[1].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[1].UncertaintyValues[0] + 1,criteria[1].UncertaintyValues[criteria[1].UncertaintyValues.Length-1] + 1);
                    CritHigh = (criteria[1].UncertaintyValues == null || criteria[1].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[1].UncertaintyValues[0] + 1,criteria[1].UncertaintyValues[criteria[1].UncertaintyValues.Length-1] + 1);
                }
            }

            if (critLetter == "C")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else
                {
                    CritScore = criteria[2].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    CritLow = (criteria[2].UncertaintyValues == null || criteria[2].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[2].UncertaintyValues[0] + 1, criteria[2].UncertaintyValues[criteria[2].UncertaintyValues.Length-1] + 1);
                    CritHigh = (criteria[2].UncertaintyValues == null || criteria[2].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[2].UncertaintyValues[0] + 1, criteria[2].UncertaintyValues[criteria[2].UncertaintyValues.Length-1] + 1);
                }
            }
            if (critLetter == "D")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else
                {
                    CritScore = criteria[3].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    CritLow = (criteria[3].UncertaintyValues == null || criteria[3].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[3].UncertaintyValues[0] + 1,criteria[3].UncertaintyValues[criteria[3].UncertaintyValues.Length-1] + 1);
                    CritHigh = (criteria[3].UncertaintyValues == null || criteria[3].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[3].UncertaintyValues[0] + 1,criteria[3].UncertaintyValues[criteria[3].UncertaintyValues.Length-1] + 1);
                    // CritLow = Math.Min(CritLow1, CritHigh1);
                }
            }
            if (critLetter == "E")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else
                {
                    CritScore = criteria[4].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    CritLow = (criteria[4].UncertaintyValues == null || criteria[4].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[4].UncertaintyValues[0] + 1, criteria[4].UncertaintyValues[criteria[4].UncertaintyValues.Length-1] + 1);
                    CritHigh = (criteria[4].UncertaintyValues == null || criteria[4].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[4].UncertaintyValues[0] + 1, criteria[4].UncertaintyValues[criteria[4].UncertaintyValues.Length-1] + 1);
                }
            }
            if (critLetter == "F")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else
                {
                    CritScore = criteria[5].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    CritLow = (criteria[5].UncertaintyValues == null || criteria[5].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[5].UncertaintyValues[0] + 1, criteria[5].UncertaintyValues[criteria[5].UncertaintyValues.Length-1]+1);
                    CritHigh = (criteria[5].UncertaintyValues == null || criteria[5].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[5].UncertaintyValues[0] + 1, criteria[5].UncertaintyValues[criteria[5].UncertaintyValues.Length-1]+1);
                }
            }
            if (critLetter == "G")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else
                {
                    CritScore = criteria[6].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    CritLow = (criteria[6].UncertaintyValues == null || criteria[6].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[6].UncertaintyValues[0] + 1, criteria[6].UncertaintyValues[criteria[6].UncertaintyValues.Length-1] + 1);
                    CritHigh = (criteria[6].UncertaintyValues == null || criteria[6].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[6].UncertaintyValues[0] + 1, criteria[6].UncertaintyValues[criteria[6].UncertaintyValues.Length-1] + 1);
                }
            }
            if (critLetter == "H")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else
                {
                    CritScore = criteria[7].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    CritLow = (criteria[7].UncertaintyValues == null || criteria[7].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[7].UncertaintyValues[0] + 1, criteria[7].UncertaintyValues[criteria[7].UncertaintyValues.Length-1] + 1);
                    CritHigh = (criteria[7].UncertaintyValues == null || criteria[7].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[7].UncertaintyValues[0] + 1, criteria[7].UncertaintyValues[criteria[7].UncertaintyValues.Length-1] + 1);
                }
            }
            if (critLetter == "I")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                    CritHigh = null;
                    CritLow = null;
                }
                else 
                {
                    CritScore = criteria[8].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
                    CritLow = (criteria[8].UncertaintyValues == null || criteria[8].UncertaintyValues.Length == 0) ? null : Math.Min(criteria[8].UncertaintyValues[0] + 1, criteria[8].UncertaintyValues[criteria[8].UncertaintyValues.Length-1] + 1);
                    CritHigh = (criteria[8].UncertaintyValues == null || criteria[8].UncertaintyValues.Length == 0) ? null : Math.Max(criteria[8].UncertaintyValues[0] + 1, criteria[8].UncertaintyValues[criteria[8].UncertaintyValues.Length-1] + 1);
                }
            }

            return  (scoretab == "score") ? CritScore   :
                    (scoretab == "low")   ? CritLow     :
                    CritHigh;
        }
        internal static string GetRegionalDistribution(List<Fylkesforekomst> fylkesforekomster)
        {
            if (fylkesforekomster == null || fylkesforekomster.Count == 0)
            {
                return string.Empty;
            }
            var regionList = new List<string>();
            for (var i = 0; i < fylkesforekomster.Count; ++i)
            {
                if (fylkesforekomster[i].State0 != 0 || fylkesforekomster[i].State1 != 0 || fylkesforekomster[i].State3 != 0)
                {
                    string newreg = fylkesforekomster[i].Fylke + "//" + fylkesforekomster[i].State0 + "//" + fylkesforekomster[i].State1 + "//" + fylkesforekomster[i].State3;
                    regionList.Add(newreg);
                }
                
            }
            return string.Join("; ", regionList);
        }
    }
}
