using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading;
using AutoMapper;
using Prod.Domain;
using Public.Domain;
using RiskAssessment = Public.Domain.RiskAssessment;

namespace SwissKnife.Database
{
    public class Fab4ToFab2023Mapper
    {

        private static Dictionary<string, string> naturetypes;
        private static Dictionary<string, string> naturetypes2_2;

        private static Dictionary<string, string> Naturetypes
        {
            get
            {
                if (naturetypes != null)
                {
                    return naturetypes;
                }

                var nin = ParseJson("/Prod.Web/src/Nin2_3.json");
                var dict = DrillDown(nin["Children"].AsArray()).ToDictionary(item => item.Item1.Substring(3), item => item.Item2);

                var nin2 = ParseJson("/Prod.Web/src/TrueteOgSjeldneNaturtyper2018.json");
                foreach (var item in DrillDown(nin2["Children"].AsArray()))
                {
                    dict.Add(item.Item1, item.Item2);
                }

                //var nin1 = ParseJson("/Prod.Web/src/Nin2_2.json");
                //foreach (var item in DrillDown(nin2["Children"].AsArray()).Where(item => !dict.ContainsKey(item.Item1)))
                //{
                //    dict.Add(item.Item1, item.Item2);
                //}
                var ninl1 = ParseJson("/Prod.Web/src/nin-livsmedium.json");
                foreach (var item in DrillDown(ninl1["children"].AsArray(), "Id", "navn", "children").Where(item => !dict.ContainsKey(item.Item1)))
                {
                    dict.Add(item.Item1, item.Item2);
                }

                naturetypes = dict;
                return dict;
            }
        }
        private static Dictionary<string, string> Naturetypes2_2
        {
            get
            {
                if (naturetypes2_2 != null)
                {
                    return naturetypes2_2;
                }
                
                var nin = ParseJson("/Prod.Web/src/Nin2_2.json");
                var dict = DrillDown(nin["Children"].AsArray()).ToDictionary(item => item.Item1.Substring(3), item => item.Item2);

                naturetypes2_2 = dict;
                return dict;
            }
        }
        public static Mapper CreateMappingFromFA4ToFA2023()
        { 
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                
                cfg.CreateMap<FA4.NaturalOrigin, FA2023.NaturalOrigin>();
                cfg.CreateMap<FA4.RedlistedNatureType, FA2023.RedlistedNatureType>();
                cfg.CreateMap<FA4.SimpleReference, FA2023.SimpleReference>();
                // cfg.CreateMap<FA4.RegionalRiskAssessment, FA2023.RegionalRiskAssessment>();
                cfg.CreateMap<Prod.Domain.RiskAssessment.Criterion, Public.Domain.RiskAssessment.Criterion>();
                cfg.CreateMap<Prod.Domain.RiskAssessment.HostParasiteInteraction,
                        Public.Domain.RiskAssessment.HostParasiteInteraction>();
                cfg.CreateMap<Prod.Domain.RiskAssessment.Interaction, Public.Domain.RiskAssessment.Interaction>();
                cfg.CreateMap<Prod.Domain.RiskAssessment.NaturetypeInteraction,
                        Public.Domain.RiskAssessment.NaturetypeInteraction>();
                cfg.CreateMap<Prod.Domain.RiskAssessment.SpeciesInteraction,
                        Public.Domain.RiskAssessment.SpeciesInteraction>();
                cfg.CreateMap<Prod.Domain.RiskAssessment.SpeciesNaturetypeInteraction,
                        Public.Domain.RiskAssessment.SpeciesNaturetypeInteraction>();
                cfg.CreateMap<Prod.Domain.RiskAssessment.SpeciesSpeciesInteraction,
                        Public.Domain.RiskAssessment.SpeciesSpeciesInteraction>();

                cfg.CreateMap<Prod.Domain.RiskAssessment, Public.Domain.RiskAssessment>();

                cfg.CreateMap<Prod.Domain.CTaxon, Public.Domain.CTaxon>();
                cfg.CreateMap<Prod.Domain.Fylkesforekomst, Public.Domain.Fylkesforekomst>();
                cfg.CreateMap<Prod.Domain.ArtskartModel, Public.Domain.ArtskartModel>();
                cfg.CreateMap<Prod.Domain.ArtskartWaterModel, Public.Domain.ArtskartWaterModel>();
                cfg.CreateMap<Prod.Domain.ArtskartWaterAreaModel, Public.Domain.ArtskartWaterAreaModel>();
                cfg.CreateMap<FA4.CoastLineSection, FA2023.CoastLineSection>();
                cfg.CreateMap<FA4.BioClimateZones, FA2023.BioClimateZones>();
                cfg.CreateMap<FA4.BioClimateZonesArctic, FA2023.BioClimateZonesArctic>();
                cfg.CreateMap<FA4.Habitat, FA2023.Habitat>();
                cfg.CreateMap<FA4.PreviousAssessment, FA2023.PreviousAssessment>();
                

                cfg.CreateMap<Prod.Domain.MigrationPathway, Public.Domain.MigrationPathway>();
                cfg.CreateMap<Prod.Domain.MigrationPathwayCode, Public.Domain.MigrationPathwayCode>();
                cfg.CreateMap<Prod.Domain.SpreadHistory, Public.Domain.SpreadHistory>();
                cfg.CreateMap<Prod.Domain.RedlistedNatureTypeCode, Public.Domain.RedlistedNatureTypeCode>();
                cfg.CreateMap<Prod.Domain.RedlistedNatureTypeCodeGroup, Public.Domain.RedlistedNatureTypeCodeGroup>();
                
                cfg.CreateMap<Prod.Domain.RegionalPresence, Public.Domain.RegionalPresence>();
                cfg.CreateMap<Prod.Domain.RegionalPresenceWithPotential, Public.Domain.RegionalPresenceWithPotential>();
                cfg.CreateMap<FA4.ImpactedNatureType, FA2023.ImpactedNatureType>();
                cfg.CreateMap<FA4.TimeAndPlace, FA2023.TimeAndPlace>();
                cfg.CreateMap<FA4.ObservedAndEstablished, FA2023.ObservedAndEstablished>();
                cfg.CreateMap<FA4.ObservedAndEstablishedInCountry, FA2023.ObservedAndEstablishedInCountry>();
                cfg.CreateMap<FA4, FA2023>();

                


            });
            mapperConfig.AssertConfigurationIsValid();
            var mapper = new Mapper(mapperConfig);
            return mapper;
        }

        private static void AfterRiskAssessmentMap(Prod.Domain.RiskAssessment src, Public.Domain.RiskAssessment dest)
        {
            
        }

        //private static void AfterFabMap(FA2023 dest, FA4 src)
        //{
        //    // set some standard values
        //    dest.EvaluationStatus = "imported";
        //    dest.HorizonScanningStatus = "notStarted";
        //    dest.TaxonHierarcy = "";
        //    dest.IsDeleted = false;
        //    if (string.IsNullOrWhiteSpace(dest.ExpertGroup) && !string.IsNullOrWhiteSpace(src.ExpertGroupId) &&
        //        expertGroupReplacements.ContainsKey(src.ExpertGroupId))
        //    {
        //        dest.ExpertGroup = expertGroupReplacements[src.ExpertGroupId];
        //    }

        //    if (!string.IsNullOrWhiteSpace(src.Id) && specificExpertGroups.ContainsKey(src.Id))
        //    {
        //        dest.ExpertGroup = specificExpertGroups[src.Id];
        //    }
            

        //    // hentet fra det under - slik mapping fungerer ikke - da de blir kallt via convention - og det er ingen tilfeller der den har behov for å mappe fra FA4 til Public.Domain.RiskAssessment - koden blir ikke kallt
        //    dest.RiskAssessment.AOOknownInput = src.CurrentExistenceArea;
        //    dest.RiskAssessment.AOOtotalBestInput = src.CurrentExistenceAreaCalculated;
        //    dest.RiskAssessment.AOOtotalLowInput = src.CurrentExistenceAreaLowCalculated;
        //    dest.RiskAssessment.AOOtotalHighInput = src.CurrentExistenceAreaHighCalculated;
        //    dest.RiskAssessment.AOO50yrBestInput = src.PotentialExistenceArea;
        //    dest.RiskAssessment.AOO50yrLowInput = src.PotentialExistenceAreaLowQuartile;
        //    dest.RiskAssessment.AOO50yrHighInput = src.PotentialExistenceAreaHighQuartile;

        //    dest.RiskAssessment.AOOdarkfigureBest = ParseFloat(src.CurrentExistenceAreaMultiplier);
        //    dest.RiskAssessment.AOOdarkfigureHigh = ParseFloat(src.CurrentExistenceAreaHighMultiplier);
        //    dest.RiskAssessment.AOOdarkfigureLow = ParseFloat(src.CurrentExistenceAreaLowMultiplier);

        //    dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes =
        //        src.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;

        //    if (!string.IsNullOrWhiteSpace(src.RegionalPresenceKnown))
        //    {
        //        var elements = src.RegionalPresenceKnown.Split(",", StringSplitOptions.RemoveEmptyEntries);
        //        foreach (var item in elements)
        //        {
        //            var match = dest.Fylkesforekomster.SingleOrDefault(x =>
        //                x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
        //            if (match != null)
        //            {
        //                match.State0 = 1;
        //                match.State1 = 1;
        //            }
        //            else
        //            {
        //                throw new Exception("No match not good");
        //            }
        //        }
        //    }

        //    if (!string.IsNullOrWhiteSpace(src.RegionalPresenceAssumed))
        //    {
        //        var elements = src.RegionalPresenceAssumed.Split(",", StringSplitOptions.RemoveEmptyEntries);
        //        foreach (var item in elements)
        //        {
        //            var match = dest.Fylkesforekomster.SingleOrDefault(x =>
        //                x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
        //            if (match != null)
        //            {
        //                match.State1 = 1;
        //            }
        //            else
        //            {
        //                throw new Exception("No match not good");
        //            }
        //        }
        //    }

        //    if (!string.IsNullOrWhiteSpace(src.RegionalPresencePotential))
        //    {
        //        var elements = src.RegionalPresencePotential.Split(",", StringSplitOptions.RemoveEmptyEntries);
        //        foreach (var item in elements)
        //        {
        //            var match = dest.Fylkesforekomster.SingleOrDefault(x =>
        //                x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
        //            if (match != null)
        //            {
        //                match.State3 = 1;
        //            }
        //            else
        //            {
        //                throw new Exception("No match not good");
        //            }
        //        }
        //    }

        //    foreach (var item in dest.Fylkesforekomster)
        //    {
        //        if (item.State0 == 0 && item.State1 == 00 && item.State3 == 0)
        //        {
        //            item.State2 = 1;
        //        }
        //        else
        //        {
        //            item.State2 = 0;
        //        }
        //    }
        //    //                    "RegionalPresenceKnown": "St",
        //    //"RegionalPresenceAssumed": "",
        //    //"RegionalPresencePotential": "Ro,Ho,Sf,Mr,St",


        //    switch (src.AlienSpeciesCategory)
        //    {
        //        case "AlienSpecie":
        //        case "DoorKnocker":
        //        case "RegionallyAlien":
        //        case "EcoEffectWithoutEstablishment":
        //            dest.IsAlienSpecies = true;
        //            break;
        //        case "NotApplicable":
        //            if (src.NotApplicableCategory != "notAlienSpecie")
        //            {
        //                dest.IsAlienSpecies = true;
        //            }

        //            if (src.NotApplicableCategory == "taxonIsEvaluatedInHigherRank")
        //            {
        //                dest.ConnectedToAnother = true;
        //            }

        //            if (src.NotApplicableCategory == "traditionalProductionSpecie")
        //            {
        //                dest.ProductionSpecies = true;
        //            }

        //            if (src.NotApplicableCategory == "establishedBefore1800")
        //            {
        //                dest.AlienSpecieUncertainIfEstablishedBefore1800 = true;
        //                dest.IsAlienSpecies = true;
        //                dest.ConnectedToAnother = false;
        //            }

        //            break;
        //    }

        //    if (src.AlienSpeciesCategory == "AlienSpecie" || src.AlienSpeciesCategory == "DoorKnocker")
        //    {
        //        dest.AlienSpecieUncertainIfEstablishedBefore1800 = false;
        //    }

        //    if (src.AlienSpeciesCategory == "RegionallyAlien")
        //    {
        //        dest.IsRegionallyAlien = true;
        //    }

        //    dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes =
        //        dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.HasValue == false
        //            ? 0
        //            : dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value > 95
        //                ? 95
        //                : dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value > 75
        //                    ? 75
        //                    : dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value >= 25
        //                        ? 25
        //                        : dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value >= 5
        //                            ? 5
        //                            : 0;

        //    // issue #346
        //    if (!string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time) ||
        //        !string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.Indoor.FertileSpecimenObserved.Time))
        //    {
        //        int riskAssessmentYearFirstIndoors = 0;
        //        int riskAssessmentYearFirstIndoorsFertile = 0;
        //        if (IsInt(src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time))
        //            riskAssessmentYearFirstIndoors =
        //                int.Parse(src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time);
        //        if (IsInt(src.ObservedAndEstablishedStatusInCountry.Indoor.FertileSpecimenObserved.Time))
        //            riskAssessmentYearFirstIndoorsFertile =
        //                int.Parse(src.ObservedAndEstablishedStatusInCountry.Indoor.FertileSpecimenObserved.Time);

        //        dest.RiskAssessment.YearFirstIndoors =
        //            riskAssessmentYearFirstIndoors > 0 && (riskAssessmentYearFirstIndoorsFertile == 0 ||
        //                                                   riskAssessmentYearFirstIndoorsFertile >
        //                                                   riskAssessmentYearFirstIndoors)
        //                ? riskAssessmentYearFirstIndoors
        //                : riskAssessmentYearFirstIndoorsFertile;
        //    }

        //    if (IsInt(src.ObservedAndEstablishedStatusInCountry.Indoor.Established.Time))
        //        dest.RiskAssessment.YearFirstReproductionIndoors =
        //            int.Parse(src.ObservedAndEstablishedStatusInCountry.Indoor.Established.Time);

        //    if (!string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.ProductionArea.ObservedInCountry.Time) ||
        //        !string.IsNullOrWhiteSpace(
        //            src.ObservedAndEstablishedStatusInCountry.ProductionArea.FertileSpecimenObserved.Time))
        //    {
        //        int riskAssessmentYearFirstIndoors = 0;
        //        int riskAssessmentYearFirstIndoorsFertile = 0;
        //        if (IsInt(src.ObservedAndEstablishedStatusInCountry.ProductionArea.ObservedInCountry.Time))
        //            riskAssessmentYearFirstIndoors =
        //                int.Parse(src.ObservedAndEstablishedStatusInCountry.ProductionArea.ObservedInCountry.Time);
        //        if (IsInt(src.ObservedAndEstablishedStatusInCountry.ProductionArea.FertileSpecimenObserved.Time))
        //            riskAssessmentYearFirstIndoorsFertile = int.Parse(src.ObservedAndEstablishedStatusInCountry.ProductionArea
        //                .FertileSpecimenObserved.Time);

        //        dest.RiskAssessment.YearFirstProductionOutdoors =
        //            riskAssessmentYearFirstIndoors > 0 && (riskAssessmentYearFirstIndoorsFertile == 0 ||
        //                                                   riskAssessmentYearFirstIndoorsFertile >
        //                                                   riskAssessmentYearFirstIndoors)
        //                ? riskAssessmentYearFirstIndoors
        //                : riskAssessmentYearFirstIndoorsFertile;
        //    }

        //    if (IsInt(src.ObservedAndEstablishedStatusInCountry.ProductionArea.Established.Time))
        //        dest.RiskAssessment.YearFirstReproductionOutdoors =
        //            int.Parse(src.ObservedAndEstablishedStatusInCountry.ProductionArea.Established.Time);

        //    if (IsInt(src.ObservedAndEstablishedStatusInCountry.ProductionArea.Population.Time))
        //        dest.RiskAssessment.YearFirstEstablishmentProductionArea =
        //            int.Parse(src.ObservedAndEstablishedStatusInCountry.ProductionArea.Population.Time);

        //    if (!string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.ObservedInCountry.Time) ||
        //        !string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.FertileSpecimenObserved
        //            .Time))
        //    {
        //        int riskAssessmentYearFirstIndoors = 0;
        //        int riskAssessmentYearFirstIndoorsFertile = 0;
        //        if (IsInt(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.ObservedInCountry.Time))
        //            riskAssessmentYearFirstIndoors =
        //                int.Parse(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.ObservedInCountry.Time);
        //        if (IsInt(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.FertileSpecimenObserved.Time))
        //            riskAssessmentYearFirstIndoorsFertile = int.Parse(src.ObservedAndEstablishedStatusInCountry.NorwegianNature
        //                .FertileSpecimenObserved.Time);

        //        dest.RiskAssessment.YearFirstNature =
        //            riskAssessmentYearFirstIndoors > 0 && (riskAssessmentYearFirstIndoorsFertile == 0 ||
        //                                                   riskAssessmentYearFirstIndoorsFertile >
        //                                                   riskAssessmentYearFirstIndoors)
        //                ? riskAssessmentYearFirstIndoors
        //                : riskAssessmentYearFirstIndoorsFertile;
        //    }

        //    if (IsInt(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Established.Time))
        //        dest.RiskAssessment.YearFirstReproductionNature =
        //            int.Parse(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Established.Time);

        //    if (IsInt(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Population.Time))
        //        dest.RiskAssessment.YearFirstEstablishedNature =
        //            int.Parse(src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Population.Time);
        //    var tekster = string.Join(" ",
        //        new string[]
        //        {
        //            src.FirstDomesticObservation,
        //            GetNotInt("YearFirstIndoors", src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time),
        //            GetNotInt("YearFirstIndoors",
        //                src.ObservedAndEstablishedStatusInCountry.Indoor.FertileSpecimenObserved.Time),
        //            GetNotInt("YearFirstReproductionIndoors",
        //                src.ObservedAndEstablishedStatusInCountry.Indoor.Established.Time),
        //            GetNotInt("YearFirstProductionOutdoors",
        //                src.ObservedAndEstablishedStatusInCountry.ProductionArea.ObservedInCountry.Time),
        //            GetNotInt("YearFirstProductionOutdoors",
        //                src.ObservedAndEstablishedStatusInCountry.ProductionArea.FertileSpecimenObserved.Time),
        //            GetNotInt("YearFirstReproductionOutdoors",
        //                src.ObservedAndEstablishedStatusInCountry.ProductionArea.Established.Time),
        //            GetNotInt("YearFirstEstablishmentProductionArea",
        //                src.ObservedAndEstablishedStatusInCountry.ProductionArea.Population.Time),
        //            GetNotInt("YearFirstNature",
        //                src.ObservedAndEstablishedStatusInCountry.NorwegianNature.ObservedInCountry.Time),
        //            GetNotInt("YearFirstNature",
        //                src.ObservedAndEstablishedStatusInCountry.NorwegianNature.FertileSpecimenObserved.Time),
        //            GetNotInt("YearFirstReproductionNature",
        //                src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Established.Time),
        //            GetNotInt("YearFirstEstablishedNature",
        //                src.ObservedAndEstablishedStatusInCountry.NorwegianNature.Population.Time)
        //        }.Where(x => !string.IsNullOrWhiteSpace(x)).ToArray());

        //    if (!string.IsNullOrWhiteSpace(tekster))
        //        dest.RiskAssessment.YearFirstDomesticObservation = tekster;

        //    //if (src.VurderingsStatus == "SlettetAvAdmin" || src.VurderingsStatus == "SlettetFlyttetAvAdmin" ||
        //    //    (src.ExpertGroupId == "ExpertGroups/Ikkemarineinvertebrater/N" && src.VurderingsStatus == null))
        //    //{
        //    //    dest.IsDeleted = true;
        //    //}

        //    var petAqua = dest.AssesmentVectors.Where(x => x.CodeItem == "liveFoodLiveBait").ToArray();
        //    if (petAqua.Length > 0)
        //    {
        //        foreach (var b in petAqua)
        //        {
        //            if (dest.ExpertGroup == "Fisker" || dest.ExpertGroup.StartsWith("Karplanter"))
        //            {
        //                b.CodeItem = "liveAnimalFoodBait";
        //                b.Category = "av levende fôr eller agn (ikke til kjæledyr)";
        //            }
        //            else
        //            {
        //                b.CodeItem = "liveHumanFood";
        //                b.Category = "av levende mat (til mennesker)";
        //            }
        //        }
        //    }

        //    if (dest.AssesmentVectors.Any(x => x.CodeItem == "otherUnknownRelease"))
        //    {
        //        var these = dest.AssesmentVectors.Where(x => x.CodeItem == "otherUnknownRelease").ToArray();
        //        foreach (var migrationPathway in these)
        //        {
        //            migrationPathway.CodeItem = "otherIntentionalRelease";
        //        }
        //    }

        //    // issue #388 og #392
        //    var dict = Naturetypes;
        //    var dictOld = Naturetypes2_2;
        //    var impactedNatureTypes = dest.ImpactedNatureTypes.ToArray();
        //    foreach (var item in impactedNatureTypes)
        //    {
        //        var code = item.NiNCode;
        //        bool newCode = true;
        //        if ((!code.StartsWith("LI ") && code.StartsWith("L")) || code.StartsWith("F"))
        //        {
        //            // nin 2_2 -> flyttes
        //            newCode = false;
        //            dest.ImpactedNatureTypes.Remove(item);
        //            dest.ImpactedNatureTypesFrom2018.Add(item);
        //        }

        //        var text = newCode
        //            ? (dict.ContainsKey(code) ? dict[code] : string.Empty)
        //            : (dictOld.ContainsKey(code) ? dictOld[code] : string.Empty);
        //        if (text == string.Empty)
        //        {
        //            continue;
        //        }

        //        if (string.IsNullOrWhiteSpace(item.Name))
        //        {
        //            item.Name = text;
        //        }
        //        else if (item.Name != text)
        //        {
        //            item.Name = text;
        //        }

        //        if (code.StartsWith("LI "))
        //        {
        //            // livsmedium
        //            dest.ImpactedNatureTypes.Remove(item);
        //            dest.Habitats.Add(new FA2023.Habitat()
        //            {
        //                NiNCode = item.NiNCode, Name = item.Name, TimeHorizon = item.TimeHorizon,
        //                StateChange = item.StateChange, AffectedArea = item.AffectedArea,
        //                ColonizedArea = item.ColonizedArea
        //            });
        //        }
        //    }

        //    for (var i = 0; i < dest.RiskAssessment.SpeciesSpeciesInteractions.Count; i++)
        //    {
        //        if (dest.RiskAssessment.SpeciesSpeciesInteractions[i].EffectLocalScale == true)
        //        {
        //            dest.RiskAssessment.SpeciesSpeciesInteractions[i].Scale = "Limited";
        //        }
        //        else
        //        {
        //            dest.RiskAssessment.SpeciesSpeciesInteractions[i].Scale = "Large";
        //        }
        //    }

        //    // flyttet logikken ned til etter at SpeciesNaturetypeInteractions2018 er fylt med innhold
        //    var tempcopy = dest.RiskAssessment.SpeciesNaturetypeInteractions.ToArray();
        //    // må ha en temporær liste siden man ikke kan iterere over en liste og samtidig ta bort element...
        //    foreach (var interaction in tempcopy)
        //    {
        //        var code = interaction.NiNCode;
        //        // checks if the nature type code is in the impacted nature types from 2018 which are not used anymore; if so, set it to a separate list 

        //        if (dest.ImpactedNatureTypesFrom2018.Any(x => x.NiNCode == code))
        //        {
        //            dest.RiskAssessment.SpeciesNaturetypeInteractions2018.Add(interaction);
        //            dest.RiskAssessment.SpeciesNaturetypeInteractions.Remove(interaction);
        //        }
        //    }

        //    for (var i = 0; i < dest.RiskAssessment.SpeciesNaturetypeInteractions.Count; i++)
        //    {
        //        if (dest.RiskAssessment.SpeciesNaturetypeInteractions[i].EffectLocalScale == true)
        //        {
        //            dest.RiskAssessment.SpeciesNaturetypeInteractions[i].Scale = "Limited";
        //        }
        //        else
        //        {
        //            dest.RiskAssessment.SpeciesNaturetypeInteractions[i].Scale = "Large";
        //        }
        //    }

        //    for (var i = 0; i < dest.RiskAssessment.HostParasiteInformations.Count; i++)
        //    {
        //        if (dest.RiskAssessment.HostParasiteInformations[i].EffectLocalScale == true)
        //        {
        //            dest.RiskAssessment.HostParasiteInformations[i].Scale = "Limited";
        //        }
        //        else
        //        {
        //            dest.RiskAssessment.HostParasiteInformations[i].Scale = "Large";
        //        }

        //        if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteNewForHost &&
        //            dest.RiskAssessment.HostParasiteInformations[i].ParasiteIsAlien)
        //        {
        //            dest.RiskAssessment.HostParasiteInformations[i].Status = "NewAlien";
        //        }
        //        else if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteIsAlien)
        //        {
        //            dest.RiskAssessment.HostParasiteInformations[i].Status = "KnownAlien";
        //        }
        //        else if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteNewForHost)
        //        {
        //            dest.RiskAssessment.HostParasiteInformations[i].Status = "NewNative";
        //        }
        //        else
        //        {
        //            dest.RiskAssessment.HostParasiteInformations[i].Status = "KnownNative";
        //        }
        //    }

        //    for (var i = 0; i < dest.RiskAssessment.GeneticTransferDocumented.Count; i++)
        //    {
        //        if (dest.RiskAssessment.GeneticTransferDocumented[i].EffectLocalScale == true)
        //        {
        //            dest.RiskAssessment.GeneticTransferDocumented[i].Scale = "Limited";
        //        }
        //        else
        //        {
        //            dest.RiskAssessment.GeneticTransferDocumented[i].Scale = "Large";
        //        }
        //    }



        //    var test = dest.RiskAssessment.Criteria.Where(x => x.CriteriaLetter == "F").Single();
        //    if (test.UncertaintyValues.Length > 1)
        //    {
        //        test.UncertaintyValues = new[] { 0 };
        //    }

        //    if (src.ImportedToIndoorOrProductionArea)
        //    {
        //        dest.IndoorProduktion = "negative";
        //    }


        //    dest.PreviousAssessments.Add(new FA2023.PreviousAssessment()
        //    {
        //        AssessmentId = src.Id,
        //        RevisionYear = 2018,
        //        RiskLevel = src.RiskAssessment.RiskLevel,
        //        EcologicalRiskLevel = src.RiskAssessment.EcoEffectLevel,
        //        SpreadRiskLevel = src.RiskAssessment.InvationPotentialLevel,
        //        DecisiveCriteria = src.RiskAssessment.DecisiveCriteria,
        //        MainCategory = src.AlienSpeciesCategory,
        //        MainSubCategory = src.AlienSpeciesCategory == "DoorKnocker" ? src.DoorKnockerCategory :
        //            src.AlienSpeciesCategory == "NotApplicable" ? src.NotApplicableCategory :
        //            src.AlienSpeciesCategory == "RegionallyAlien" ? src.RegionallyAlienCategory :
        //            "",
        //        //IsAlienSpecies = dest.IsAlienSpecies,
        //        //ConnectedToAnother = dest.ConnectedToAnother
        //    });
        //    //dest.PreviousAssessments.Add(new FA2023.PreviousAssessment()
        //    //{
        //    //    AssessmentId = src.VurderingId2012.ToString(),
        //    //    RevisionYear = 2012,
        //    //    RiskLevel = src.RiskLevel2012,
        //    //    EcologicalRiskLevel = src.EcologicalRiskLevel2012,
        //    //    SpreadRiskLevel = src.SpreadRiskLevel2012,
        //    //    MainCategory = src.AlienSpeciesCategory2012,
        //    //    MainSubCategory = ""
        //    //});

        //    ConvertHelper.SetHorizonScanningBasedOn2018Assessments(dest);

        //}

        private static List<Tuple<string, string>> DrillDown(JsonArray array, string id = "Id", string text = "Text", string child = "Children")
        {
            var result = new List<Tuple<string, string>>();
            foreach (var node in array)
            {
                result.Add(new Tuple<string, string>(node[id].GetValue<string>(), node[text].GetValue<string>()));
                result.AddRange(DrillDown(node[child].AsArray(), id, text, child));
            }

            return result;
        }
        private static JsonNode? ParseJson(string filen)
        {
            return JsonNode.Parse(File.Exists("../../../.." + filen) ? File.ReadAllText("../../../.." + filen) : File.ReadAllText(".." + filen));
        }

        private static bool IsInt(string src)
        {
            if (string.IsNullOrWhiteSpace(src))
            {
                return false;
            }
            int riskAssessmentYearFirstIndoors;
            return int.TryParse(src, out riskAssessmentYearFirstIndoors);
        }
        private static string GetNotInt(string label, string src)
        {
            if (string.IsNullOrWhiteSpace(src))
            {
                return null;
            }

            return IsInt(src) ? null : label + ":" + src;
        }

        private static long? ParseLong(string str)
        {
            if (long.TryParse(str, out long test))
            {
                return test;
            } 
            return null;
        }

        private static double? ParseDouble(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
            {
                return null;
            }
            var currencyDecimalSeparator = Thread.CurrentThread.CurrentCulture.NumberFormat.CurrencyDecimalSeparator;
            str = str.Replace(",", currencyDecimalSeparator).Replace(".", currencyDecimalSeparator);
            if (double.TryParse(str, out double test))
            {
                return test;
            } 

            switch (str)
            {
                case "> 100 år":
                    return 100;

                case "271 millioner år":
                    return 271000000;

                case "1-2 år":
                    return 1.5;
                    
                case "mer enn 1000 år":
                    return 1000;
                    
                case "40 år":
                    return 40;
                    
                case ">= 650 år":
                    return 650;

                case "60-649":
                    return 354.5;
                    
                case "mer enn én billion år":
                    return 1000000000000000000;

                case ">=650":
                    return 650;
                    
                case "1,5 år":
                    return 1.5;

                case ">1000 år":
                    return 1000;
                    
                case "=> 50 m/år":
                    return 50;

                case ">= 500 m/år":
                    return 500;
                
                default:
                    return null;
            }
        }

        private static float? ParseFloat(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
            {
                return null;
            }
            var currencyDecimalSeparator = Thread.CurrentThread.CurrentCulture.NumberFormat.CurrencyDecimalSeparator;
            str = str.Replace(",", currencyDecimalSeparator).Replace(".", currencyDecimalSeparator);
            if (float.TryParse(str, out float test))
            {
                return test;
            }

            return null;
        }
        
        private static long ParseLongFromNullableInt(int? spreadYearlyIncreaseObservations)
        {
            if (!spreadYearlyIncreaseObservations.HasValue)
            {
                return 0;
            }
            
            return (long)spreadYearlyIncreaseObservations.Value;
        }
    }
}