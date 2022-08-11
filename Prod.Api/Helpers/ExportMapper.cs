using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CsvHelper.Configuration.Attributes;
using Prod.Domain;
using Prod.Domain.Legacy;
using RiskAssessment = Prod.Domain.RiskAssessment;
using SpreadHistory = Prod.Domain.SpreadHistory;

namespace Prod.Api.Helpers
{
    public class ExportMapper
    {
        public static Mapper InitializeMapper()
        {
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<FA4WithComments, FA4HorizonScanExport>()
                    .ForMember(x => x.DoorKnockerType, opt => opt.MapFrom(src => GetDoorknockerType(src)))
                    ;

                // eksempel på mapåping der alt fra ett listeobjekt skal inn i en celle
                cfg.CreateMap<List<SpreadHistory>, string>().ConvertUsing<CustomSpreadHistoryConverter>();
                cfg.CreateMap<FA4WithComments, FA4Export>()
                    //.ForMember(x => x.DoorKnockerType, opt => opt.MapFrom(src => GetDoorknockerType(src)))
                    .AfterMap((src, dest) =>
                    {
                        var ass2018 = src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018);
                        if (ass2018 != null)
                        {
                            switch (ass2018.RiskLevel)
                            {
                                case 0:
                                    dest.Category2018 = "NK";
                                    break;
                                case 1:
                                    dest.Category2018 = "LO";
                                    break;
                                case 2:
                                    dest.Category2018 = "PH";
                                    break;
                                case 3:
                                    dest.Category2018 = "HI";
                                    break;
                                case 4:
                                    dest.Category2018 = "SE";
                                    break;
                                //case -1: return "-";
                                default:
                                    dest.Category2018 = "NR";
                                    break;
                            }

                            dest.Criteria2018 = ass2018.DecisiveCriteria;
                        }
                        else
                        {
                            dest.Category2018 = "";
                            dest.Criteria2018 = "";
                        }
                        //AfterFabMap(dest, src);


                        // eksempel på mapping der man splitter informasjon fra ett listeobjekt inn i flere nye kolonner
                        dest.NaturalOriginEurope = GetNaturalOrigins(src.NaturalOrigins, "europe");
                        dest.NaturalOriginAsia = GetNaturalOrigins(src.NaturalOrigins, "asia");
                        dest.NaturalOriginOceania = GetNaturalOrigins(src.NaturalOrigins, "oceania");
                        dest.NaturalOriginAfrica = GetNaturalOrigins(src.NaturalOrigins, "africa");
                        dest.NaturalOriginNorthAndCentralAmerica = GetNaturalOrigins(src.NaturalOrigins, "northAndCentralAmerica");
                        dest.NaturalOriginSouthAmerica = GetNaturalOrigins(src.NaturalOrigins, "southAmerica");
                        dest.CurrentInternationalExistenceAreasEurope = GetCurrentInternationalExistenceAreas(src.CurrentInternationalExistenceAreas, "europe");
                        dest.CurrentInternationalExistenceAreasAsia = GetCurrentInternationalExistenceAreas(src.CurrentInternationalExistenceAreas, "asia");
                        dest.CurrentInternationalExistenceAreasOceania = GetCurrentInternationalExistenceAreas(src.CurrentInternationalExistenceAreas, "oceania");
                        dest.CurrentInternationalExistenceAreasAfrica = GetCurrentInternationalExistenceAreas(src.CurrentInternationalExistenceAreas, "africa");
                        dest.CurrentInternationalExistenceAreasNorthAndCentralAmerica = GetCurrentInternationalExistenceAreas(src.CurrentInternationalExistenceAreas, "northAndCentralAmerica");
                        dest.CurrentInternationalExistenceAreasSouthAmerica = GetCurrentInternationalExistenceAreas(src.CurrentInternationalExistenceAreas, "southAmerica");
                        dest.NaturalOriginMarine = GetNaturalOriginsMarine(src.NaturalOriginMarine);
                        dest.CurrentInternationalExistenceMarineAreas = GetCurrentInternationalExistenceMarineAreas(src.CurrentInternationalExistenceMarineAreas);
                        dest.ArrivedCountryFrom = GetArrivedCountryFrom(src.ArrivedCountryFrom);
                        dest.IndoorProductionMainCatAndCat = GetIndoorProductionMainCatAndCat(src.ImportPathways, "cat");
                        dest.IndoorProductionFreqNumTime = GetIndoorProductionMainCatAndCat(src.ImportPathways, "freqs");
                        dest.IntroNatureMainCatAndCat = GetIntroSpreadInfo(src.AssesmentVectors, "intro", "cat");
                        dest.IntroNatureFreqNumTime = GetIntroSpreadInfo(src.AssesmentVectors, "intro", "freqs");
                        dest.SpreadNatureMainCatAndCat = GetIntroSpreadInfo(src.AssesmentVectors, "spread", "cat");
                        dest.SpreadNatureFreqNumTime = GetIntroSpreadInfo(src.AssesmentVectors, "spread", "freqs");
                        dest.RegionalDistribution = GetRegionalDistribution(src.Fylkesforekomster);
                        dest.SpeciesStatus = GetSpeciesStatus(src.SpeciesStatus, src.SpeciesEstablishmentCategory);
                        dest.IntroductionsLow = introductionsLow(src.RiskAssessment);
                        dest.IntroductionsHigh = introductionsHigh(src.RiskAssessment);
                        dest.AOO10yrBest = AOO10yrBest(src.RiskAssessment);
                        dest.AOO10yrLow = AOO10yrLow(src.RiskAssessment); 
                        dest.AOO10yrHigh = AOO10yrHigh(src.RiskAssessment); 
                        dest.ImpactedNatureTypes = GetimpactedNatureTypes(src.ImpactedNatureTypes);
                        dest.CoastLineSections = GetCoastLineSections(src.CoastLineSections);
                        dest.CurrentBioClimateZones = GetCurrentBioClimateZones(src.CurrentBioClimateZones);
                        dest.ArcticBioClimateZones = GetArcticBioClimateZones(src.ArcticBioClimateZones);
                        dest.RiskAssessmentMedianLifetime = GetMedianLifetime(src.RiskAssessment);
                        dest.RiskAssessmentLifetimeUpperQ = GetLifetimeUpperQ(src.RiskAssessment);  
                        dest.RiskAssessmentLifetimeLowerQ = GetLifetimeLowerQ(src.RiskAssessment);
                        dest.RiskAssessmentCriteriaA = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "A");
                        dest.RiskAssessmentCriteriaB = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "B");
                        dest.RiskAssessmentCriteriaC = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "C");
                        dest.RiskAssessmentCriteriaD = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "D");
                        dest.RiskAssessmentCriteriaE = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "E");
                        dest.RiskAssessmentCriteriaF = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "F");
                        dest.RiskAssessmentCriteriaG = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "G");
                        dest.RiskAssessmentCriteriaH = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "H");
                        dest.RiskAssessmentCriteriaI = GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "I");
                        dest.RiskAssessmentChosenMethodBcrit = GetRiskAssessmentChosenMethodBcrit(src.RiskAssessment, src.AssessmentConclusion);
                        dest.RiskAssessmentExpansionSpeed = GetRiskAssessmentExpansionSpeed(src.RiskAssessment, "50", src.AssessmentConclusion);
                        dest.RiskAssessmentExpansionLowerQ = GetRiskAssessmentExpansionSpeed(src.RiskAssessment, "25", src.AssessmentConclusion);
                        dest.RiskAssessmentExpansionUpperQ = GetRiskAssessmentExpansionSpeed(src.RiskAssessment, "75", src.AssessmentConclusion);
                        dest.ImpactedRedlistEvaluatedSpecies = GetDEcritInformation(src.RiskAssessment.SpeciesSpeciesInteractions);
                        dest.ImpactedRedlistEvaluatedSpeciesEnsemble = GetDEcritInformationNaturetypes(src.RiskAssessment.SpeciesNaturetypeInteractions);
                        dest.IntrogressionRedlistedSpecies = GetHcritInformation(src.RiskAssessment.GeneticTransferDocumented);
                        
                        // overkjøre status for vurderinger som kom fra horizontscanning
                        dest.EvaluationStatus = GetProgress(src);
                    });


            });
            var mapper = new Mapper(mapperConfig);
            return mapper;
        }

        private static string GetHcritInformation(List<RiskAssessment.SpeciesSpeciesInteraction> genTrans)
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

        private static string GetDEcritInformationNaturetypes(List<RiskAssessment.SpeciesNaturetypeInteraction> speciesNatInt)
        {
            if (speciesNatInt == null || speciesNatInt.Count == 0)
            {
                return string.Empty;
            }
            var Redlistinfo = new List<string>();
            for (var i = 0; i < speciesNatInt.Count; ++i) 
            {
                string interact = speciesNatInt[i].NiNCode + "//" + speciesNatInt[i].KeyStoneSpecie 
                + "//" + speciesNatInt[i].Effect + "//" + speciesNatInt[i].Scale + "//" + speciesNatInt[i].InteractionType;
                Redlistinfo.Add(interact);
            }
            return string.Join("; ", Redlistinfo);
        }

        private static string GetDEcritInformation(List<RiskAssessment.SpeciesSpeciesInteraction> speciesSpeciesInteractions)
        {
            if (speciesSpeciesInteractions == null || speciesSpeciesInteractions.Count == 0)
            {
                return string.Empty;
            }
            var Redlistinfo = new List<string>();
            for (var i = 0; i < speciesSpeciesInteractions.Count; ++i) 
            {
                string interact = speciesSpeciesInteractions[i].ScientificName + "//" + speciesSpeciesInteractions[i].RedListCategory + "//" + speciesSpeciesInteractions[i].KeyStoneSpecie 
                + "//" + speciesSpeciesInteractions[i].Effect + "//" + speciesSpeciesInteractions[i].Scale + "//" + speciesSpeciesInteractions[i].InteractionType;
                Redlistinfo.Add(interact);
            }
            return string.Join("; ", Redlistinfo);

        }

        private static long? GetExpansionSpeedB2a(RiskAssessment ra) 
        {
            decimal result;
            if(ra.AOOfirstOccurenceLessThan10Years == "yes")
            { 
              result =  
              (ra.AOOyear2 == 0 || ra.AOOyear2 == null || ra.AOOyear1 == 0 || ra.AOOyear1 == null || (ra.AOOyear2 - ra.AOOyear1) < 10 || ra.AOO1 <= 0 || ra.AOO2 <= 0) ? 
                0
                :  Math.Truncate((decimal)(Math.Sqrt((double)(ra.AOOtotalBestInput/ra.AOOknownInput)) * 2000 * (Math.Sqrt(Math.Ceiling((double)(ra.AOO2 / 4))) - Math.Sqrt(Math.Ceiling((double)(ra.AOO1 / 4)))) / ((ra.AOOyear2 - ra.AOOyear1) * Math.Sqrt(Math.PI)))); //js: trunc(sqrt(r.AOOdarkfigureBest) * 2000 * (sqrt(ceil(r.AOO2 / 4)) - sqrt(ceil(r.AOO1 / 4))) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                //darkfigures is not saved. Use r.AOOtotalBest / r.AOOknown 
            }

            else result = (decimal)Math.Truncate(20 * (Math.Sqrt((double)ra.AOO50yrBestInput) - Math.Sqrt((double)ra.AOOtotalBestInput)) / Math.Sqrt(Math.PI));

            return (long?)result;
        }

        private static long? GetExpansionLowerQB2a(RiskAssessment ra) 
        {
            decimal result;
            if(ra.AOOfirstOccurenceLessThan10Years == "yes")
            { 
              result =  
              (ra.AOOyear2 == 0 || ra.AOOyear2 == null || ra.AOOyear1 == 0 || ra.AOOyear1 == null || (ra.AOOyear2 - ra.AOOyear1) < 10 || ra.AOO1 <= 0 || ra.AOO2 <= 0) ? 
                0
                :  Math.Truncate((decimal)(Math.Sqrt((double)(ra.AOOtotalLowInput/ra.AOOknownInput)) * 2000 * (Math.Sqrt(Math.Ceiling((double)(ra.AOO2 / 4))) - Math.Sqrt(Math.Ceiling((double)(ra.AOO1 / 4)))) / ((ra.AOOyear2 - ra.AOOyear1) * Math.Sqrt(Math.PI)))); //js: trunc(sqrt(r.AOOdarkfigureBest) * 2000 * (sqrt(ceil(r.AOO2 / 4)) - sqrt(ceil(r.AOO1 / 4))) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                //darkfigures is not saved. Use ra.AOOtotalLow / ra.AOOknown 
            }

            else result = (decimal)Math.Truncate(20 * (Math.Sqrt((double)ra.AOO50yrLowInput) - Math.Sqrt((double)ra.AOOtotalBestInput)) / Math.Sqrt(Math.PI));

            return (long?)result;
        }

        private static long? GetExpansionUpperQB2a(RiskAssessment ra) 
        {
            decimal result;
            if(ra.AOOfirstOccurenceLessThan10Years == "yes")
            { 
              result =  
              (ra.AOOyear2 == 0 || ra.AOOyear2 == null || ra.AOOyear1 == 0 || ra.AOOyear1 == null || (ra.AOOyear2 - ra.AOOyear1) < 10 || ra.AOO1 <= 0 || ra.AOO2 <= 0) ? 
                0
                :  Math.Truncate((decimal)(Math.Sqrt((double)(ra.AOOtotalHighInput/ra.AOOknownInput)) * 2000 * (Math.Sqrt(Math.Ceiling((double)(ra.AOO2 / 4))) - Math.Sqrt(Math.Ceiling((double)(ra.AOO1 / 4)))) / ((ra.AOOyear2 - ra.AOOyear1) * Math.Sqrt(Math.PI)))); //js: trunc(sqrt(r.AOOdarkfigureBest) * 2000 * (sqrt(ceil(r.AOO2 / 4)) - sqrt(ceil(r.AOO1 / 4))) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                //darkfigures is not saved. Use ra.AOOtotalHigh / ra.AOOknown 
            }

            else result = (decimal)Math.Truncate(20 * (Math.Sqrt((double)ra.AOO50yrHighInput) - Math.Sqrt((double)ra.AOOtotalBestInput)) / Math.Sqrt(Math.PI));

            return (long?)result;
        }
        private static long? GetRiskAssessmentExpansionSpeed(RiskAssessment ra, string quant, string assConc) 
        {
            long? exspeed;
            long? exspeedLow;
            long? exspeedHigh;
            if(ra.ChosenSpreadYearlyIncrease == "a") 
            {
                exspeed = ra.ExpansionSpeedInput; 
                exspeedLow = ra.ExpansionLowerQInput; 
                exspeedHigh = ra.ExpansionUpperQInput; 
            }

            else if(assConc == "AssessedSelfReproducing" && ra.ChosenSpreadYearlyIncrease == "b") 
            {
                exspeed = GetExpansionSpeedB2a(ra);
                exspeedLow = GetExpansionLowerQB2a(ra); 
                exspeedHigh = GetExpansionUpperQB2a(ra); 
            }

            else if(assConc == "AssessedDoorknocker" && ra.ChosenSpreadYearlyIncrease == "b") 
            {
                var localvarB = AOO10yrBest(ra);
                var localvarL = AOO10yrLow(ra);
                var localvarH = AOO10yrHigh(ra);
        
                exspeed = 
                    (localvarB == null) ? 0 :
                    (long?)Math.Truncate(200 * (Math.Sqrt((double)(localvarB/ 4)) - 1) / Math.Sqrt(Math.PI));
                
                exspeedLow = 
                    (localvarL == null)? 0 :
                    (long?)Math.Truncate(200 * (Math.Sqrt((double)(localvarL/ 4)) - 1) / Math.Sqrt(Math.PI));
                
                exspeedHigh = 
                    (localvarH == null)? 0 :
                    (long?)Math.Truncate(200 * (Math.Sqrt((double)(localvarH/ 4)) - 1) / Math.Sqrt(Math.PI));
            }
            else 
            
            {
                exspeed = 0;
                exspeedLow = 0;
                exspeedHigh = 0;
            }
            
            return  ( quant == "50")? roundToSignificantDecimals(exspeed) : //note that this will return rounded values for ExpansionSpeedInput (same goes for lower and higher)
                    ( quant == "25")? roundToSignificantDecimals(exspeedLow) : 
                    ( quant == "75")? roundToSignificantDecimals(exspeedHigh) :
                    0; 
        }

        private static string GetRiskAssessmentChosenMethodBcrit(RiskAssessment ra, string assConc)
        {
            string result = //using terms suggested by Hanno
            (ra.ChosenSpreadYearlyIncrease == "a") ? "modelling" : 
            (assConc == "AssessedDoorknocker" && ra.ChosenSpreadYearlyIncrease == "b") ? "introductionpressure":
            (assConc == "AssessedSelfReproducing" && ra.ChosenSpreadYearlyIncrease == "b" && ra.AOOfirstOccurenceLessThan10Years == "yes") ? "AOO":
            (assConc == "AssessedSelfReproducing" && ra.ChosenSpreadYearlyIncrease == "b" && ra.AOOfirstOccurenceLessThan10Years == "no") ? "AOO_periodlessthan10years":
            ""; //retun empty for species not assessed
            return result;
        }

        private static int? GetRiskAssessmentCritera(FA4 ass, List<RiskAssessment.Criterion> criteria, string critLetter)
        { //utvid denne til økologisk effekt også, samt vurder å legge til usikkerheten her 08.07.22.
           int? CritScore = 0;
            if (critLetter == "A")
            {
                if(GetProgress(ass) == "notStarted" || ass.RiskAssessment.ChosenSpreadMedanLifespan == "RedListCategoryLevel") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[0].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }

            if (critLetter == "B")
            {
                if(GetProgress(ass) == "notStarted" || GetRiskAssessmentChosenMethodBcrit(ass.RiskAssessment, ass.AssessmentConclusion) == "") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[1].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }

            if (critLetter == "C")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[2].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }
            if (critLetter == "D")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[3].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }
            if (critLetter == "E")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[4].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }
            if (critLetter == "F")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[5].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }
            if (critLetter == "G")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[6].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }
            if (critLetter == "H")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[7].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }
            if (critLetter == "I")
            {
                if(GetProgress(ass) == "notStarted") 
                {
                    CritScore = null;
                }
                else
                CritScore = criteria[8].Value + 1; //Add one to get score from 1 to 4 (not 0 to 3)
            }

            return CritScore;
        }

        private static string GetArcticBioClimateZones(List<FA4.BioClimateZonesArctic> arcticBioClimateZones)
        {
            var ZoneSections = new List<string>();
            
                for (var i = 0; i < arcticBioClimateZones.Count; ++i) 
                { 
                    if (arcticBioClimateZones[i].WeakOceanic.Equals(true) ||arcticBioClimateZones[i].TransferSection.Equals(true) || arcticBioClimateZones[i].WeakContinental.Equals(true) || arcticBioClimateZones[i].ClearContinental.Equals(true) )
                    {
                        string newcat = arcticBioClimateZones[i].ClimateZone + "-" + (arcticBioClimateZones[i].WeakOceanic.Equals(true)? "WeakOceanic//" : "") + ( arcticBioClimateZones[i].TransferSection.Equals(true)? "TransferSection//" : "") + (arcticBioClimateZones[i].WeakContinental.Equals(true)? "WeakContinental//" : "")
                        + (arcticBioClimateZones[i].ClearContinental.Equals(true)? "ClearContinental//" : "");
                        ZoneSections.Add(newcat);
                    }

                }
                return string.Join("; ", ZoneSections);
        }

        private static string GetCurrentBioClimateZones(List<FA4.BioClimateZones> currentBioClimateZones)
        {
            var ZoneSections = new List<string>();
            
                for (var i = 0; i < currentBioClimateZones.Count; ++i) 
                { 
                    if (currentBioClimateZones[i].StrongOceanic.Equals(true) || currentBioClimateZones[i].ClearOceanic.Equals(true) || currentBioClimateZones[i].WeakOceanic.Equals(true) || currentBioClimateZones[i].TransferSection.Equals(true) || currentBioClimateZones[i].WeakContinental.Equals(true))
                    {
                        string newcat = currentBioClimateZones[i].ClimateZone + "-" + (currentBioClimateZones[i].StrongOceanic.Equals(true)? "StrongOceanic//" : "") + ( currentBioClimateZones[i].ClearOceanic.Equals(true)? "ClearOceanic//" : "") + (currentBioClimateZones[i].WeakOceanic.Equals(true)? "WeakOceanic//" : "")
                        + (currentBioClimateZones[i].TransferSection.Equals(true)? "TransferSection//" : "")+ (currentBioClimateZones[i].WeakContinental.Equals(true)? "WeakContinental//" : "");
                        ZoneSections.Add(newcat);
                    }

                }
                return string.Join("; ", ZoneSections);
            
        }

        private static string GetCoastLineSections(List<FA4.CoastLineSection> coastLineSections)
        {
            var ZoneSections = new List<string>();
            
                for (var i = 0; i < coastLineSections.Count; ++i) 
                { 
                    if (coastLineSections[i].None.Equals(true) || coastLineSections[i].OpenCoastLine.Equals(true) || coastLineSections[i].Skagerrak.Equals(true))
                    {
                        string newcat = coastLineSections[i].ClimateZone + "-" + (coastLineSections[i].None.Equals(true)? "None//" : "") + (coastLineSections[i].OpenCoastLine.Equals(true)? "OpenCoastLine//" : "") + (coastLineSections[i].Skagerrak.Equals(true)? "Skagerrak//" : "");
                        ZoneSections.Add(newcat);
                    }

                }
                return string.Join("; ", ZoneSections);
            
        }

        private static Dictionary<string, string> tilstandsendringer = new Dictionary<string, string>()
        {
            {"ER", "Erosjonsutsatthet" },
            {"OM","Oksygenmangel"},
            {"SS","Sandstabilisering" },
            {"VM","Vannmetning"},
            {"1AE","Enkeltarts-sammensetning"},
            {"1AG","Artsgruppe-sammensetning"},
            {"1AR","Relativ del-artsgruppe-sammensetning"},
            {"7EU","Eutrofiering"},
            {"7RA","Rask suksesjon"},
            {"7SN","Naturlig bestandsreduksjon på tresatt areal"},
            {"7UB","Ubalanse mellom trofiske nivåer"},
            {"9TS", "Tresjiktstruktur"},
            {"other","Annen tilstandsendring"},
            {"F11", "F11"},
            {"F13", "F13"}
        };

        private static List<string> GetTilstandsendringer(Dictionary<string, string> table, List <string> statecode)
        {
            List <string> navn = new List<string>();
            for (var i = 0; i < statecode.Count; ++i)
            {
                navn.Add(table[statecode[i]]);
            }
            return navn;
        }

        private static string GetimpactedNatureTypes(List<FA4.ImpactedNatureType> impactedNatureTypes)
        {
            if (impactedNatureTypes == null || impactedNatureTypes.Count == 0)
            {
                return string.Empty;
            }
                //Interessert i: niNCode name timeHorizon colonizedArea affectedArea og stateChange - sistnevnte er en liste i seg selv, f.eks.: ["OM", "1AE", "1AG"]
                //ninCode//name//timeHorizon//
                var NatDat = new List<string>();
                
                for (var i = 0; i < impactedNatureTypes.Count; ++i) 
                { 
                    if(impactedNatureTypes[i].StateChange.Count > 0)
                    {
                        List <string> navn = GetTilstandsendringer(tilstandsendringer, impactedNatureTypes[i].StateChange);
                        string StateChange = string.Join("|", navn);

                        string newcats = impactedNatureTypes[i].NiNCode + "//" + impactedNatureTypes[i].Name + "//" + impactedNatureTypes[i].TimeHorizon + "//" + impactedNatureTypes[i].ColonizedArea + "//" + impactedNatureTypes[i].AffectedArea + "//" + StateChange;
                        NatDat.Add(newcats);

                    }
                    else
                    {
                        string newcat = impactedNatureTypes[i].NiNCode + "//" + impactedNatureTypes[i].Name + "//" + impactedNatureTypes[i].TimeHorizon + "//" + impactedNatureTypes[i].ColonizedArea + "//" + impactedNatureTypes[i].AffectedArea + "//" + "";
                        NatDat.Add(newcat);
                    }
                }

                return string.Join("; ", NatDat);
            
        }

        private static string GetSpeciesStatus(string speciesStatus, string speciesEstablishmentCategory)
        {
            if (speciesStatus != "C3")
            {
                return speciesStatus;
            }
            return speciesEstablishmentCategory;
        }

        private static string GetRegionalDistribution(List<Fylkesforekomst> fylkesforekomster)
        {
            if (fylkesforekomster == null || fylkesforekomster.Count == 0)
            {
                return string.Empty;
            }
            var fylkesliste = new List<string>();
            for (var i = 0; i < fylkesforekomster.Count; ++i)
            {
                if (fylkesforekomster[i].State0 == 0 && fylkesforekomster[i].State1 == 0 && fylkesforekomster[i].State3 == 0)
                {
                    break; 
                }
                // else
                // {
                string newreg = fylkesforekomster[i].Fylke + "//" + fylkesforekomster[i].State0 + "//" + fylkesforekomster[i].State1 + "//" + fylkesforekomster[i].State3;
                fylkesliste.Add(newreg);
                // }
            }
            return string.Join("; ", fylkesliste);
        }

        private static string GetIndoorProductionMainCatAndCat(List<Domain.MigrationPathway> importPathways, string col)
        {
            if (importPathways == null || importPathways.Count == 0)
            {
                return string.Empty;
            }
            if (col == "cat")
            {
                var MainCatCat = new List<string>();
                
                for (var i = 0; i < importPathways.Count; ++i) 
                { 
                    string newcat = importPathways[i].MainCategory + "//" + importPathways[i].Category;
                    MainCatCat.Add(newcat);
                }

                return string.Join("; ", MainCatCat);
            }
            if (col == "freqs")
            {
                var FreqNT = new List<string>();
                for (var i = 0; i < importPathways.Count; ++i) 
                { 
                    string newcat = importPathways[i].InfluenceFactor + "//" + importPathways[i].Magnitude + "//" + importPathways[i].TimeOfIncident;
                    FreqNT.Add(newcat);
                }

                return string.Join("; ", FreqNT);
            }
            
            return string.Empty;
        }
        
        private static string GetIntroSpreadInfo(List<Domain.MigrationPathway> assesmentVectors, string introspread, string col)
        {
            if (assesmentVectors == null || assesmentVectors.Count == 0)
            {
                return string.Empty;
            }

            if (introspread == "intro") 
            {
                var sourcelist = assesmentVectors.FindAll(vector => vector.IntroductionSpread == "introduction");
                if (col == "cat")
                {
                    var MainCatCat = new List<string>();
                
                    for (var i = 0; i < sourcelist.Count; ++i) 
                    { 
                   
                        string newcat = sourcelist[i].MainCategory + "//" + sourcelist[i].Category;
                        MainCatCat.Add(newcat);
                  
                    }

                    return string.Join("; ", MainCatCat);
                }
                if (col == "freqs")
                {
                    var FreqNT = new List<string>();
                    for (var i = 0; i < sourcelist.Count; ++i) 
                    { 
                        string newcat = sourcelist[i].InfluenceFactor + "//" + sourcelist[i].Magnitude + "//" + sourcelist[i].TimeOfIncident;
                        FreqNT.Add(newcat);
                    }

                    return string.Join("; ", FreqNT);
                }
            }
            if (introspread == "spread") 
            {
                var sourcelist = assesmentVectors.FindAll(vector => vector.IntroductionSpread == "spread");
                if (col == "cat")
                {
                    var MainCatCat = new List<string>();
                
                    for (var i = 0; i < sourcelist.Count; ++i) 
                    { 
                   
                        string newcat = sourcelist[i].MainCategory + "//" + sourcelist[i].Category;
                        MainCatCat.Add(newcat);
                  
                    }

                    return string.Join("; ", MainCatCat);
                }
                if (col == "freqs")
                {
                    var FreqNT = new List<string>();
                    for (var i = 0; i < sourcelist.Count; ++i) 
                    { 
                        string newcat = sourcelist[i].InfluenceFactor + "//" + sourcelist[i].Magnitude + "//" + sourcelist[i].TimeOfIncident;
                        FreqNT.Add(newcat);
                    }

                    return string.Join("; ", FreqNT);
                }
            }
            
        
            return string.Empty;
        }

        private static string GetNaturalOriginsMarine(List<string> naturalOriginMarine)
        {
            if (naturalOriginMarine == null || naturalOriginMarine.Count == 0)
            {
                return string.Empty;
            }

            return string.Join("; ", naturalOriginMarine);
        }

        private static string GetCurrentInternationalExistenceMarineAreas(List<string> currentInternationalExistenceMarineAreas)
        {
            if (currentInternationalExistenceMarineAreas == null || currentInternationalExistenceMarineAreas.Count == 0)
            {
                return string.Empty;
            }

            return string.Join("; ", currentInternationalExistenceMarineAreas);
        }

        private static string GetArrivedCountryFrom(List<string> arrivedCountryFrom)
        {
            if (arrivedCountryFrom == null || arrivedCountryFrom.Count == 0)
            {
                return string.Empty;
            }

            return string.Join("; ", arrivedCountryFrom);
        }

        private static string GetCurrentInternationalExistenceAreas(List<FA4.NaturalOrigin> currentInternationalExistenceAreas, string area)
        {
            if (currentInternationalExistenceAreas == null || currentInternationalExistenceAreas.Count == 0)
            {
                return string.Empty;
            }

            var zones = new List<string>();

            foreach (var origin in currentInternationalExistenceAreas)
            {
                if (CheckForArea(area, origin))
                {
                    zones.Add(origin.ClimateZone.Replace(";", "//"));
                }
            }

            return string.Join("; ", zones);
        }

        private static string GetNaturalOrigins(List<FA4.NaturalOrigin> naturalOrigins, string area)
        {
            if (naturalOrigins == null || naturalOrigins.Count == 0)
            {
                return string.Empty;
            }

            var zones = new List<string>();

            foreach (var origin in naturalOrigins)
            {
                if (CheckForArea(area, origin))
                {
                    zones.Add(origin.ClimateZone.Replace(";", "//"));
                }
            }

            return string.Join("; ", zones);

        }

        private static bool CheckForArea(string area, FA4.NaturalOrigin origin)
        {
            bool b;
            switch (area)
            {
                case "europe":
                    b = origin.Europe;
                    break;
                case "asia":
                    b = origin.Asia;
                    break;
                case "africa":
                    b = origin.Africa;
                    break;
                case "oceania":
                    b = origin.Oceania;
                    break;
                case "northAndCentralAmerica":
                    b = origin.NorthAndCentralAmerica;
                    break;
                case "southAmerica":
                    b = origin.SouthAmerica;
                    break;
                default:
                    b = false;
                    break;
            }

            return b;
        }

        private static Dictionary<int, int> introLowTable = new Dictionary<int, int>()
        {
            { 1, 1 },
            { 5, 2 },
            { 13, 3 },
            { 26, 4 },
            { 43, 5 },
            { 65, 6 },
            { 91, 7 },
            { 121, 8 },
            { 156, 9 },
            { 195, 10 }
        };

        private static Dictionary<int, int> introHighTable = new Dictionary<int, int>()
        {
            { 1, 1 },
            { 6, 2 },
            { 15, 3 },
            { 29, 4 },
            { 47, 5 },
            { 69, 6 },
            { 96, 7 },
            { 127, 8 },
            { 163, 9 },
            { 204, 10 }
        };

        private static int introductionNum(Dictionary<int, int> table, long? best)
        {
            var keys = table.Keys.Reverse();
            var i = 0;
            foreach (var key in keys)
            {
                if (best >= key)
                {
                    i = table[key];
                    break;
                }
            }
            return i;
        }

        private static long introductionsLow(RiskAssessment ra)
        {
            long num = introductionNum(introLowTable, ra.IntroductionsBest);
            return (long)(num == 0 ? 0 : ra.IntroductionsBest - num);
        }

        private static long introductionsHigh(RiskAssessment ra)
        {
            long num = introductionNum(introHighTable, ra.IntroductionsBest);
            return (long)(num == 0 ? 0 : ra.IntroductionsBest + num);
        }

        private static long? AOO10yr(long? occurrences1, long? introductions)
        {
            if (introductions.HasValue == false || occurrences1.HasValue == false)
            {
                return null;
            }
            var occ = occurrences1.Value;
            var intr = introductions.Value;
            long result = occ == 0 && intr == 0
                    ? 0
                    : occ == 0
                        ? (long)(4 * Math.Round(0.64 + 0.36 * intr, 0))
                        : (long)(4 * Math.Round(occ + Math.Pow(intr, ((double)occ + 9) / 10)));
            
            return result;
        }
        
        private static long? AOO10yrBest(RiskAssessment ra)
        {
            var result = AOO10yr(ra.Occurrences1Best, ra.IntroductionsBest);
            return result;
        }

        private static long? AOO10yrLow(RiskAssessment ra)
        {
            var result = AOO10yr(ra.Occurrences1Low, introductionsLow(ra));
            return result;
        }
        private static long? AOO10yrHigh(RiskAssessment ra)
        {
            var result = AOO10yr(ra.Occurrences1High, introductionsHigh(ra));
            return result;
        }

        private static int roundToSignificantDecimals(double? num) 
            {
                if (!num.HasValue) return 0;
                int result =
                    (num >= 10000000) ? (int)Math.Floor((double)(num / 1000000)) * 1000000 :
                    (num >= 1000000 ) ? (int)Math.Floor((double)(num / 100000))  * 100000  :
                    (num >= 100000  ) ? (int)Math.Floor((double)(num / 10000))   * 10000   :
                    (num >= 10000   ) ? (int)Math.Floor((double)(num / 1000))    * 1000    :
                    (num >= 1000    ) ? (int)Math.Floor((double)(num / 100))     * 100     :
                    (num >= 100     ) ? (int)Math.Floor((double)(num / 10))      * 10      :
                    (int)num.Value;
                return result;
             }
        private static int GetMedianLifetime(RiskAssessment ra) 
        {
            int result = (ra.ChosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" && ra.AcceptOrAdjustCritA == "accept") ? 
                ra.Criteria[0].Value == 0 ? 3
                : ra.Criteria[0].Value == 1 ? 25
                : ra.Criteria[0].Value == 2 ? 200
                : ra.Criteria[0].Value == 3 ? 2000
                : 0
            : roundToSignificantDecimals(ra.MedianLifetimeInput);
            return result;
        }
        private static int GetLifetimeLowerQ(RiskAssessment ra) 
        { 
            return roundToSignificantDecimals(ra.LifetimeLowerQInput);
        }
        private static int GetLifetimeUpperQ(RiskAssessment ra) 
        {
            return roundToSignificantDecimals(ra.LifetimeUpperQInput);
        }
        private static string GetProgress(FA4 ass)
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

        private static string GetDoorknockerType(FA4WithComments args) //Denne brukes vel ikke lengre?! 23.06.22
        {
            var ass = args;
            var ass2018 = ass.PreviousAssessments.FirstOrDefault(x => x.RevisionYear == 2018);
            if (ass2018 == null) return "New potential doorknocker";

            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "canNotEstablishWithin50years")
                return "Not established within 50 years";
            if (ass2018.MainCategory == "NotApplicable" && ass2018.MainSubCategory == "traditionalProductionSpecie")
                return "Traditional production species";
            if (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "noRiskAssessment")
                return "Not assessed doorknocker";
            return "Other NR 2018";
        }
    }

    public class CustomSpreadHistoryConverter : ITypeConverter<List<SpreadHistory>, string>
    {
        public string Convert(List<SpreadHistory> source, string destination, ResolutionContext context)
        {
            var thing = source;
            if (thing == null || thing.Count == 0)
            {
                return string.Empty;
            }

            var simpleList = thing.Select(history => $"{history.Id}").ToList();

            return string.Join(", ", simpleList);
        }
    }


    public class FA4HorizonScanExport
    {
        public int Id { get; set; }
        public string ExpertGroup { get; set; }
        public string DoorKnockerType { get; set; }
        
        public string EvaluatedScientificNameId { get; set; }

        
        public string EvaluatedScientificName { get; set; }

        public string EvaluatedVernacularName { get; set; }
        public string EvaluatedScientificNameAuthor { get; set; }

        public string HorizonEstablismentPotential { get; set; }
        public string HorizonEstablismentPotentialDescription { get; set; }
        public string HorizonEcologicalEffect { get; set; }
        public string HorizonEcologicalEffectDescription { get; set; }
        public string LastUpdatedBy { get; set; }

    }
   
    public class FA4Export
    {
        public int Id { get; set; }
        [Name("Ekspertkomite")]
        public string ExpertGroup { get; set; }
        [Name("Vurderingsomraade")]
        public string EvaluationContext { get; set; }        
        // public bool IsEvaluated { get; set; }  // ???
        //public bool IsDeleted { get; set; }
        [Name("Vurderinsstatus")]
        public string EvaluationStatus { get; set; }
        [Name("VitenskapeligNavneID")]
        public string EvaluatedScientificNameId { get; set; }
        //public Datasett Datasett { get; set; } = new Datasett();

        [Name("TaksonsomiskSti")]
        public string TaxonHierarcy { get; set; }
        //public string DoorKnockerType { get; set; }
        
        [Name("VitenskapeligNavn")]
        public string EvaluatedScientificName { get; set; }
        [Name("Autor")]
        public string EvaluatedScientificNameAuthor { get; set; }
        [Name("TaksonomiskRang")]
        public string EvaluatedScientificNameRank { get; set; }

        [Name("NorskNavn")]
        public string EvaluatedVernacularName { get; set; }
        [Name("SistEndret")]
        public DateTime LastUpdatedAt { get; set; }
        [Name("SistEndretAv")]
        public string LastUpdatedBy { get; set; }
        

        //public int TaxonId { get; set; }

        // public string Citation { get; set; }
        [Name("Fremmedartsstatus")]
        public string AlienSpeciesCategory { get; set; }
        [Name("FremmedartsstatusKommentar")]
        public string IsAlien { get; set; } // new in 2021
        //public List<string> ReasonForChangeOfCategory { get; set; } = new List<string>();

        // public DateTime LockedForEditAt { get; set; }
        // public string LockedForEditBy { get; set; }
        [Name("HorisontskanningEtableringspotensial")]
        public string HorizonEstablismentPotential { get; set; }
        [Name("HorisontskanningOkologiskEffekt")]
        public string HorizonEcologicalEffect { get; set; }
        
        #region Artens status

        // public string Connected { get; set; }

        [Name("Vurderes på høyere/laver taksonomisk nivå, beskrivelse")]
        public string ConnectedToHigherLowerTaxonDescription { get; set; } = "";
        [Name("Vurderes sammen med et annet takson")]
        public bool? ConnectedToAnother { get; set; }
        [Name("Vurderes sammen med et annet takson, beskrivelse")]
        public string ConnectedToAnotherTaxonDescription { get; set; } = "";
        [Name("Bruksart")]
        public bool? ProductionSpecies { get; set; } = false;
        [Name("Etableringsklasse")]
        public string SpeciesStatus { get; set; }
        [Name("Usikkerhet etableringsklasse, beskrivelse")]
        public string AlienSpecieUncertainDescription { get; set; } // lagt til: 22.12.2016
        [Name("Etablert per 1800")]
        public bool? AlienSpecieUncertainIfEstablishedBefore1800 { get; set; } // lagt til: 19.10.2016 - renamed 15.11.2016
        [Name("Usikkerhet etableringstidspunkt, beskrivelse")]
        public string UncertainityEstablishmentTimeDescription { get; set; } = "";
        [Name("Første obs innendørs")]
        public int? RiskAssessmentYearFirstIndoors { get; set; }
        [Name("Usikkerhet Første obs innendørs")]
        public bool RiskAssessmentYearFirstIndoorsInsecure { get; set; }
        [Name("Første obs reprod innendørs")]
        public int? RiskAssessmentYearFirstReproductionIndoors { get; set; }
        [Name("Usikkerhet Første obs reprod innendørs")]
        public bool RiskAssessmentYearFirstReproductionIndoorsInsecure { get; set; }
        [Name("Første obs i produksjonsareal")]
        public int? RiskAssessmentYearFirstProductionOutdoors { get; set; }
        [Name("Usikkerhet Første obs i produksjonsareal")]
        public bool RiskAssessmentYearFirstProductionOutdoorsInsecure { get; set; }
        [Name("Første obs reprod produksjonsareal")]
        public int? RiskAssessmentYearFirstReproductionOutdoors { get; set; }
        [Name("Usikkerhet Første obs reprod produksjonsareal")]
        public bool RiskAssessmentYearFirstReproductionOutdoorsInsecure { get; set; }
        [Name("Første obs etablering produsjonsareal")]
        public int? RiskAssessmentYearFirstEstablishmentProductionArea { get; set; }
        [Name("Usikkerhet Første obs etablering produsjonsareal")]
        public bool RiskAssessmentYearFirstEstablishmentProductionAreaInsecure { get; set; }
        [Name("Første obs norsk natur")]
        public int? RiskAssessmentYearFirstNature { get; set; }
        [Name("Usikkerhet Første obs norsk natur")]
        public bool RiskAssessmentYearFirstNatureInsecure { get; set; }
        [Name("Første obs reprod norsk natur")]
        public int? RiskAssessmentYearFirstReproductionNature { get; set; }
        [Name("Usikkerhet Første obs reprod norsk natur")]
        public bool RiskAssessmentYearFirstReproductionNatureInsecure { get; set; }
        [Name("Første obs etablering norsk natur")]
        public int? RiskAssessmentYearFirstEstablishedNature { get; set; }
        [Name("UsikkerhetForsteObsEtableringNorskNatur")]
        public bool RiskAssessmentYearFirstEstablishedNatureInsecure { get; set; }
        
        #endregion Artens status
        
        #region Artsinformasjon
        [Name("Limnisk")]
        public bool Limnic { get; set; } // lagt til 26.9.2016
        [Name("Terrestrisk")]
        public bool Terrestrial { get; set; } // lagt til 26.9.2016
        [Name("Marint")]
        public bool Marine { get; set; } // lagt til 26.9.2016

        //terrestrisk og limnisk utbredelse
        [Name("NaturligUtbredelseTerrestriskOgLimniskEuropa")]
        public string NaturalOriginEurope { get; set; }
        [Name("NaturligUtbredelseTerrestriskOgLimniskAsia")]
        public string NaturalOriginAsia { get; set; }
        [Name("NaturligUtbredelseTerrestriskOgLimniskAfrika")]
        public string NaturalOriginAfrica { get; set; }
        [Name("NaturligUtbredelseTerrestriskOgLimniskOseania")]
        public string NaturalOriginOceania { get; set; }
        [Name("NaturligUtbredelseTerrestriskOgLimniskNordSentralAmerika")]
        public string NaturalOriginNorthAndCentralAmerica { get; set; }
        [Name("NaturligUtbredelseTerrestriskOgLimniskSorAmerika")]
        public string NaturalOriginSouthAmerica { get; set; }
        [Name("NaturligUtbredelseTerrestriskOgLimniskBeskrivelse")]
        public string NaturalOriginUnknownDocumentation { get; set; }
        [Name("NaavaerendeUtbredelseTerrestriskOgLimniskEuropa")]
        public string CurrentInternationalExistenceAreasEurope {get; set; }
        [Name("NaavaerendeUtbredelseTerrestriskOgLimniskAsia")]
        public string CurrentInternationalExistenceAreasAsia { get; set; }
        [Name("NaavaerendeUtbredelseTerrestriskOgLimniskOseania")]
        public string CurrentInternationalExistenceAreasOceania { get; set; }
        [Name("NaavaerendeUtbredelseTerrestriskOgLimniskAfrika")]
        public string CurrentInternationalExistenceAreasAfrica { get; set; }
        [Name("NaavaerendeUtbredelseTerrestriskOgLimniskNordSentralAmerika")]
        public string CurrentInternationalExistenceAreasNorthAndCentralAmerica { get; set; }
        [Name("NaavaerendeUtbredelseTerrestriskOgLimniskSorAmerika")]
        public string CurrentInternationalExistenceAreasSouthAmerica { get; set; }
        
        [Name("NaavaerendeUtbredelseTerrestriskOgLimniskBeskrivelse")]
        public string CurrentInternationalExistenceAreasUnknownDocumentation { get; set; }
        

        //marin utbredelse
        [Name("NaturligUtbredelseMarint")]
        public string NaturalOriginMarine { get; set; } 
        [Name("NaturligUtbredelseMarintBeskrivelse")]
        public string NaturalOriginMarineDetails { get; set; } // lagt til 21.04.2017
        [Name("NaavaerendeUtbredelseMarint")]
        public string CurrentInternationalExistenceMarineAreas { get; set; } 
        [Name("NaavaerendeUtbredelseMarintBeskrivelse")]
        public string CurrentInternationalExistenceMarineAreasDetails { get; set; } // lagt til 21.04.2017

        [Name("KomTilFastlands-NorgeFra")]
        public string ArrivedCountryFrom { get; set; } // fab: string Arived_Norway_From_Code
         [Name("KomTilFastlands-NorgeFraBeskrivelse")]
        public string ArrivedCountryFromDetails { get; set; } = ""; // fab: Natural_Origin 'NaturalOrigin'  - lagt til 14.11.2016
        [Name("UkjønnetFormering")]
        public bool? ReproductionAsexual { get; set; } // fab: Reproduction_Asexual
        [Name("KjønnetFormering")]
        public bool? ReproductionSexual { get; set; } // fab: Reproduction_Sexual
        [Name("Generasjonstid")]
        public double? ReproductionGenerationTime { get; set; } // fab: Reproduction_Geteration_Time
        #endregion Artsinformasjon

        #region Spredningsveier
        [Name("SpresArtenUtelukkendeDirekteTilNorskNatur?")]
        public string IndoorProduktion { get; set; }
        //Til innendørsareal
        [Name("TilInnendorsProdArealHovedkatOgKat")]
        public string IndoorProductionMainCatAndCat {get; set;} //added 14.06.2022
        [Name("TilInnendorsProdArealHyppAntTid")]
        public string IndoorProductionFreqNumTime {get; set;} //added 15.06.2022
        //til naturen - dette skal kun være de med "introductionSpread": "introduction"
        [Name("IntroduksjonNaturHovedkatOgKat")]
        public string IntroNatureMainCatAndCat {get; set;} //added 15.06.2022
        [Name("IntroduksjonNaturHyppAntTid")]
        public string IntroNatureFreqNumTime {get; set;} //added 15.06.2022
        //videre i naturen - dette skal kun være de med "introductionSpread": "spread"
        [Name("VidereSpredningNaturHovedkatOgKat")]
        public string SpreadNatureMainCatAndCat {get; set;} //added 15.06.2022
        [Name("VidereSpredningNaturHyppAntTid")]
        public string SpreadNatureFreqNumTime {get; set;} //added 15.06.2022
        #endregion Spredningsveier

        #region Bakgrunnsdata for risikovurdering
            #region Utbredelse
            [Name("AndelAvKjentForekomstarealISterktEndraNatur(%)")]
            public double? RiskAssessmentSpreadHistoryDomesticAreaInStronglyChangedNatureTypes { get; set; }
            //Forekomstareal selvstendig reproduserende
            [Name("PeriodeAOOfraaar(t0)")]
            public long? RiskAssessmentAOOendyear1 { get; set; } // basert på periode: f.o.m. år (t0) - (NB!! //todo: denne egenskaper bør skifte navn i neste FAB)
            [Name("PeriodeAOOtilaar")]
            public long? RiskAssessmentAOOendyear2 { get; set; } // basert på periode: t.o.m. år  - (NB!! //todo: denne egenskaper bør skifte navn i neste FAB)
            [Name("AOOKjent")]
            public Int64? RiskAssessmentAOOknownInput { get; set; }
            [Name("AOOAntattLavtAnslag")]
            public Int64? RiskAssessmentAOOtotalLowInput { get; set; }
            [Name("AOOAntattBesteAnslag")]
            public Int64? RiskAssessmentAOOtotalBestInput { get; set; }
            [Name("AOOAntattHoytAnslag")]
            public Int64? RiskAssessmentAOOtotalHighInput { get; set; }
            [Name("AOO50aarLavtAnslag")]
            public Int64? RiskAssessmentAOO50yrLowInput { get; set; } // lavt anslag på totalt forekomstareal om 50 år 
            [Name("AOO50aarBesteAnslag")]
            public Int64? RiskAssessmentAOO50yrBestInput { get; set; } // beste anslag på totalt forekomstareal om 50 år 
            [Name("AOO50aarHoytAnslag")]
            public Int64? RiskAssessmentAOO50yrHighInput { get; set; }
            // [Name("AOOchangeBest")]
            // public double? RiskAssessmentAOOchangeBest { get; set; } - 07.06.22 - trenger ikke disse i eksporten da de kun brukes på baksiden for A-kriteriet
            // [Name("AOOchangeLow")]
            // public double? RiskAssessmentAOOchangeLow { get; set; } - 07.06.22 - trenger ikke disse i eksporten da de kun brukes på baksiden for A-kriteriet
            // [Name("AOOchangeHigh")]
            // public double? RiskAssessmentAOOchangeHigh { get; set; } - 07.06.22 - trenger ikke disse i eksporten da de kun brukes på baksiden for A-kriteriet
            // [Name("AOOMorketallLavtAnslag")]
            // public float? RiskAssessmentAOOdarkfigureLow { get; set; } // lavt anslag på forekomstarealets mørketall 
            // [Name("AOOMorketallBesteAnslag")]
            // public float? RiskAssessmentAOOdarkfigureBest { get; set; } // beste anslag på forekomstarealets mørketall 
            // [Name("AOOMorketallHoytAnslag")]
            // public float? RiskAssessmentAOOdarkfigureHigh { get; set; } // høyt anslag på forekomstarealets mørketall 

            //Forekomstareal dørstokkarter
            [Name("AntForekomsterFraEnIntroduksjonLavtAnslag")]
            public long? RiskAssessmentOccurrences1Low { get; set; }	// lavt anslag på antall forekomster fra 1 introduksjon 
            [Name("AntForekomsterFraEnIntroduksjonBesteAnslag")]
            public long? RiskAssessmentOccurrences1Best { get; set; }	// beste anslag på antall forekomster fra 1 introduksjon 
            [Name("AntForekomsterFraEnIntroduksjonHoytAnslag")]
            public long? RiskAssessmentOccurrences1High { get; set; }	// høyt anslag på antall forekomster fra 1 introduksjon 
            [Name("AntIntroduksjonerIla10aarLavtAnslag")]
            public long? IntroductionsLow { get; set; }	    // lavt anslag på antall introduksjoner i løpet av 10 år 
            [Name("AntIntroduksjonerIla10aarBesteAnslag")]
            public long? RiskAssessmentIntroductionsBest { get; set; }	// beste anslag på antall introduksjoner i løpet av 10 år 
            [Name("AntIntroduksjonerIla10aarHoytAnslag")]
            public long? IntroductionsHigh { get; set; }	// høyt anslag på antall introduksjoner i løpet av 10 år 
            [Name("AOO10aarEtterForsteIntroduksjonLavtAnslag")]
            public long? AOO10yrLow { get; set; } // lavt anslag på totalt forekomstareal om 10 år
             [Name("AOO10aarEtterForsteIntroduksjonBesteAnslag")]
            public long? AOO10yrBest { get; set; } // beste anslag på totalt forekomstareal om 10 år 
            [Name("AOO10aarEtterForsteIntroduksjonHoytAnslag")]
            public long? AOO10yrHigh { get; set; } // høyt anslag på totalt forekomstareal om 10 år 

            //Regionvis utbredelse "fylkesforekomst"
            [Name("RegionvisUtbredelse")]
            public string RegionalDistribution {get; set;}
            [Name("RegionvisUtbredelseKommentar")]
            public string CurrentPresenceComment { get; set; }
            #endregion Utbredelse
            
            #region Naturtyper
            [Name("EffektPaaNaturtyper")] 
            public string ImpactedNatureTypes {get; set;}
            [Name("EffektPaaTruetSjeldenNaturtypeBeskrivelse")]
            public string RiskAssessmentThreatenedNatureTypesAffectedDomesticDescription { get; set; }   //Skrivefelt F-kriteriet
            [Name("EffektOvrigeNaturtyperBeskrivelse")] 
            public string RiskAssessmentCommonNatureTypesAffectedDomesticDescription { get; set; }       //skrivefelt G-krit
            [Name("RegionalNaturvariasjonFastlandsNorge")] 
            public string CurrentBioClimateZones {get; set;}
            [Name("KystvannssonerOgSeksjoner")]
            public string CoastLineSections {get; set;}
            [Name("RegionalNaturvariasjonSvalbard")]
            public string ArcticBioClimateZones {get; set;}
            //Vurder her å ta med "habitats" (livsmedium). Må i tilfelle lages en funksjon da livsmedium er ei liste. 
            //public List<Habitat> Habitats { get; set; } = new List<Habitat>(); - (fra 2018?!)
            #endregion Naturtyper
        #endregion Bakgrunnsdata for risikovurdering
        #region RiskAssessment 
            #region Invasjonspotensialet
            //////A-kriteriet///////
            [Name("A-kriterietMetode")]
            public string RiskAssessmentChosenSpreadMedanLifespan { get; set; } //= "";  // ametod (radio)
            [Name("A-ForenkletGodtaBeregnetSkaar")]
            public string RiskAssessmentAcceptOrAdjustCritA { get; set; } //= "accept";  // ametod submetod (radio)
            [Name("A-ForenkletBegrunnelseForJustering")]
            public string RiskAssessmentReasonForAdjustmentCritA { get; set; }// = ""; // added 06.01.2022
            [Name("A-NumeriskEstimeringNaavaerendeBestandsstorrelse")]
            public long? RiskAssessmentPopulationSize { get; set; } // bestandens nåværende størrelse (individtall)
            [Name("A-NumeriskEstimeringVekstrate")]
            public double? RiskAssessmentGrowthRate { get; set; } // bestandens multiplikative vekstrate 
            [Name("A-NumeriskEstimeringMiljovarians")]
            public double? RiskAssessmentEnvVariance { get; set; } // miljøvarians 
            [Name("A-NumeriskEstimeringDemografiskVarians")]
            public double? RiskAssessmentDemVariance { get; set; } // demografisk varians 
            [Name("A-NumeriskEstimeringBaereevne")]
            public long? RiskAssessmentCarryingCapacity { get; set; } // bestandens bæreevne (individtall) 
            [Name("A-NumeriskEstimeringTerskelForKvasiutdoing")]
            public long? RiskAssessmentExtinctionThreshold { get; set; } // kvasiutdøingsterskel (individtall) 
            [Name("A-PVA-AnalyseBeskrivelse")]
            public string RiskAssessmentSpreadPVAAnalysis { get; set; } 
            [Name("A-NumeriskEstimeringEllerLevedyktighetMedianLevetidBrukerinput")]
            public double? RiskAssessmentMedianLifetimeInput { get; set; } // artens mediane levetid i Norge i år (brukerinput)
            [Name("A-KriterietMedianLevetidAvrundet")]
            public long RiskAssessmentMedianLifetime { get; set; } // artens mediane levetid i Norge i år (beregnet/avrundet) 
            [Name("A-LevedyktighetsanalyseNedreKvartilBrukerinput")]
            public long? RiskAssessmentLifetimeLowerQInput { get; set; } // nedre kvartil for artens levetid i Norge i år 
            [Name("A-LevedyktighetsanalyseNedreKvartilAvrundet")]
            public long RiskAssessmentLifetimeLowerQ { get; set; } // nedre kvartil for artens levetid i Norge i år  
            [Name("A-LevedyktighetsanalyseOvreKvartilBrukerinput")]
            public long? RiskAssessmentLifetimeUpperQInput { get; set; } // øvre kvartil for artens levetid i Norge i år 
            [Name("A-LevedyktighetsanalyseOvreKvartilAvrundet")]
            public long RiskAssessmentLifetimeUpperQ  { get; set; } // øvre kvartil for artens levetid i Norge i år 
            [Name("A-Skaar")]
            public int? RiskAssessmentCriteriaA  { get; set; } 
            // [Name("A-skaarLavtanslag")]
            // public int RiskAssessmentCriteriaALow { get; set; } - skal vi ha med slike, eller er det nok med høyt og lavt anslag i selve variabelen?
            //////B-kriteriet///////
            [Name("B-kriterietMetode")]
            public string RiskAssessmentChosenMethodBcrit { get; set; }   
            [Name("AOO(t1)")]
            public long? RiskAssessmentAOOyear1 { get; set; } // fra-årstallet for det første forekomstarealet
            [Name("AOO(t2)")]
            public long? RiskAssessmentAOOyear2 { get; set; } // fra-årstallet for det andre forekomstarealet 
            [Name("AOOEkspansjonsperiodeStart")]
            public long? RiskAssessmentAOO1 { get; set; } // forekomstarealet i år 1 (inkl. korrigering for tiltak)
            [Name("AOOEkspansjonsperiodeSlutt")]
            public long? RiskAssessmentAOO2 { get; set; } // forekomstarealet i år 2  (inkl. korrigering for tiltak)
            [Name("B-EkspansjonshastighetNedreKvartil")]
            public long? RiskAssessmentExpansionLowerQ { get; set; } // nedre kvartil for ekspansjonshastighet i meter per år 
            [Name("B-GjennomsnittligEkspansjonshastighet(mperaar)")]
            public long? RiskAssessmentExpansionSpeed { get; set; }  // ekspansjonshastighet i meter per år 
            [Name("B-EkspansjonshastighetOvreKvartil")]
            public long? RiskAssessmentExpansionUpperQ { get; set; } // øvre kvartil for ekspansjonshastighet i meter per år 
            [Name("B-Skaar")]
            public int? RiskAssessmentCriteriaB  { get; set; }
            //////C-kriteriet//////
            [Name("C-Skaar")]
            public int? RiskAssessmentCriteriaC { get; set; }
            #endregion Invasjonspotensialet
            #region Økologisk effekt
            /////D og E-kriteriet////
            [Name("EffekterPaaRodlistevurderteArter")]
            public string ImpactedRedlistEvaluatedSpecies {get; set;} //påvirkning på enkeltarter
            [Name("EffekterPaaRodlistevurderteArterINaturtypen")]
            public string ImpactedRedlistEvaluatedSpeciesEnsemble {get; set;} //påvirkning på artene i en naturtype
            [Name("EffekterPaaRodlistevurderteArterINaturtypenBeskrivelse")]
            public string RiskAssessmentSpeciesSpeciesInteractionsSupplementaryInformation { get; set; } //Sjekk om denne blir med rett - 10.08.22!
            [Name("D-Skaar")]
            public int? RiskAssessmentCriteriaD { get; set; }
            [Name("D-SkaarBeskrivelse")]
            public string RiskAssessmentDCritInsecurity {get; set;}
            [Name("E-Skaar")]
            public int? RiskAssessmentCriteriaE { get; set; }
            [Name("E-SkaarBeskrivelse")]
            public string RiskAssessmentECritInsecurity {get; set;}
            [Name("F-Skaar")]
            public int? RiskAssessmentCriteriaF { get; set; }
            [Name("G-Skaar")]
            public int? RiskAssessmentCriteriaG { get; set; }
            [Name("OverføringAvGenetiskMateriale")]
            public string IntrogressionRedlistedSpecies {get; set;}
            [Name("H-Skaar")]
            public int? RiskAssessmentCriteriaH { get; set; }
            [Name("H-SkaarBeskrivelse")]
            public string RiskAssessmentHCritInsecurity {get; set;}
            [Name("I-Skaar")]
            public int? RiskAssessmentCriteriaI { get; set; }
            [Name("I-SkaarBeskrivelse")]
            public string RiskAssessmentICritInsecurity {get; set;}
            #endregion Økologisk effekt
        [Name("Kategori2023")]
        public string Category { get; set; } //We can use this, but need to make sure NR vs NK will be correct!
        public string Criteria { get; set; }

        public string Category2018 { get; set; } //Use this
        public string Criteria2018 { get; set; }
            
        // public string ProductionSpeciesDescription { get; set; } = "";

        // public int RiskAssessmentRiskLevel { get; set; } = -1;
        // public string RiskAssessmentDecisiveCriteria { get; set; }
        //public string RiskAssessmentRiskLevelCode { get; set; }
        // public string RiskAssessmentRiskLevelText { get; set; }

        // public int RiskAssessmentEcoEffectLevel { get; set; }
        public int[] RiskAssessmentEcoEffectUncertaintyLevels { get; set; }

        // public int RiskAssessmentInvationPotentialLevel { get; set; }
        public int[] RiskAssessmentInvationPotentialUncertaintyLevels { get; set; }


        // public string RiskAssessmentYearFirstDomesticObservation { get; set; }

        //public List<Criterion> Criteria { get; set; }

        // ---------- invasjonspotensial -------------
        public bool? RiskAssessmentQuantitativeDataForDomesticSpreadExsists { get; set; }  // Quantitative_Domestic_Spread_Data_Exsists
        public bool? RiskAssessmentQuantitativeDataForForeignSpreadExsists { get; set; }   // Quantitative_Foreign_Spread_Data_Exsists
        public string RiskAssessmentQuantitativeDataComment { get; set; }         // Quantitative_Spread_Data_Comment

        // -- forventet levetid for norsk populasjon
        public Int64? RiskAssessmentEstimatedSpeciesCount { get; set; }   // Estimated_Species_Count
        public string RiskAssessmentEstimatedSpeciesCountMethod { get; set; }   // Estimated_Species_Count_Estimation_Method
        public string RiskAssessmentEstimatedSpeciesCountAssumption { get; set; }   // Estimated_Species_Count_Assumption
        // public bool? RiskAssessmentEstimatedSpeciesLongevityMoreThan1000Years { get; set; }   // Estimated_Species_Longevity_More_than_1000_years
        public string RiskAssessmentEstimatedSpeciesLongevity { get; set; }  // Estimated_Species_Longevity
        public string RiskAssessmentEstimatedSpeciesLongevityMethod { get; set; }  // Estimated_Species_Longevity_Method



        public int? RiskAssessmentAdefaultBest { get; set; }
        public int? RiskAssessmentAdefaultLow { get; set; }
        public int? RiskAssessmentAdefaultHigh { get; set; }


        public int? RiskAssessmentApossibleLow { get; set; }
        public int? RiskAssessmentApossibleHigh { get; set; }




        // -------- disse (forekomstareal i dag) er erstattet:  
        //todo: *sjekk konvertering fra FAB3 før sletting av utkommentert kode*
        //public Int64? CurrentExistenceArea { get; set; }
        //public Int64? CurrentExistenceAreaLowCalculated { get; set; }
        //public string CurrentExistenceAreaLowMultiplier { get; set; }
        //public Int64? CurrentExistenceAreaCalculated { get; set; }
        //public string CurrentExistenceAreaMultiplier { get; set; }
        //public string CurrentExistenceAreaHighMultiplier { get; set; }
        //public Int64? CurrentExistenceAreaHighCalculated { get; set; }
        //*******************************************************************


        //*************** Forekomstareal om 50år ************************************
    
        // -------- disse (forekomstareal om 50år) er erstattet:  
        //todo: *sjekk konvertering fra FAB3 før sletting av utkommentert kode*
        //public Int64? PotentialExistenceAreaLowQuartile { get; set; }
        //public Int64? PotentialExistenceArea { get; set; }
        //public Int64? PotentialExistenceAreaHighQuartile { get; set; }
        //public string PotentialPresenceComment { get; set; }
        //*******************************************************************

        // end nye


        //public Int64? SpeciesCount { get; set; } // fab: Species_Count  // ikke i bruk som egen attributt (ligger i spredningshistorikk item) i 2012


        // public double? RiskAssessmentSpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow { get; set; }
        // public double? RiskAssessmentSpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest { get; set; }
        // public double? RiskAssessmentSpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh { get; set; }



        //        public bool hasPVA { get; set; } // = !string.IsNullOrWhiteSpace(detailsinfo.Spread_PVA_Analysis);
        #region (A) Populasjonens mediane levetid
        // todo: find unused properties in this region
        // ikke i bruk i 2012 applikasjon (?)
        //public string SpreadingDescription { get; set; } //Spreading_Description

       

        public bool RiskAssessmentActiveSpreadPVAAnalysisSpeciesLongevity { get; set; } // added 27.09.2016

       //Spread_PVA_Analysis
        // [Name("Forventet levetid")]
        // public bool RiskAssessmentActiveSpreadPVAAnalysisEstimatedSpeciesLongevity { get; set; } // lagt til 27.09.2016
        // public string RiskAssessmentSpreadPVAAnalysisEstimatedSpeciesLongevity { get; set; }  //Spread_PVA_Analysis_Estimated_Species_Longevity
        // public string RiskAssessmentSpreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile { get; set; }  // lagt til 07.09.2016
        // public string RiskAssessmentSpreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile { get; set; }  // lagt til 07.09.2016 

        public string RiskAssessmentFilesDescription { get; set; } //Spread_PVA_Analysis


        //todo: is this section in use???
        //Rødliste info
        // public bool RiskAssessmentActiveRedListCategoryLevel { get; set; } // lagt til 27.09.2016
        // public string RiskAssessmentRedListUsedCriteria { get; set; }  // lagt til 07.09.2016
        // public string RiskAssessmentRedListDataDescription { get; set; }  // lagt til 07.09.2016
        // public string RiskAssessmentRedListCategory { get; set; }  // lagt til 07.09.2016
        // public string RiskAssessmentRedListSubCategory { get; set; }  // lagt til 07.09.2016
                                                        // -----------------------------------------------------------------------------------------



        // ****************************  (A2) Numerisk estimering  ****************************
        
        // -------- disse ((A2) Numerisk estimering) er erstattet:  
        //todo: *sjekk konvertering fra FAB3 før sletting av utkommentert kode*
        //////public bool ActiveSpreadRscriptSpeciesCount { get; set; } // lagt til 27.09.2016

        //[Name("Bestandstørrelse")]
        //public int? SpreadRscriptSpeciesCount { get; set; }  //Spread_Rscript_Species_Count
        //[Name("Vekstrate")]
        ////public double SpreadRscriptPopulationGrowth { get; set; } //Spread_Rscript_Population_Growth
        //public string SpreadRscriptPopulationGrowth { get; set; } // type change 01.11.2017
        ///// <summary>
        ///// R-script input - environmant (stocastic) variance - Description
        ///// </summary>
        //[Name("Miljø varians")]
        //public string SpreadRscriptEnvironmantVariance { get; set; } //Spread_Rscript_Environmant_Variance

        ///// <summary>
        ///// R-script input - demographic variance - Description
        ///// </summary>
        //[Name("Demografisk varians")]
        //public string SpreadRscriptDemographicVariance { get; set; }  //Spread_Rscript_Demographic_Variance
        ///// <summary>
        ///// R-script input - Sustainability K - Description
        ///// </summary>
        //[Name("Bæreevne K")]
        //public string SpreadRscriptSustainabilityK { get; set; } //Spread_Rscript_Sustainability_K
        //public bool ActiveSpreadRscriptEstimatedSpeciesLongevity { get; set; } // lagt til 08.11.2016
        ///// <summary>
        ///// Estimated species longevity  Conclusion
        ///// </summary>
        //public string SpreadRscriptEstimatedSpeciesLongevity { get; set; } //Spread_Rscript_Sustainability_K

        ///// <summary>
        ///// R-script input - Quasi-extinction Threshold - Description
        ///// </summary>
        //[Name("Terskel for kvasiutdøing")]
        //public string SpreadRscriptQuasiExtinctionThreshold { get; set; }  //Spread_Rscript_Quasi_Extinction_Threshold
        // ************************************************************************************
        #endregion


        // public string RiskAssessmentAmethod { get; set; } // metode som ble brukt for å beregne A-kriteriet 
        //public int RiskAssessmentAscore { get; set; } // skår for A-kriteriet - returnerer kun 0. Erstattet med RiskassessmentCriteriaA 08.07.22
        // public int RiskAssessmentAlow { get; set; } // nedre skår for A-kriteriet (inkludert usikkerhet) 
        // public int RiskAssessmentAhigh { get; set; } // øvre skår for A-kriteriet (inkludert usikkerhet) 
        // // public string RiskAssessmentBmethod { get; set; } // metode som ble brukt for å beregne B-kriteriet 
        // public int RiskAssessmentBscore { get; set; } // skår for B-kriteriet 
        // public int RiskAssessmentBlow { get; set; } // nedre skår for B-kriteriet (inkludert usikkerhet) 
        // public int RiskAssessmentBhigh { get; set; } // øvre skår for B-kriteriet (inkludert usikkerhet) 

        public string RiskAssessmentBCritMCount { get; set; } = "";
        public string RiskAssessmentBCritExact { get; set; } = "false";
        public string RiskAssessmentBCritP { get; set; }
        public string RiskAssessmentBCritNewObs { get; set; } = "True";


        // public int RiskAssessmentStartYear { get; set; } // startår for B-kriteriet / utbredelse

        // public int RiskAssessmentEndYear { get; set; } // sluttår for B-kriteriet / utbredelse


        //-----------------------------------------------------------------------
        // todo: slett dette (etter hvert)
        // erstattet disse i 61 - 16.8.21 - dette er kun for referanse. 
        //PopulationSize ACritSpeciesCount
        //GrowthRate ACritPopGrowth
        //EnvVariance ACritEnvirVariance
        //DemVariance ACritDemoVariance
        //CarryingCapacity ACritSustainability
        //ExtinctionThreshold ACritExtThreshold
        //MedianLifetime ACritMedian
        //ExpansionSpeed BCritExpansion
        //ExpansionLowerQ BCritLower
        //ExpansionUpperQ BCritHigher
        //-----------------------------------------------------------------------






        #region (B) Ekspansjonshastighet

       
        public bool RiskAssessmentActiveSpreadYearlyIncreaseObservations { get; set; } //lagt til 29.09.2016


        // -------- disse (forekomstareal - dørstokkarter) er erstattet:  
        //todo: *sjekk konvertering fra FAB3 før sletting av utkommentert kode*
        //public string SpreadYearlyIncreaseObservations { get; set; } //lagt til 29.09.2016
        //public string SpreadYearlyIncreaseObservationsLowerQuartile { get; set; } //lagt til 29.09.2016
        //public string SpreadYearlyIncreaseObservationsUpperQuartile { get; set; } //lagt til 29.09.2016
        // ****************************************************************************************


        // ********************** ((B1) ekspansjonshastighet  ****************************
        
        // -------- disse ((B1) ekspansjonshastighet) er erstattet:  
        //todo: *sjekk konvertering fra FAB3 før sletting av utkommentert kode*
        //public bool ActiveSpreadYearlyIncreaseOccurrenceArea { get; set; } //lagt til 29.09.2016
        //public string SpreadYearlyIncreaseOccurrenceArea { get; set; } //lagt til 29.09.2016
        //public string SpreadYearlyIncreaseOccurrenceAreaLowerQuartile { get; set; } //lagt til 29.09.2016
        //public string SpreadYearlyIncreaseOccurrenceAreaUpperQuartile { get; set; } //lagt til 29.09.2016
        //
        // sjekk ogsa disse:
        // // SpreadYearlyIncreaseCalculatedExpansionSpeed? SpreadYearlyIncreaseObservations?
        // *********************************************************************************


        // public bool RiskAssessmentActiveSpreadYearlyLiteratureData { get; set; } //lagt til 29.09.2016
        // public string RiskAssessmentSpreadYearlyLiteratureDataExpansionSpeed { get; set; } // lagt til 14.10.2016
        // public string RiskAssessmentSpreadYearlyLiteratureDataUncertainty { get; set; } //lagt til 29.09.2016
        // public string RiskAssessmentSpreadYearlyLiteratureDataNumberOfIntroductionSources { get; set; } //lagt til 29.09.2016  
        // public string RiskAssessmentSpreadYearlyLiteratureData { get; set; } //lagt til 29.09.2016 
        // //public string SpreadYearlyLiteratureDataAssumptions { get; set; } //lagt til 29.09.2016 // fjernet 03.11.2016
        // public string RiskAssessmentSpreadYearlyLiteratureDataSource { get; set; } //lagt til 29.09.2016


        // public bool RiskAssessmentActiveSpreadYearlyIncreaseCalculatedExpansionSpeed { get; set; } //lagt til 29.09.2016 // changed from ActiveSpreadYearlyIncreaseEstimate 09.11.2016
        // public string RiskAssessmentSpreadYearlyIncreaseEstimate { get; set; } //lagt til 29.09.2016
        // public string RiskAssessmentSpreadYearlyIncreaseEstimateDescription { get; set; } //lagt til 29.09.2016
        // public string RiskAssessmentSpreadYearlyIncreaseCalculatedExpansionSpeed { get; set; } //lagt til 14.10.2016




        #endregion (B) Ekspansjonshastighet



        #region unused ???????
        // -- spredningshastighet

        public double? RiskAssessmentSpreadYearlyIncrease { get; set; }   // Spread_Yearly_Increase
        public string RiskAssessmentSpreadYearlyIncreaseMethod { get; set; }  // Spread_Yearly_Increase_EstimationMethod
        #endregion unused ???????




        // #region unused ???????
        // [Name("Beskrivelse")]
        // public string RiskAssessmentSpreadManualEstimate { get; set; } // fab: Spread_Manual_Estimate
        // public string RiskAssessmentSpreadManualEstimateSpeciesLongevity { get; set; } // fab: Spread_Manual_Estimate_Species_Longevity
        // // public bool? RiskAssessmentSpreadManualEstimateSpeciesLongevityIsMoreThan1000years { get; set; } // fab: Spread_Manual_Estimate_Species_Longevity_More_than_1000_years



        // -- fortetningsrate
        // [Name("Fortetningsrate, konklusjon")]
        // public string RiskAssessmentIncreasingDensity { get; set; }  // Increasing_Density_Conclusion
        // [Name("Grunnlag for fortetningsrate")]
        // public string RiskAssessmentIncreasingDensityMethod { get; set; }  // Increasing_Density_Method
        // #endregion





        // #region unused keys fortetningsrate - PVA - manual estimates
        // [Name("Resultat fra script")]
        // public string RiskAssessmentIncreasingDensityPVAAnalysis { get; set; } //Increasing_Density_PVA_Analysis
        // [Name("Verdi")]
        // public string RiskAssessmentIncreasingDensityPercentualComputation { get; set; } //Increasing_Density_Percentual_Computation
        // [Name("Tidsperiode")]
        // public string RiskAssessmentIncreasingDensityPercentualComputationPeriod { get; set; } //Increasing_Density_Percentual_Computation_Period
        // [Name("Anslag")]
        // public string RiskAssessmentIncreasingDensityManualEstimate { get; set; } //Increasing_Density_Manual_Estimate
        // [Name("Begrunnelse")]
        // public string RiskAssessmentIncreasingDensityManualEstimateDescription { get; set; } //Increasing_Density_Manual_Estimate_Description
        // #endregion

        // -- naturtype forventet kolonisert
        // [Name("Beskrivelse")]
        // public string RiskAssessmentNaturetypeExpectedColonized { get; set; }  // Spread_Naturetype_Expected_Colonization_Description


        //public List<SpeciesSpeciesInteraction> SpeciesSpeciesInteractions { get; set; } = new List<SpeciesSpeciesInteraction>(); // lagt til 11.10.2016
        //public List<SpeciesNaturetypeInteraction> SpeciesNaturetypeInteractions { get; set; } = new List<SpeciesNaturetypeInteraction>(); // lagt til 22.12.2016
        

        //// - H kriteriet
        //public List<SpeciesSpeciesInteraction> GeneticTransferDocumented { get; set; } = new List<SpeciesSpeciesInteraction>(); // lagt til 12.09.2016
        //public List<HostParasiteInteraction> HostParasiteInformations { get; set; } = new List<HostParasiteInteraction>(); // lagt til 09.09.2016

        public List<string> RiskAssessmentThreatenedNatureTypes { get; set; } = new List<string>(); // 09.01.2017  // Threatened_Nature_Types
        // public string Threatened_Nature_Types_Affected_Documentation  { get; set; }             // ************ intern informasjon *************
        // public bool? RiskAssessmentThreatenedNatureTypesDomesticObserved { get; set; }  // Threatened_Nature_Types_Affected_Domestic_Observed
        // public bool? RiskAssessmentThreatenedNatureTypesDomesticDocumented { get; set; }  // Threatened_Nature_Types_Affected_Domestic_Documented
        // public bool? RiskAssessmentThreatenedNatureTypesForeignDocumented { get; set; }  // Threatened_Nature_Types_Affected_Foreign_Documented
        
        // public string RiskAssessmentThreatenedNatureTypesAffectedAbroadDescription { get; set; } = "";   //  lagt til 15.11.2016

        // -- (D) potensiale for å endre én eller flere øvrige naturtyper
        public List<string> RiskAssessmentCommonNatureTypes { get; set; } = new List<string>(); // 09.01.2017  // Common_Nature_Types
        //public string Common_Nature_Types_Affected_Documentation { get; set; }               //intern informasjon

        public List<string> RiskAssessmentNaturetype2018 { get; set; } = new List<string>();
        public List<string> RiskAssessmentNaturetypeNIN2 { get; set; } = new List<string>();

        public List<string> RiskAssessmentBackgroundC { get; set; } = new List<string>();

        public List<string> RiskAssessmentBackgroundF { get; set; } = new List<string>();

        public List<string> RiskAssessmentBackgroundG { get; set; } = new List<string>();
        public List<string> RiskAssessmentHovedøkosystem { get; set; } = new List<string>();


        // public string RiskAssessmentNatureAffectedAbroadF { get; set; }

        // public string RiskAssessmentNatureAffectedAbroadG { get; set; }

        // public bool? RiskAssessmentCommonNatureTypesDomesticObserved { get; set; }  // Common_Nature_Types_Affected_Domestic_Observed
        // public bool? RiskAssessmentCommonNatureTypesDomesticDocumented { get; set; }  // Common_Nature_Types_Affected_Domestic_Documented
        // public bool? RiskAssessmentCommonNatureTypesForeignDocumented { get; set; }  // Common_Nature_Types_Affected_Foreign_Documented
        // public string RiskAssessmentCommonNatureTypesAffectedAbroadDescription { get; set; } = "";        // lagt til 15.11.2016

        // -- (E) kan overføre genetisk materiale til stedegne arter
        // public string RiskAssessmentGeneticTransferDomesticDescription { get; set; }        //Genetic_Transfer_Domestic_Description intern informasjon
        // public bool? RiskAssessmentGeneticTransferDomesticObserved { get; set; }  // Genetic_Transfer_Domestic_Observed
        // public bool? RiskAssessmentGeneticTransferDomesticDocumented { get; set; }  // Genetic_Transfer_Domestic_Documented
        // public bool? RiskAssessmentGeneticTransferForeignDocumented { get; set; }  // Genetic_Transfer_Foreign_Documented

        // -- (F) Kan overføre bakterier, parasitter eller virus til stedegne arter
        // public string RiskAssessmentVectorBiologicalDiseaseSpreadingDomesticDescription { get; set; }    //Vector_Biological_Disease_Spreading_Domestic_Description intern informasjon
        // public bool? RiskAssessmentBiologicalDiseaseSpreadingDomesticObserved { get; set; }  // Vector_Biological_Disease_Spreading_Domestic_Observed
        // public bool? RiskAssessmentBiologicalDiseaseSpreadingDomesticDocumented { get; set; }  // Vector_Biological_Disease_Spreading_Domestic_Documented
        // public bool? RiskAssessmentBiologicalDiseaseSpreadingForeignDocumented { get; set; }

        // (5.3) Geografisk Variasjon
        public List<string> RiskAssessmentGeographicalVariation { get; set; } = new List<string>(); // lagt til 23.09.2016
        public string RiskAssessmentGeographicalVariationDocumentation { get; set; } // lagt til 23.09.2016

        public string RiskAssessmentPossibleLowerCategory { get; set; }

        // (5.4) Klimaeffekter
        public string RiskAssessmentClimateEffectsInvationpotential { get; set; } // lagt til 23.09.2016
        public string RiskAssessmentClimateEffectsEcoEffect { get; set; } // lagt til 23.09.2016
        public string RiskAssessmentClimateEffectsDocumentation { get; set; } // lagt til 23.09.2016

        // (5.5) Kriteriedokumentasjon
        public string RiskAssessmentCriteriaDocumentation { get; set; }
        public string RiskAssessmentCriteriaDocumentationSpeciesStatus { get; set; }
        public string RiskAssessmentCriteriaDocumentationDomesticSpread { get; set; }
        public string RiskAssessmentCriteriaDocumentationMigrationPathways { get; set; }
        public string RiskAssessmentCriteriaDocumentationInvationPotential { get; set; }
        public string RiskAssessmentCriteriaDocumentationEcoEffect { get; set; }

        #endregion



        // (3.1) Artens status{
        public string AlienSpeciesCategory2012 { get; set; } // added 10.01.2017
        // public string DoorKnockerDescription { get; set; } // fab: Door_Knocker_Description
        // public string NotReproductiveDescription2012 { get; set; } // fab: Not_Reproductive_Description 
        // public string NotReproductiveFutureDescription2012 { get; set; } // fab: Not_Reproductive_Future_Description
        // public string AssesmentNotApplicableDescription { get; set; } // fab: Assesment_Not_Applicable_Description

        // public bool? IsAlienSpecies { get; set; }

        
        // public bool? IsRegionallyAlien { get; set; } //remove because AlienSpeciesCategory has this info


        // public string ConnectedTaxon1 { get; set; } = "";

        // public string ConnectedTaxon2 { get; set; } = "";


        // public string ChangedFromAlien { get; set; }

        // public string ChangedAssessment { get; set; }

        // public bool AlienSpecieUncertainAntropochor { get; set; } // lagt til: 19.10.2016

        // public bool SkalVurderes { get; set; }

        //public string EtableringsmulighetINorge { get; set; } // lagt til 22.08.2016 //fjernet 25.08.2016
        // public string DoorKnockerCategory { get; set; } // lagt til 25.08.2016 // fjernet 14.12.2016 // lagt til 21.12.2016
        // public string RegionallyAlienCategory { get; set; } // lagt til 25.08.2016
        // public string NotApplicableCategory { get; set; } // lagt til 25.08.2016
        //public bool LongDistanceEffect { get; set; } // lagt til 22.08.2016 // fjernet 29.08.2016
        //public bool IndoorObserved { get; set; } // lagt til 22.08.2016 // fjernet 30.08.2016
        //public bool IndoorEstablished { get; set; } // lagt til 22.08.2016 // fjernet 30.08.2016
        //public bool OutdoorObserved { get; set; } // lagt til 22.08.2016 // fjernet 30.08.2016
        //public bool OutdoorEstablished { get; set; } // lagt til 22.08.2016 // fjernet 30.08.2016
        //public bool NorwegianNatureObserved { get; set; } // lagt til 22.08.2016 // fjernet 30.08.2016
        //public bool NorwegianNatureEstablished { get; set; } // lagt til 22.08.2016 // fjernet 30.08.2016

        //public class TimeAndPlace
        //{
        //    public string Place { get; set; }
        //    public string Time { get; set; }
        //}
        //public class ObservedAndEstablished
        //{
        //    public TimeAndPlace ObservedInCountry { get; set; } = new TimeAndPlace();
        //    public TimeAndPlace FertileSpecimenObserved { get; set; } = new TimeAndPlace();
        //    public TimeAndPlace Established { get; set; } = new TimeAndPlace();
        //    public TimeAndPlace Population { get; set; } = new TimeAndPlace();
        //    public string SpecimenCount { get; set; } // lagt til 26.09.2016
        //}
        //public class ObservedAndEstablishedInCountry
        //{
        //    public ObservedAndEstablished Indoor { get; set; } = new ObservedAndEstablished();
        //    public ObservedAndEstablished ProductionArea { get; set; } = new ObservedAndEstablished();
        //    public ObservedAndEstablished NorwegianNature { get; set; } = new ObservedAndEstablished();
        //}

        // todo: pakke ut denne flatt
        //public ObservedAndEstablishedInCountry ObservedAndEstablishedStatusInCountry { get; set; } = new ObservedAndEstablishedInCountry(); // lagt til 30.08.2016 //

        // todo: fylkesforekomster...Akkurat ja.

        // (3.2) Artsegenskaper
    
        //public string LimnicTerrestrialMarine { get; set; } // lagt til 2.9.2016 // fjernet 26.09.2016
        
        // public bool BrackishWater { get; set; } // lagt til 26.9.2017 (for sfab)

        // public string FirstDomesticObservation { get; set; } // fab: First_Domestic_Observation
        // public string FirstDomesticObservationLocation { get; set; } // fab: First_Domestic_Observation_Location
        // public string FirstDomesticEstablishmentObserved { get; set; } // fab: First_Domestic_Observed_Establishment
        // public string FirstDomesticEstablishmentObservedLocation { get; set; } // fab: First_Domestic_Observed_Establishment_Location




        //public List<NaturalOrigin> NaturalOrigins { get; set; } = new List<NaturalOrigin>(); // lagt til 09.01.2017
        
        //public List<NaturalOrigin> CurrentInternationalExistenceAreas { get; set; } = new List<NaturalOrigin>(); // lagt til 09.01.2017

        //public NaturalOrigin createDefaultNaturalOrigin(string climateZone, string climateZoneSubType)
        //{
        //    return new NaturalOrigin()
        //    {
        //        ClimateZone = climateZone,
        //        ClimateZoneSubtype = climateZoneSubType,
        //    };
        //}
        //public List<NaturalOrigin> createDefaultNaturalOrigins()
        //{
        //    return new List<NaturalOrigin> {
        //        createDefaultNaturalOrigin("polart","inkl alpint"),
        //        createDefaultNaturalOrigin("temperert","boreal"),
        //        createDefaultNaturalOrigin("temperert","nemoral"),
        //        createDefaultNaturalOrigin("temperert","tørt"),
        //        createDefaultNaturalOrigin("subtropisk","middelhavsklima"),
        //        createDefaultNaturalOrigin("subtropisk","fuktig"),
        //        createDefaultNaturalOrigin("subtropisk","tørt"),
        //        createDefaultNaturalOrigin("subtropisk","høydeklima"),
        //        createDefaultNaturalOrigin("subtropisk","kappregionen"),
        //        createDefaultNaturalOrigin("tropisk","")
        //    };
        //}


        // public bool SurvivalBelow5c { get; set; } // lagt til 27.09.2016

        public List<string> IntroductionCourse { get; set; } // fab: List<int> Introduction_Course  //Årsak til tilstedeværelse

        // public bool? DomesticRiskEvaluationExists { get; set; } // fab: Domestic_RiskEvaluation_Exists
        // public bool? DomesticRiskEvaluationExists2007 { get; set; } // lagt til 26.09.2016
        // public bool? ForeignRiskEvaluationExists { get; set; } // fab: Foreign_RiskEvaluation_Exists_Exists
        // public string ForeignRiskEvaluationComment { get; set; } // fab: Foreign_RiskEvaluation_Comment

        // public string Regeneration { get; set; } // fab: Regeneration
        // public int? RegenerationYears { get; set; } // fab: Regeneration_Years
        // public string Reproduction { get; set; } // fab: Reproduction
        //public string ReproductiveCapability { get; set; } // fab: Int64? Reproductive_Capability // removed 17.01.2017
        // public bool? SimilarDemographicComparison { get; set; } // fab: Similar_Demographic_Comparison



        //Ikke-vurderte effekter  - Har vi disse fra 2012?
        // public string HealthEffects { get; set; } // lagt til 31.08.2016
        // public string EconomicEffects { get; set; } // lagt til 31.08.2016
        // //public string EcosystemServiceEffects { get; set; } // lagt til 31.08.2016 // fjernet 16.09.2016
        // public List<string> EcosystemServiceEffectsBasicLifeProcesses { get; set; } = new List<string>(); // lagt til 02.09.2016
        // public List<string> EcosystemServiceEffectsProvisioningServices { get; set; } = new List<string>(); // lagt til 02.09.2016
        // public List<string> EcosystemServiceEffectsRegulatingServices { get; set; } = new List<string>(); // lagt til 02.09.2016
        // public List<string> EcosystemServiceEffectsHumanSpiritualServices { get; set; } = new List<string>(); // :-) // lagt til 02.09.2016
        // public string PositiveEcologicalEffects { get; set; } // lagt til 31.08.2016
        // public string EffectsOnPopulationOfOrigin { get; set; } // lagt til 31.08.2016

        // OsA, He, Fi
        // public string RegionalPresenceKnown { get; set; } //Er disse døde? - ja, dette er valget fra 2018 - kommentert ut 15.06.22
        // public string RegionalPresenceAssumed { get; set; }
        // public string RegionalPresencePotential { get; set; }
        // // slutt artsegenskaper


        // (3.5) Spredningshistorikk
        //public List<SpreadHistory> SpreadHistory { get; set; } = new List<SpreadHistory>();
        public string SpreadHistory { get; set; } = "";

        //[Name("Fremtidig spredningsprognose i Norge, inkl. potensielt utbredelsesområde, antatte kritiske parametre for arten, og forventede endringer i disse:")] // 
        // public string SpreadHistoryDomesticDocumentation { get; set; } // fab: SpreadHistoryDomesticDocumentation
        //[Name("Detaljinformasjon for Naturtyper:")] // 
        // public string SpreadHistoryForeignDocumentation { get; set; } // fab: SpreadHistoryForeignDocumentation

        //public bool? FutureDistributionChangeExpected { get; set; } // fab: Future_Distribution_Change_Expected // ikke i bruk i 2012
        // public string FutureDistributionChangeExpectedDescription { get; set; } // fab: Future_Distribution_Change_Expected_Description
        // public string FutureDistributionCriticalParameters { get; set; } // fab: Future_Distribution_Critical_Parameters

        // public Int64? PotentialAreaDistribution { get; set; } // fab: Potential_Area_Distribution -  ikke i bruk?
        // public string PotentialAreaDistributionInTheFuture { get; set; } // fab: Potential_Area_Distribution_Future_Future @steinho - ikke i bruk?



        // public Int64? CurrentIndividualCount { get; set; }
        // public Int64? CurrentIndividualCountLowCalculated { get; set; }
        // public string CurrentIndividualCountLowMultiplier { get; set; }
        // public Int64? CurrentIndividualCountCalculated { get; set; }
        // public string CurrentIndividualCountMultiplier { get; set; }
        // public string CurrentIndividualCountHighMultiplier { get; set; }
        // public Int64? CurrentIndividualCountHighCalculated { get; set; }

        //public Int64? CurrentSpreadArea { get; set; } //Utkommentert 16.06.22 - bruker ikke EOO i grunn
        //public Int64? CurrentSpreadAreaLowMultiplier { get; set; }
        //public Int64? CurrentSpreadAreaHighMultiplier { get; set; }
        //public Int64? CurrentSpreadAreaMultiplier { get; set; }
        // public Int64? CurrentSpreadAreaLowCalculated { get; set; } //Can't find that this is in use in 2023
        // public Int64? CurrentSpreadAreaHighCalculated { get; set; } //Can't find that this is in use in 2023
        // public Int64? CurrentSpreadAreaCalculated { get; set; } //Can't find that this is in use in 2023


        public string SpreadAreaInChangedNature { get; set; }



        // (4) Naturtyper


        //public string SpeciesNatureTypesDetails { get; set; } // fab: SpeciesNatureTypesDetails // removed 03.11.2016

        // public bool UsesLivingSpeciesAsHabitat { get; set; }
        // public string UsesLivingSpeciesAsHabitatScientificName { get; set; }

        // (5) Risikovurdering
        //public class RegionalRiskAssessment
        //{
        //    public string Name { get; set; }
        //    public RiskAssessment RiskAssessment { get; set; }
        //}

        // todo: den store risikovurdering
        //public RiskAssessment RiskAssessment { get; set; } = new RiskAssessment();
        //public List<RegionalRiskAssessment> RegionalRiskAssessments { get; set; } = new List<RegionalRiskAssessment>();



        //public List<SimpleReference> References { get; set; } = new List<SimpleReference>();
        // comments
        // [Name("DatoForSisteKommentar")]
        // public string NewestCommentDate { get; set; }

        [Name("AntallBehandledeKommentarer")]
        public int CommentClosed { get; set; }

        [Name("AntallÅpneKommentarer")]
        public int CommentOpen { get; set; }
        //public int CommentNew { get; set; }

        [Name("VentendeTaksonomiskeEndringer")]
        public int TaxonChange { get; set; }
    }
}
