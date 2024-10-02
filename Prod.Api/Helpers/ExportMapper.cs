using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using CsvHelper.Configuration.Attributes;
using Prod.Domain;
using RiskAssessment = Prod.Domain.RiskAssessment;
using SpreadHistory = Prod.Domain.SpreadHistory;

namespace Prod.Api.Helpers
{
    /// <summary>
    /// Automappers for mapping assessment to export formats used in fronend for full assessment and horizonscanning
    /// </summary>
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
                // cfg.CreateMap<List<FA4.Habitat> , string>().ConvertUsing<CustomHabitatsConverter>();
                cfg.CreateMap<FA4WithComments, FA4Export>()
                    //.ForMember(x => x.DoorKnockerType, opt => opt.MapFrom(src => GetDoorknockerType(src)))
                    .ForMember(dest => dest.RiskAssessmentAOOknownInput, opt => opt.PreCondition(src => src.AssessmentConclusion != "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentAOOtotalLowInput, opt => opt.PreCondition(src => src.AssessmentConclusion != "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentAOOtotalBestInput, opt => opt.PreCondition(src => src.AssessmentConclusion != "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentAOOtotalHighInput, opt => opt.PreCondition(src => src.AssessmentConclusion != "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentAOO50yrLowInput, opt => opt.PreCondition(src => src.AssessmentConclusion != "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentAOO50yrBestInput, opt => opt.PreCondition(src => src.AssessmentConclusion != "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentAOO50yrHighInput, opt => opt.PreCondition(src => src.AssessmentConclusion != "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentIntroductionsBest, opt => opt.PreCondition(src => src.AssessmentConclusion == "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentOccurrences1Low, opt => opt.PreCondition(src => src.AssessmentConclusion == "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentOccurrences1Best, opt => opt.PreCondition(src => src.AssessmentConclusion == "AssessedDoorknocker"))
                    .ForMember(dest => dest.RiskAssessmentOccurrences1High, opt => opt.PreCondition(src => src.AssessmentConclusion == "AssessedDoorknocker"))
                    .ForMember(dest => dest.ProductionSpecies, opt => opt.PreCondition(src => src.AlienSpeciesCategory != "NotAlienSpecie"))
                    .ForMember(dest => dest.SpeciesStatus, opt => 
                    {
                        opt.PreCondition(src => src.AlienSpeciesCategory is not "NotAlienSpecie" or "MisIdentified");
                        opt.MapFrom(src => src.SpeciesStatus != "C3" ? src.SpeciesStatus : src.SpeciesEstablishmentCategory);
                    })
                    .ForMember(dest => dest.AlienSpeciesCategory2018, opt => 
                    {
                        opt.PreCondition(src => src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018) is not null);
                        opt.MapFrom(src => src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018).MainCategory == "NotApplicable" ? src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018).MainSubCategory : src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018).MainCategory);
                    })
                    .ForMember(dest => dest.AssessmentId2018, opt => 
                    {
                        opt.PreCondition(src => src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018) is not null);
                        opt.MapFrom(src => src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018).AssessmentId);
                    })
                    .ForMember(dest => dest.ConnectedTaxa, opt => 
                    {
                        opt.PreCondition(src => src.ConnectedTaxons is not null);
                        opt.MapFrom(src => string.Join(", ", src.ConnectedTaxons.Select(x => x.ScientificName).ToArray() )); //src.ConnectedTaxons.Length == 1 ? src.ConnectedTaxons[0].ScientificName : 
                    })
                    .ForMember(dest => dest.GeographicalVariationCauses, opt => 
                    {
                        opt.PreCondition(src => src.RiskAssessment.PossibleLowerCategory is "yes" && src.Category is not "NR");
                        opt.MapFrom(src => src.RiskAssessment.GeographicalVariation.Count > 0 ? string.Join(",", src.RiskAssessment.GeographicalVariation) : string.Empty);
                    })
                    .ForMember(dest => dest.GeographicalVariationDocumentation, opt => 
                    {
                        opt.PreCondition(src => src.RiskAssessment.PossibleLowerCategory is "yes" && src.Category is not "NR");
                        opt.MapFrom(src => src.RiskAssessment.GeographicalVariationDocumentation);
                    })
                    .ForMember(dest => dest.InvasionScore, opt => opt.MapFrom(src => ExportMapperHelper.GetScores(src.Category, src.Criteria, "inv")))
                    .ForMember(dest => dest.EcoEffectScore, opt => opt.MapFrom(src => ExportMapperHelper.GetScores(src.Category, src.Criteria, "eco")))
                    .ForMember(dest => dest.EcoEffectScoreHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetScoreUncertainties(src.Category, src.Criteria, src.RiskAssessment.Criteria, "yAxis", "high")))
                    .ForMember(dest => dest.EcoEffectScoreLow, opt => opt.MapFrom(src => ExportMapperHelper.GetScoreUncertainties(src.Category, src.Criteria, src.RiskAssessment.Criteria, "yAxis", "low")))
                    .ForMember(dest => dest.InvasionScoreLow, opt => opt.MapFrom(src => ExportMapperHelper.GetScoreUncertainties(src.Category, src.Criteria, src.RiskAssessment.Criteria, "xAxis", "low")))
                    .ForMember(dest => dest.InvasionScoreHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetScoreUncertainties(src.Category, src.Criteria, src.RiskAssessment.Criteria, "xAxis", "high")))
                    
                    .ForMember(dest => dest.InvationScore2018, opt => 
                    {
                        opt.PreCondition(src => src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018) is not null);
                        opt.MapFrom(src => src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018).MainCategory == "NotApplicable" ? null : ExportMapperHelper.GetScores("Assessed", src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018).DecisiveCriteria, "inv"));
                    })
                    .ForMember(dest => dest.EcoEffectScore2018, opt => 
                    {
                        opt.PreCondition(src => src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018) is not null);
                        opt.MapFrom(src => src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018).MainCategory == "NotApplicable" ? null : ExportMapperHelper.GetScores("Assessed", src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018).DecisiveCriteria, "eco"));
                    })
                    .ForMember(dest => dest.ImpactedRedlistEvaluatedSpecies, opt => opt.MapFrom(src => ExportMapperHelper.GetDEcritInformation(src.RiskAssessment.SpeciesSpeciesInteractions)))
                    .ForMember(dest => dest.ImpactedRedlistEvaluatedSpeciesEnsemble, opt => opt.MapFrom(src => ExportMapperHelper.GetDEcritInformationNaturetypes(src.RiskAssessment.SpeciesNaturetypeInteractions)))
                    .ForMember(dest => dest.IntrogressionRedlistedSpecies, opt => opt.MapFrom(src => ExportMapperHelper.GetHcritInformation(src.RiskAssessment.GeneticTransferDocumented)))
                    .ForMember(dest => dest.ParasiteTransferRedlistedSpecies, opt => opt.MapFrom(src => ExportMapperHelper.GetIcritInformation(src.RiskAssessment.HostParasiteInformations)))
                    .ForMember(dest => dest.RiskAssessmentPossibleLowerCategory, opt => opt.MapFrom(src => src.Category == "NK" ? "no" : src.RiskAssessment.PossibleLowerCategory))
                    .ForMember(dest => dest.RiskAssessmentClimateEffectsInvationpotential, opt => opt.MapFrom(src => src.Category == "NK" ? "no" : src.RiskAssessment.ClimateEffectsInvationpotential))
                    .ForMember(dest => dest.RiskAssessmentClimateEffectsEcoEffect, opt => opt.MapFrom(src => src.Category == "NK" ? "no" : src.RiskAssessment.ClimateEffectsEcoEffect))
                    .ForMember(dest =>dest.EvaluationStatus,  opt => opt.MapFrom(src => ExportMapperHelper.GetProgress(src)))
                    .ForMember(dest => dest.RiskAssessmentCriteriaA, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "A", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaB, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "B", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaC, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "C", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaD, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "D", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaE, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "E", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaF, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "F", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaG, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "G", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaH, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "H", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaI, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "I", "score")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaALow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "A", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaBLow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "B", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaCLow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "C", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaDLow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "D", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaELow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "E", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaFLow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "F", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaGLow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "G", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaHLow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "H", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaILow, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "I", "low")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaAHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "A", "high")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaBHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "B", "high")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaCHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "C", "high")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaDHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "D", "high")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaEHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "E", "high")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaFHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "F", "high")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaGHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "G", "high")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaHHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "G", "high")))
                    .ForMember(dest => dest.RiskAssessmentCriteriaIHigh, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentCritera(src, src.RiskAssessment.Criteria, "I", "high")))
                    .ForMember(dest => dest.RiskAssessmentChosenMethodBcrit, opt => opt.MapFrom(src => ExportMapperHelper.GetRiskAssessmentChosenMethodBcrit(src.RiskAssessment, src.AssessmentConclusion)))
                    .ForMember(dest => dest.References, opt => 
                    {
                        opt.PreCondition(src => src.References is not null & src.References.Count != 0);
                        opt.MapFrom(src => string.Join(" && ", src.References.Select(x => x.FormattedReference)));
                    })
                    .ForMember(dest => dest.RegionalDistribution, opt => opt.MapFrom(src => ExportMapperHelper.GetRegionalDistribution(src.Fylkesforekomster)))

                    .AfterMap((src, dest) =>
                    {
                        var ass2018 = src.PreviousAssessments.SingleOrDefault(x => x.RevisionYear == 2018);
                        if (ass2018 != null)
                        {   
                            if(ass2018.MainCategory == "NotApplicable" || (ass2018.MainCategory == "DoorKnocker" && ass2018.MainSubCategory == "noRiskAssessment")|| (ass2018.MainCategory == "RegionallyAlien" && ass2018.MainSubCategory == "noRiskAssessment")) //many of these has risklevel = 0. Therefore, this test must be performed first.
                            {
                                dest.Category2018 = "NR";
                                dest.Criteria2018 = "";
                            }
                            else
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
                        dest.IndoorProductionMainCatAndCat = GetIndoorProduction(src.IndoorProduktion, src.ImportPathways, "cat");
                        dest.IndoorProductionFreqNumTime = GetIndoorProduction(src.IndoorProduktion, src.ImportPathways, "freqs");
                        dest.IntroNatureMainCatAndCat = GetIntroSpreadInfo(src.AssesmentVectors, "intro", "cat");
                        dest.IntroNatureFreqNumTime = GetIntroSpreadInfo(src.AssesmentVectors, "intro", "freqs");
                        dest.SpreadNatureMainCatAndCat = GetIntroSpreadInfo(src.AssesmentVectors, "spread", "cat");
                        dest.SpreadNatureFreqNumTime = GetIntroSpreadInfo(src.AssesmentVectors, "spread", "freqs");
                        dest.IntroductionsLow = introductionsLow(src, src.RiskAssessment);
                        dest.IntroductionsHigh = introductionsHigh(src, src.RiskAssessment);
                        dest.AOO10yrBest = AOO10yrBest(src, src.RiskAssessment);
                        dest.AOO10yrLow = AOO10yrLow(src, src.RiskAssessment); 
                        dest.AOO10yrHigh = AOO10yrHigh(src, src.RiskAssessment); 
                        dest.ImpactedNatureTypes = GetimpactedNatureTypes(src.ImpactedNatureTypes);
                        dest.CoastLineSections = GetCoastLineSections(src.CoastLineSections);
                        dest.CurrentBioClimateZones = GetCurrentBioClimateZones(src.CurrentBioClimateZones);
                        dest.ArcticBioClimateZones = GetArcticBioClimateZones(src.ArcticBioClimateZones);
                        dest.RiskAssessmentMedianLifetime = GetMedianLifetime(src.RiskAssessment);
                        dest.RiskAssessmentLifetimeUpperQ = GetLifetimeUpperQ(src.RiskAssessment);  
                        dest.RiskAssessmentLifetimeLowerQ = GetLifetimeLowerQ(src.RiskAssessment);
                        dest.RiskAssessmentExpansionSpeed = GetRiskAssessmentExpansionSpeed(src, src.RiskAssessment, "50", src.AssessmentConclusion);
                        dest.RiskAssessmentExpansionLowerQ = GetRiskAssessmentExpansionSpeed(src, src.RiskAssessment, "25", src.AssessmentConclusion);
                        dest.RiskAssessmentExpansionUpperQ = GetRiskAssessmentExpansionSpeed(src, src.RiskAssessment, "75", src.AssessmentConclusion);
                        dest.Habitats = GetHabitats(src.Habitats);
                        dest.ReasonForChangeOfCategory = GetReasonForChangeOfCategory(src.ReasonForChangeOfCategory, src.Category, dest.Category2018);
                        // dest.AlienSpeciesCategory = GetAlienSpeciesCategory(src.AlienSpeciesCategory);
                        // overkjøre status for vurderinger som kom fra horizontscanning
                    });


            });
            var mapper = new Mapper(mapperConfig);
            return mapper;
        }


        private static string GetReasonForChangeOfCategory(List<string> reasonForChangeOfCategory, string category, string cat2018)
        {
            if (reasonForChangeOfCategory == null || reasonForChangeOfCategory.Count == 0 || category == cat2018)
            {
                return string.Empty;
            }
            
            else return string.Join("; ", reasonForChangeOfCategory);
        }

        private static string GetHabitats(List<FA4.Habitat> habitats)
        {
            if (habitats == null || habitats.Count == 0)
            {
                return string.Empty;
            }
            var habinfo = new List<string>();
            for (var i = 0; i < habitats.Count; ++i)
            {
                string taxonScientificName = string.Empty;
                if (habitats[i].Taxon != null)
                {
                    taxonScientificName = habitats[i].Taxon.ScientificName;
                }
                
                string hab = habitats[i].NiNCode + "//" + habitats[i].Name + "//" + habitats[i].TimeHorizon + "//" + taxonScientificName;
                habinfo.Add(hab);
                
            }
            return string.Join("; ", habinfo);
        }


        private static long? GetExpansionSpeedB2a(RiskAssessment ra) 
        {
            decimal? result;
            if(ra.AOOfirstOccurenceLessThan10Years == "yes")
            { 
                result = 
                (ra.AOOknownInput == null || ra.AOOtotalBestInput == null || ra.AOO1 == null || ra.AOO2 == null) ?
                null 
                : (ra.AOOyear2 == 0 || ra.AOOyear2 == null || ra.AOOyear1 == 0 || ra.AOOyear1 == null || (ra.AOOyear2 - ra.AOOyear1) < 10 || ra.AOO1 <= 0 || ra.AOO2 <= 0) ? 
                0
                :  Math.Truncate((decimal)(Math.Sqrt((double)(ra.AOOtotalBestInput/ra.AOOknownInput)) * 2000 * (Math.Sqrt(Math.Ceiling((double)(ra.AOO2 / 4))) - Math.Sqrt(Math.Ceiling((double)(ra.AOO1 / 4)))) / ((ra.AOOyear2 - ra.AOOyear1) * Math.Sqrt(Math.PI)))); //js: trunc(sqrt(r.AOOdarkfigureBest) * 2000 * (sqrt(ceil(r.AOO2 / 4)) - sqrt(ceil(r.AOO1 / 4))) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                //darkfigures is not saved. Use r.AOOtotalBest / r.AOOknown 
            }

            else result = 
                (ra.AOO50yrBestInput == null || ra.AOOtotalBestInput == null) ?
                null 
                : (decimal)Math.Truncate(20 * (Math.Sqrt((double)ra.AOO50yrBestInput) - Math.Sqrt((double)ra.AOOtotalBestInput)) / Math.Sqrt(Math.PI));
            return (long?)result;
        }

        private static long? GetExpansionLowerQB2a(RiskAssessment ra) 
        {
            decimal? result;
            if(ra.AOOfirstOccurenceLessThan10Years == "yes")
            { 
                result =  
                (ra.AOOknownInput == null || ra.AOOtotalLowInput == null || ra.AOO1 == null || ra.AOO2 == null) ?
                null 
                : 
                (ra.AOOyear2 == 0 || ra.AOOyear2 == null || ra.AOOyear1 == 0 || ra.AOOyear1 == null || (ra.AOOyear2 - ra.AOOyear1) < 10 || ra.AOO1 <= 0 || ra.AOO2 <= 0) ? 
                0
                :  Math.Truncate((decimal)(Math.Sqrt((double)(ra.AOOtotalLowInput/ra.AOOknownInput)) * 2000 * (Math.Sqrt(Math.Ceiling((double)(ra.AOO2 / 4))) - Math.Sqrt(Math.Ceiling((double)(ra.AOO1 / 4)))) / ((ra.AOOyear2 - ra.AOOyear1) * Math.Sqrt(Math.PI)))); //js: trunc(sqrt(r.AOOdarkfigureBest) * 2000 * (sqrt(ceil(r.AOO2 / 4)) - sqrt(ceil(r.AOO1 / 4))) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                //darkfigures is not saved. Use ra.AOOtotalLow / ra.AOOknown 
            }

            else result = 
                (ra.AOO50yrLowInput == null || ra.AOOtotalBestInput == null) ?
                null 
                : (decimal)Math.Truncate(20 * (Math.Sqrt((double)ra.AOO50yrLowInput) - Math.Sqrt((double)ra.AOOtotalBestInput)) / Math.Sqrt(Math.PI));

            return (long?)result;
        }

        private static long? GetExpansionUpperQB2a(RiskAssessment ra) 
        {
            decimal? result;
            if(ra.AOOfirstOccurenceLessThan10Years == "yes")
            { 
                result =  
                (ra.AOOknownInput == null || ra.AOOtotalHighInput == null || ra.AOO1 == null || ra.AOO2 == null) ?
                null 
                :
                (ra.AOOyear2 == 0 || ra.AOOyear2 == null || ra.AOOyear1 == 0 || ra.AOOyear1 == null || (ra.AOOyear2 - ra.AOOyear1) < 10 || ra.AOO1 <= 0 || ra.AOO2 <= 0) ? 
                0
                :  Math.Truncate((decimal)(Math.Sqrt((double)(ra.AOOtotalHighInput/ra.AOOknownInput)) * 2000 * (Math.Sqrt(Math.Ceiling((double)(ra.AOO2 / 4))) - Math.Sqrt(Math.Ceiling((double)(ra.AOO1 / 4)))) / ((ra.AOOyear2 - ra.AOOyear1) * Math.Sqrt(Math.PI)))); //js: trunc(sqrt(r.AOOdarkfigureBest) * 2000 * (sqrt(ceil(r.AOO2 / 4)) - sqrt(ceil(r.AOO1 / 4))) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi)))
                    //darkfigures is not saved. Use ra.AOOtotalHigh / ra.AOOknown 
            }

            else result = 
                (ra.AOO50yrHighInput == null || ra.AOOtotalBestInput == null) ?
                null 
                : (decimal)Math.Truncate(20 * (Math.Sqrt((double)ra.AOO50yrHighInput) - Math.Sqrt((double)ra.AOOtotalBestInput)) / Math.Sqrt(Math.PI));

            return (long?)result;
        }
        private static long? GetRiskAssessmentExpansionSpeed(FA4 assessment, RiskAssessment ra, string quant, string assConc) 
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
                var localvarB = AOO10yrBest(assessment, ra);
                var localvarL = AOO10yrLow(assessment, ra);
                var localvarH = AOO10yrHigh(assessment, ra);
        
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
            
            return  ( quant == "50")? ( exspeed == null? null : roundToSignificantDecimals(exspeed)) : //note that this will return rounded values for ExpansionSpeedInput (same goes for lower and higher)
                    ( quant == "25")? ( exspeedLow == null? null : roundToSignificantDecimals(exspeedLow)) : 
                    ( quant == "75")? ( exspeedHigh == null? null : roundToSignificantDecimals(exspeedHigh)) :
                    0; 
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
                //Interessert i: MajorTypeGroup niNCode name timeHorizon colonizedArea affectedArea, stateChange og background - de to sistnevnte er en liste i seg selv, f.eks.: ["OM", "1AE", "1AG"]
                //ninCode//name//timeHorizon//
                var natDat = new List<string>();
                
                for (var i = 0; i < impactedNatureTypes.Count; ++i) 
                { 
                    string stateChange = string.Empty;
                    string background = string.Empty;

                    if (impactedNatureTypes[i].StateChange.Count > 0)
                    {
                        List <string> navn = GetTilstandsendringer(tilstandsendringer, impactedNatureTypes[i].StateChange);
                        stateChange = string.Join("|", navn);
                    }

                    if (impactedNatureTypes[i].Background.Count > 0)
                    {
                        background = string.Join("|", impactedNatureTypes[i].Background.ToArray());
                    }

                    string newcats = impactedNatureTypes[i].MajorTypeGroup + "//" + impactedNatureTypes[i].NiNCode + "//" + impactedNatureTypes[i].Name + "//" + impactedNatureTypes[i].TimeHorizon + "//" + impactedNatureTypes[i].ColonizedArea + "//" + impactedNatureTypes[i].AffectedArea + "//" + stateChange + "//" + background;
                    natDat.Add(newcats);
                }

                return string.Join("; ", natDat);
            
        }

        private static string GetIndoorProduction(string indoorPathway, List<Domain.MigrationPathway> importPathways, string col)
        {
            if (importPathways == null || importPathways.Count == 0 || indoorPathway == "positive")
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

        private static long? introductionsLow(FA4 assessment, RiskAssessment ra)
        {
            if(assessment.AssessmentConclusion != "AssessedDoorknocker")
            {
                return null;
            }

            long num = introductionNum(introLowTable, ra.IntroductionsBest);
            return (long)(num == 0 ? 0 : ra.IntroductionsBest - num);
        }

        private static long? introductionsHigh(FA4 assessment, RiskAssessment ra)
        {
            if(assessment.AssessmentConclusion != "AssessedDoorknocker")
            {
                return null;
            }

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
        
        private static long? AOO10yrBest(FA4 assessment, RiskAssessment ra)
        {
            if(assessment.AssessmentConclusion != "AssessedDoorknocker")
            {
                return null;
            }

            var result = AOO10yr(ra.Occurrences1Best, ra.IntroductionsBest);
            return result;
        }

        private static long? AOO10yrLow(FA4 assessment, RiskAssessment ra)
        {
            if(assessment.AssessmentConclusion != "AssessedDoorknocker")
            {
                return null;
            }

            var result = AOO10yr(ra.Occurrences1Low, introductionsLow(assessment, ra));
            return result;
        }
        private static long? AOO10yrHigh(FA4 assessment, RiskAssessment ra)
        {
            if(assessment.AssessmentConclusion != "AssessedDoorknocker")
            {
                return null;
            }

            var result = AOO10yr(ra.Occurrences1High, introductionsHigh(assessment, ra));
            return result;
        }

        private static long roundToSignificantDecimals(double? num) //median lifetime can be a larger number than long can handle..
            {
                if (!num.HasValue) return 0;
                long result =
                    (num >= 10000000) ? (long)Math.Floor((double)(num / 1000000)) * 1000000 :
                    (num >= 1000000 ) ? (long)Math.Floor((double)(num / 100000))  * 100000  :
                    (num >= 100000  ) ? (long)Math.Floor((double)(num / 10000))   * 10000   :
                    (num >= 10000   ) ? (long)Math.Floor((double)(num / 1000))    * 1000    :
                    (num >= 1000    ) ? (long)Math.Floor((double)(num / 100))     * 100     :
                    (num >= 100     ) ? (long)Math.Floor((double)(num / 10))      * 10      :
                    (long)num.Value;
                return result;
             }
        private static long GetMedianLifetime(RiskAssessment ra) 
        {
            long result = (ra.ChosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate") ?
                ra.Criteria[0].Value == 0 ? 3
                : ra.Criteria[0].Value == 1 ? 25
                : ra.Criteria[0].Value == 2 ? 200
                : ra.Criteria[0].Value == 3 ? 2000
                : 0
            : roundToSignificantDecimals(ra.MedianLifetimeInput);
            return result;
        }
        private static long GetLifetimeLowerQ(RiskAssessment ra) 
        { 
            return roundToSignificantDecimals(ra.LifetimeLowerQInput);
        }
        private static long GetLifetimeUpperQ(RiskAssessment ra) 
        {
            return roundToSignificantDecimals(ra.LifetimeUpperQInput);
        }
        

        private static string GetDoorknockerType(FA4WithComments args)
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

    public class CustomSpreadHistoryConverter : ITypeConverter<List<SpreadHistory>, string> //how to take one element from a list to one column in export (here column SpreadHistory using "id" from the list)
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
        [Name("Id2018")]
        public string AssessmentId2018 { get; set; }
        
        [Name("Ekspertkomite")]
        public string ExpertGroup { get; set; }
        
        [Name("Vurderingsomraade")]
        public string EvaluationContext { get; set; }        
        
        [Name("Vurderingsstatus")]
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
        public string EvaluatedScientificNameRank { get; set; } //06.10.22: WTF. Dette er bare et tall for enkelte (22)? Og de fleste har null. Mulig fjern denne eller hvertfall bytt den ut med "Species" ...!

        [Name("NorskNavn")]
        public string EvaluatedVernacularName { get; set; }
        
        [Name("SistEndret")]
        public DateTime LastUpdatedAt { get; set; }
        
        [Name("SistEndretAv")]
        public string LastUpdatedBy { get; set; }
        
        [Name("Fremmedartsstatus")]
        public string AlienSpeciesCategory { get; set; }
        
        [Name("FremmedartsstatusKommentar")]
        public string IsAlien { get; set; } // new in 2021

        [Name("Kategori2023")]
        public string Category { get; set; } //We can use this!
        
        [Name("Kriterier2023")]
        public string Criteria { get; set; }

        [Name("SkaarInvasjonspotensial")]
        public int? InvasionScore {get; set; }

        [Name("SkaarInvasjonspotensialUsikkerhetLav")]
        public int? InvasionScoreLow {get; set; }

        [Name("SkaarInvasjonspotensialUsikkerhetHoy")]
        public int? InvasionScoreHigh {get; set; }
        
        [Name("SkaarOkologiskEffekt")]
        public int? EcoEffectScore {get; set; }
        
        [Name("SkaarOkologiskEffektUsikkerhetLav")]
        public int? EcoEffectScoreLow {get; set; }

        [Name("SkaarOkologiskEffektUsikkerhetHoy")]
        public int? EcoEffectScoreHigh {get; set; }
        
        [Name("Kategori2018")]
        public string Category2018 { get; set; }
        
        [Name("Fremmedartsstatus2018")]
        public string AlienSpeciesCategory2018 { get; set; }
        
        [Name("Kriterier2018")]
        public string Criteria2018 { get; set; }
        
        [Name("SkaarInvasjonspotensial2018")]
        public int? InvationScore2018 {get; set; }
        
        [Name("SkaarOkologiskEffekt2018")]
        public int? EcoEffectScore2018 {get; set; }
        
        [Name("AarsakTilEndringIKategori")]
        public string ReasonForChangeOfCategory { get; set; }  
        
        [Name("AarsakTilEndringIKategoriBeskrivelse")]
        public string DescriptionOfReasonsForChangeOfCategory { get; set; }   
        
        [Name("HorisontskanningEtableringspotensial")]
        public string HorizonEstablismentPotential { get; set; }
        
        [Name("HorisontskanningOkologiskEffekt")]
        public string HorizonEcologicalEffect { get; set; }
        
        #region Artens status
        [Name("EndretStatusFraFremmedAarsak")]
        public string ChangedFromAlien { get; set; }
        
        [Name("EndretStatusFraFremmedAarsakBeskrivelse")]
        public string ChangedAssessment { get; set; }
        
        [Name("VurderesPaaHoyereLavereTaksonomiskNivaBeskrivelse")]
        public string ConnectedToHigherLowerTaxonDescription { get; set; } = "";
        
        [Name("VurderesSammenMedEtAnnetTakson")]
        public bool? ConnectedToAnother { get; set; }
        
        [Name("VurderesSammenMedEtAnnetTaksonBeskrivelse")]
        public string ConnectedToAnotherTaxonDescription { get; set; } = "";
        
        [Name("VurderesSammenMedEtAnnetTaksonArtsnavn")]
        public string ConnectedTaxa { get; set; } = "";
        
        [Name("Bruksart")]
        public bool? ProductionSpecies { get; set; }
        
        [Name("Etableringsklasse")]
        public string SpeciesStatus { get; set; }
        
        [Name("UsikkerhetEtableringsklasseBeskrivelse")]
        public string UncertainityStatusDescription { get; set; } 
        
        [Name("EtablertPer1800")]
        public bool? AlienSpecieUncertainIfEstablishedBefore1800 { get; set; } 
        
        [Name("UsikkerhetEtableringstidspunktBeskrivelse")]
        public string UncertainityEstablishmentTimeDescription { get; set; } = "";
        
        [Name("ForsteObsInnendors")]
        public int? RiskAssessmentYearFirstIndoors { get; set; }
        
        [Name("UsikkerhetForsteObsInnendors")]
        public bool RiskAssessmentYearFirstIndoorsInsecure { get; set; }
        
        [Name("ForsteObsReprodInnendors")]
        public int? RiskAssessmentYearFirstReproductionIndoors { get; set; }
        
        [Name("UsikkerhetForsteObsReprodInnendors")]
        public bool RiskAssessmentYearFirstReproductionIndoorsInsecure { get; set; }
        
        [Name("ForsteObsIProduksjonsareal")]
        public int? RiskAssessmentYearFirstProductionOutdoors { get; set; }
        
        [Name("UsikkerhetForsteObsIProduksjonsareal")]
        public bool RiskAssessmentYearFirstProductionOutdoorsInsecure { get; set; }
        
        [Name("ForsteObsReprodProduksjonsareal")]
        public int? RiskAssessmentYearFirstReproductionOutdoors { get; set; }
        
        [Name("UsikkerhetForsteObsReprodProduksjonsareal")]
        public bool RiskAssessmentYearFirstReproductionOutdoorsInsecure { get; set; }
        
        [Name("ForsteObsEtableringProdusjonsareal")]
        public int? RiskAssessmentYearFirstEstablishmentProductionArea { get; set; }
        
        [Name("UsikkerhetForsteObsEtableringProdusjonsareal")]
        public bool RiskAssessmentYearFirstEstablishmentProductionAreaInsecure { get; set; }
        
        [Name("ForsteObsNorskNatur")]
        public int? RiskAssessmentYearFirstNature { get; set; }
        
        [Name("UsikkerhetForsteObsNorskNatur")]
        public bool RiskAssessmentYearFirstNatureInsecure { get; set; }
        
        [Name("ForsteObsReprodNorskNatur")]
        public int? RiskAssessmentYearFirstReproductionNature { get; set; }
        
        [Name("UsikkerhetForsteObsReprodNorskNatur")]
        public bool RiskAssessmentYearFirstReproductionNatureInsecure { get; set; }
        
        [Name("ForsteObsEtableringNorskNatur")]
        public int? RiskAssessmentYearFirstEstablishedNature { get; set; }
        
        [Name("UsikkerhetForsteObsEtableringNorskNatur")]
        public bool RiskAssessmentYearFirstEstablishedNatureInsecure { get; set; }
        
        [Name("ForsteObsINorgeBeskrivelse")]
        public string FurtherInfo {get; set;}
        
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
        [Name("UkjonnetFormering")]
        public bool? ReproductionAsexual { get; set; } // fab: Reproduction_Asexual
        [Name("KjonnetFormering")]
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
            // public double? RiskAssessmentAOOchangeBest { get; set; } //- 07.06.22 - trenger ikke disse i eksporten da de kun brukes på baksiden for A-kriteriet (de lagres heller ikke på modellen..)
            // // [Name("AOOchangeLow")]
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
            [Name("Livsmedium")]
            public string Habitats {get; set;}
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
            [Name("A-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaALow { get; set; } 
            [Name("A-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaAHigh { get; set; }
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
            
            [Name("ForekomstarealetsMorketall")]
            public string RiskAssessmentBCritMCount { get; set; } = "";
            
            [Name("B-EkspansjonshastighetNedreKvartil")]
            public long? RiskAssessmentExpansionLowerQ { get; set; } // nedre kvartil for ekspansjonshastighet i meter per år 
            
            [Name("B-GjennomsnittligEkspansjonshastighet")]
            public long? RiskAssessmentExpansionSpeed { get; set; }  // ekspansjonshastighet i meter per år 
            
            [Name("B-EkspansjonshastighetOvreKvartil")]
            public long? RiskAssessmentExpansionUpperQ { get; set; } // øvre kvartil for ekspansjonshastighet i meter per år 
            
            [Name("B-Skaar")]
            public int? RiskAssessmentCriteriaB  { get; set; }
            
            [Name("B-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaBLow { get; set; } 
            
            [Name("B-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaBHigh { get; set; }
            //////C-kriteriet//////
            [Name("C-Skaar")]
            public int? RiskAssessmentCriteriaC { get; set; }
            
            [Name("C-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaCLow { get; set; } 
            
            [Name("C-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaCHigh { get; set; }
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
            [Name("D-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaDLow { get; set; } 
            [Name("D-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaDHigh { get; set; }
            [Name("D-SkaarBeskrivelse")]
            public string RiskAssessmentDCritInsecurity {get; set;}
            [Name("E-Skaar")]
            public int? RiskAssessmentCriteriaE { get; set; }
            [Name("E-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaELow { get; set; } 
            [Name("E-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaEHigh { get; set; }
            [Name("E-SkaarBeskrivelse")]
            public string RiskAssessmentECritInsecurity {get; set;}
            [Name("F-Skaar")]
            public int? RiskAssessmentCriteriaF { get; set; }
            [Name("F-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaFLow { get; set; } 
            [Name("F-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaFHigh { get; set; }
            [Name("G-Skaar")]
            public int? RiskAssessmentCriteriaG { get; set; }
            [Name("G-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaGLow { get; set; } 
            [Name("G-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaGHigh { get; set; }
            [Name("OverfoeringAvGenetiskMateriale")]
            public string IntrogressionRedlistedSpecies {get; set;}
            [Name("H-Skaar")]
            public int? RiskAssessmentCriteriaH { get; set; }
            [Name("H-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaHLow { get; set; } 
            [Name("H-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaHHigh { get; set; }
            [Name("H-SkaarBeskrivelse")]
            public string RiskAssessmentHCritInsecurity {get; set;}
            [Name("OverfoeringAvParasitterPatogener")]
            public string ParasiteTransferRedlistedSpecies {get; set;}
            [Name("I-Skaar")]
            public int? RiskAssessmentCriteriaI { get; set; }
            [Name("I-skaarLavtanslag")]
            public int? RiskAssessmentCriteriaILow { get; set; } 
            [Name("I-skaarHoytanslag")]
            public int? RiskAssessmentCriteriaIHigh { get; set; }
            [Name("I-SkaarBeskrivelse")]
            public string RiskAssessmentICritInsecurity {get; set;}
            #endregion Økologisk effekt

            #region Geographic variation and Climate
            [Name("GeografiskVariasjonIRisiko")]
            public string RiskAssessmentPossibleLowerCategory { get; set; }

            [Name("GeografiskVariasjonIRisikoAarsak")]
            public string GeographicalVariationCauses { get; set; }  // lagt til 23.09.2016

            [Name("GeografiskVariasjoniRisikoBeskrivelse")]
            public string GeographicalVariationDocumentation { get; set; } // lagt til 23.09.2016

            // Klimaeffekter
            [Name("KlimaeffekterInvasjonspotensial")]
            public string RiskAssessmentClimateEffectsInvationpotential { get; set; } // lagt til 23.09.2016
            [Name("KlimaeffekterOkologiskEffekt")]
            public string RiskAssessmentClimateEffectsEcoEffect { get; set; } // lagt til 23.09.2016
            [Name("KlimaeffekterBeskrivelse")]
            public string RiskAssessmentClimateEffectsDocumentation { get; set; } // lagt til 23.09.2016
            #endregion Geographic variation and Climate
            
            #region Oppsummering
            [Name("OppsummeringGenereltOmArten")]
            public string RiskAssessmentCriteriaDocumentationSpeciesStatus { get; set; }
            
            [Name("OppsummeringUtbredelseINorge")]
            public string RiskAssessmentCriteriaDocumentationDomesticSpread { get; set; }
            
            [Name("OppsummeringSpredningsmaaterTilInnendorsOgProdarealBeskrivelse")]
            public string SpreadIndoorFurtherInfo {get; set;}
            
            [Name("OppsummeringSpredningsmaaterIntroduksjonNaturBeskrivelse")]
            public string SpreadIntroductionFurtherInfo {get; set;}
            
            [Name("OppsummeringSpredningsmaaterVidereSpredningInaturenBeskrivelse")]
            public string spreadFurtherSpreadFurtherInfo {get; set;}

            [Name("OppsummeringInvasjonspotensial")]
            public string RiskAssessmentCriteriaDocumentationInvationPotential { get; set; }
            
            [Name("OppsummeringOkologiskEffekt")]
            public string RiskAssessmentCriteriaDocumentationEcoEffect { get; set; }
            
            [Name("OppsummeringKonklusjon")]
            public string RiskAssessmentCriteriaDocumentation { get; set; }

            [Name("Referanser")]
            public string References { get; set; }
            #endregion Oppsummering  

            [Name("AntallBehandledeKommentarer")]
            public int CommentClosed { get; set; }

            [Name("AntallÅpneKommentarer")]
            public int CommentOpen { get; set; }
            //public int CommentNew { get; set; }

            [Name("VentendeTaksonomiskeEndringer")]
            public int TaxonChange { get; set; }
       
        #endregion

    }
}
