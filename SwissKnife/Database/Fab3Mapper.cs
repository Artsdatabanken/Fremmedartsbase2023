using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using AutoMapper;
using Prod.Domain;
using Prod.Domain.Legacy;

namespace SwissKnife.Database
{
    public class Fab3Mapper
    {
        private static Dictionary<string, string> expertGroupReplacements = new Dictionary<string, string>()
        {
            { "ExpertGroups/Fisker/S", "Fisker (Svalbard)" },
            { "ExpertGroups/Marineinvertebrater/S", "Marine invertebrater (Svalbard)" },
            { "ExpertGroups/Fugler/S", "Fugler (Svalbard)" },
            { "ExpertGroups/Testedyr/N", "Testedyr" },
            { "ExpertGroups/Karplanter/S", "Karplanter (Svalbard)" },
            { "ExpertGroups/Pattedyr/S", "Pattedyr (Svalbard)" },
            { "ExpertGroups/Fugler/N", "Fugler" },
            { "ExpertGroups/Pattedyr/N", "Pattedyr" },
            { "ExpertGroups/Rundormerogflatormer/N", "Rundormer og flatormer" },
            { "ExpertGroups/Ikkemarineinvertebrater/N", "Ikke-marine invertebrater" },
            { "ExpertGroups/Moser/N", "Moser" },
            { "ExpertGroups/Marineinvertebrater/N", "Marine invertebrater" },
            { "ExpertGroups/Sopper/N", "Sopper" },
            { "ExpertGroups/Alger/N", "Alger" },
            { "ExpertGroups/Karplanter/N", "Karplanter" },
            { "ExpertGroups/Fisker/N", "Fisker" },
            { "ExpertGroups/Amfibierogreptiler/N", "Amfibier og reptiler" }
        };

        public static Mapper CreateMappingFromOldToNew()
        { 
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<FA3Legacy.NaturalOrigin, FA4.NaturalOrigin>();
                cfg.CreateMap<FA3Legacy.RedlistedNatureType, FA4.RedlistedNatureType>()
                    .ForMember(dest => dest.Background, opt => opt.Ignore());
                cfg.CreateMap<FA3Legacy.Reference, FA4.SimpleReference>();
                cfg.CreateMap<FA3Legacy.RegionalRiskAssessment, FA4.RegionalRiskAssessment>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.Criterion, Prod.Domain.RiskAssessment.Criterion>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.HostParasiteInteraction,
                        Prod.Domain.RiskAssessment.HostParasiteInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.Status, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.Interaction, Prod.Domain.RiskAssessment.Interaction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.NaturetypeInteraction,
                        Prod.Domain.RiskAssessment.NaturetypeInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesInteraction,
                        Prod.Domain.RiskAssessment.SpeciesInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesNaturetypeInteraction,
                        Prod.Domain.RiskAssessment.SpeciesNaturetypeInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesSpeciesInteraction,
                        Prod.Domain.RiskAssessment.SpeciesSpeciesInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());

                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment, Prod.Domain.RiskAssessment>()

                    .ForMember(dest => dest.Naturetype2018, opt => opt.Ignore())
                    .ForMember(dest => dest.NaturetypeNIN2, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundC, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundF, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundG, opt => opt.Ignore())
                    .ForMember(dest => dest.AcceptOrAdjustCritA, opt => opt.Ignore())
                    .ForMember(dest => dest.ReasonForAdjustmentCritA, opt => opt.Ignore())
                    .ForMember(dest => dest.Hovedøkosystem, opt => opt.Ignore())

                    .ForMember(dest => dest.FilesDescription, opt => opt.Ignore())

                    .ForMember(dest => dest.StartYear, opt => opt.Ignore())
                    .ForMember(dest => dest.EndYear, opt => opt.Ignore())
                    // todo: delete this section when domain is fixed
                    //.ForMember(dest => dest.ScoreA, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureA, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreB, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureB, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreC, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureC, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreD, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureD, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreE, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureE, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreF, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureF, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreG, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureG, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreH, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureH, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreI, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureI, opt => opt.Ignore())
                    // --------------------------------
                    .ForMember(dest => dest.PossibleLowerCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.natureAffectedAbroadF, opt => opt.Ignore())
                    .ForMember(dest => dest.natureAffectedAbroadG, opt => opt.Ignore())

                    .ForMember(dest => dest.PopulationSize, opt => opt.MapFrom<long>(src => ParseLongFromNullableInt(src.SpreadRscriptSpeciesCount)))
                    .ForMember(dest => dest.GrowthRate, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptPopulationGrowth, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.EnvVariance, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptEnvironmantVariance, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.DemVariance, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptDemographicVariance, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.CarryingCapacity, opt => opt.MapFrom<long?>(src => ParseLong(src.SpreadRscriptSustainabilityK)))
                    .ForMember(dest => dest.ExtinctionThreshold, opt => opt.MapFrom<long?>(src => ParseLong(src.SpreadRscriptQuasiExtinctionThreshold)))
                    .ForMember(dest => dest.MedianLifetimeInput, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadRscriptEstimatedSpeciesLongevity))) //ActiveSpreadRscriptEstimatedSpeciesLongevity?? ChosenSpreadMedanLifespan??
                    .ForMember(dest => dest.MedianLifetime, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeLowerQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeLowerQ, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeUpperQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeUpperQ, opt => opt.Ignore())
                    .ForMember(dest => dest.Occurrences1Best, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseObservations)))
                    .ForMember(dest => dest.Occurrences1Low, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseObservationsLowerQuartile)))
                    .ForMember(dest => dest.Occurrences1High, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseObservationsUpperQuartile)))
                    .ForMember(dest => dest.IntroductionsBest, opt => opt.Ignore())
                    .ForMember(dest => dest.IntroductionsLow, opt => opt.Ignore())
                    .ForMember(dest => dest.IntroductionsHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionSpeedInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionSpeed, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceArea))) // ActiveSpreadYearlyIncreaseOccurrenceArea?? SpreadYearlyIncreaseCalculatedExpansionSpeed?? SpreadYearlyIncreaseObservations??
                    .ForMember(dest => dest.ExpansionLowerQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionLowerQ, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceAreaLowerQuartile)))
                    .ForMember(dest => dest.ExpansionUpperQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionUpperQ, opt => opt.MapFrom<double?>(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceAreaUpperQuartile)))

                    // følgende blir mappet fra FA3Legacy lenger nede
                    .ForMember(dest => dest.AOOknown, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOyear1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOendyear1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOyear2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOendyear2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeHigh, opt => opt.Ignore())

                    .ForMember(dest => dest.Amethod, opt => opt.Ignore())
                    .ForMember(dest => dest.Ascore, opt => opt.Ignore())
                    .ForMember(dest => dest.Alow, opt => opt.Ignore())
                    .ForMember(dest => dest.Ahigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.ApossibleLow, opt => opt.Ignore())
                    .ForMember(dest => dest.ApossibleHigh, opt => opt.Ignore())


                    .ForMember(dest => dest.Bmethod, opt => opt.Ignore())
                    .ForMember(dest => dest.Bscore, opt => opt.Ignore())
                    .ForMember(dest => dest.Blow, opt => opt.Ignore())
                    .ForMember(dest => dest.Bhigh, opt => opt.Ignore())

                    .ForMember(dest => dest.BCritMCount, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritExact, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritP, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritNewObs, opt => opt.Ignore())

                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh, opt => opt.Ignore())
                    
                    .ForMember(dest => dest.YearFirstIndoors, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstIndoorsInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionIndoors, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionIndoorsInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstProductionOutdoors, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstProductionOutdoorsInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionOutdoors, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionOutdoorsInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstEstablishmentProductionArea, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstEstablishmentProductionAreaInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstNature, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstNatureInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionNature, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstReproductionNatureInsecure, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstEstablishedNature, opt => opt.Ignore())
                    .ForMember(dest => dest.YearFirstEstablishedNatureInsecure, opt => opt.Ignore())
                    ;
                //.ForMember(dest => dest., opt => opt.MapFrom(src => src.))



                cfg.CreateMap<Prod.Domain.Legacy.MigrationPathway, Prod.Domain.MigrationPathway>();
                cfg.CreateMap<Prod.Domain.Legacy.MigrationPathwayCode, Prod.Domain.MigrationPathwayCode>();
                cfg.CreateMap<Prod.Domain.Legacy.SpreadHistory, Prod.Domain.SpreadHistory>();
                //cfg.CreateMap<Prod.Domain.Legacy.Kode, Prod.Domain.Kode>();
                //cfg.CreateMap<Prod.Domain.Legacy.KodeGrupper, Prod.Domain.KodeGrupper>();
                cfg.CreateMap<Prod.Domain.Legacy.RedlistedNatureTypeCode, Prod.Domain.RedlistedNatureTypeCode>();
                cfg.CreateMap<Prod.Domain.Legacy.RedlistedNatureTypeCodeGroup, Prod.Domain.RedlistedNatureTypeCodeGroup>();
                
                cfg.CreateMap<Prod.Domain.Legacy.RegionalPresence, Prod.Domain.RegionalPresence>();
                cfg.CreateMap<Prod.Domain.Legacy.RegionalPresenceWithPotential, Prod.Domain.RegionalPresenceWithPotential>();
                cfg.CreateMap<FA3Legacy.ImpactedNatureType, FA4.ImpactedNatureType>()
                    .ForMember(dest => dest.Background, opt => opt.Ignore())
                    .ForMember(dest => dest.NatureTypeArea, opt => opt.Ignore());
                cfg.CreateMap<FA3Legacy.TimeAndPlace, FA4.TimeAndPlace>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablished, FA4.ObservedAndEstablished>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablishedInCountry, FA4.ObservedAndEstablishedInCountry>();
                cfg.CreateMap<FA3Legacy, FA4>()
                    .ForMember(dest => dest.IsAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.IsAlienSpecies, opt => opt.Ignore())
                    .ForMember(dest => dest.IsRegionallyAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.Connected, opt => opt.Ignore())
                    .ForMember(dest => dest.ConnectedToAnother, opt => opt.Ignore())
                    .ForMember(dest => dest.SpeciesStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.AssumedReproducing50Years, opt => opt.Ignore())
                    .ForMember(dest => dest.ProductionSpecies, opt => opt.Ignore())
                    .ForMember(dest => dest.ConnectedTaxon1, opt => opt.Ignore())
                    .ForMember(dest => dest.ConnectedTaxon2, opt => opt.Ignore())
                    .ForMember(dest => dest.ChangedFromAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.ChangedAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.ReasonForChangeOfCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.IndoorProduktion, opt => opt.Ignore())
                    .ForMember(dest => dest.LastUpdatedBy, opt => opt.MapFrom(src => src.SistOppdatertAv))
                    .ForMember(dest => dest.LastUpdatedAt, opt => opt.MapFrom(src => src.SistOppdatert))
                    .ForMember(dest => dest.LockedForEditAt,
                        opt => opt.MapFrom(src => src.SistOppdatert)) // må ha dato - bruker en kjent en
                    .ForMember(dest => dest.LockedForEditBy, opt => opt.Ignore())
                    .ForMember(dest => dest.LockedForEditByUserId, opt => opt.Ignore())
                    .ForMember(dest => dest.EvaluationStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.TaxonHierarcy, opt => opt.Ignore())
                    .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                    //.ForMember(dest => dest.VurderingId2018, opt => opt.MapFrom(src => src.Id))
                    .ForMember(dest => dest.HorizonDoScanning, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonScanningStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEcologicalEffect, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEcologicalEffectDescription, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEstablismentPotential, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEstablismentPotentialDescription, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadAreaInChangedNature, opt => opt.Ignore())
                    .ForMember(dest => dest.SpeciesEstablishmentCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.Id, opt => opt.Ignore()) // primærnøkkel
                    .ForMember(dest =>dest.PreviousAssessments, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.Fylkesforekomster, opt => opt.Ignore())
                    .ForMember(dest => dest.TaxonomicHistory, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ImportInfo, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.EvaluatedScientificNameRank, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartAdded, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartRemoved, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartSelectionGeometry, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.Habitats, opt => opt.Ignore())  // ny av året
                    .AfterMap((src, dest) =>
                    {
                        // set some standard values
                        dest.EvaluationStatus = "imported";
                        dest.HorizonScanningStatus = "notStarted";
                        dest.TaxonHierarcy = "";
                        dest.IsDeleted = false;
                        if (string.IsNullOrWhiteSpace(dest.ExpertGroup) && !string.IsNullOrWhiteSpace(src.ExpertGroupId) && expertGroupReplacements.ContainsKey(src.ExpertGroupId))
                        {
                            dest.ExpertGroup = expertGroupReplacements[src.ExpertGroupId];
                        }

                        dest.PreviousAssessments.Add(new FA4.PreviousAssessment()
                        {
                            AssessmentId = src.Id,
                            RevisionYear = 2018,
                            RiskLevel = src.RiskAssessment.RiskLevel,
                            EcologicalRiskLevel = src.RiskAssessment.EcoEffectLevel,
                            SpreadRiskLevel = src.RiskAssessment.InvationPotentialLevel,
                            MainCategory = src.AlienSpeciesCategory,
                            MainSubCategory = src.AlienSpeciesCategory == "DoorKnocker" ? src.DoorKnockerCategory :
                                src.AlienSpeciesCategory == "NotApplicable" ? src.NotApplicableCategory:
                                src.AlienSpeciesCategory == "RegionallyAlien" ? src.RegionallyAlienCategory:
                                ""
                        });
                        dest.PreviousAssessments.Add(new FA4.PreviousAssessment()
                        {
                            AssessmentId = src.VurderingId2012.ToString(),
                            RevisionYear = 2012,
                            RiskLevel = src.RiskLevel2012,
                            EcologicalRiskLevel = src.EcologicalRiskLevel2012,
                            SpreadRiskLevel = src.SpreadRiskLevel2012,
                            MainCategory = src.AlienSpeciesCategory2012,
                            MainSubCategory = ""
                        });

                        ConvertHelper.SetHorizonScanningBasedOn2018Assessments(dest);

                        // hentet fra det under - slik mapping fungerer ikke - da de blir kallt via convention - og det er ingen tilfeller der den har behov for å mappe fra FA3Legacy til Prod.Domain.RiskAssessment - koden blir ikke kallt
                        dest.RiskAssessment.AOOknown = src.CurrentExistenceArea;
                        dest.RiskAssessment.AOOtotalBest = src.CurrentExistenceAreaCalculated;
                        dest.RiskAssessment.AOOtotalLow = src.CurrentExistenceAreaLowCalculated;
                        dest.RiskAssessment.AOOtotalHigh = src.CurrentExistenceAreaHighCalculated;
                        dest.RiskAssessment.AOO50yrBest = src.PotentialExistenceArea;
                        dest.RiskAssessment.AOO50yrLow = src.PotentialExistenceAreaLowQuartile;
                        dest.RiskAssessment.AOO50yrHigh = src.PotentialExistenceAreaHighQuartile;

                        dest.RiskAssessment.AOOdarkfigureBest = ParseFloat(src.CurrentExistenceAreaMultiplier);
                        dest.RiskAssessment.AOOdarkfigureHigh = ParseFloat(src.CurrentExistenceAreaHighMultiplier);
                        dest.RiskAssessment.AOOdarkfigureLow = ParseFloat(src.CurrentExistenceAreaLowMultiplier);

                        dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes = src.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;

                        if (!string.IsNullOrWhiteSpace(src.RegionalPresenceKnown))
                        {
                            var elements = src.RegionalPresenceKnown.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State0 = 1;
                                    match.State1 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        if (!string.IsNullOrWhiteSpace(src.RegionalPresenceAssumed))
                        {
                            var elements = src.RegionalPresenceAssumed.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State1 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        if (!string.IsNullOrWhiteSpace(src.RegionalPresencePotential))
                        {
                            var elements = src.RegionalPresencePotential.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State3 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        foreach (var item in dest.Fylkesforekomster)
                        {
                            if (item.State0 == 0 && item.State1 == 00 && item.State3 == 0)
                            {
                                item.State2 = 1;
                            }
                            else
                            {
                                item.State2 = 0;
                            }
                        }
                        //                    "RegionalPresenceKnown": "St",
                        //"RegionalPresenceAssumed": "",
                        //"RegionalPresencePotential": "Ro,Ho,Sf,Mr,St",


                        switch (src.AlienSpeciesCategory)
                        {
                            case "AlienSpecie":
                            case "DoorKnocker":
                            case "RegionallyAlien":
                            case "EcoEffectWithoutEstablishment":
                                dest.IsAlienSpecies = true;
                                break;
                            case "NotApplicable":
                                if (src.NotApplicableCategory != "notAlienSpecie")
                                {
                                    dest.IsAlienSpecies = true;
                                }

                                if (src.NotApplicableCategory == "taxonIsEvaluatedInHigherRank")
                                {
                                    dest.ConnectedToAnother = true;
                                }

                                if (src.NotApplicableCategory == "traditionalProductionSpecie")
                                {
                                    dest.ProductionSpecies = true;
                                }

                                if (src.NotApplicableCategory == "establishedBefore1800")
                                {
                                    dest.AlienSpecieUncertainIfEstablishedBefore1800 = true;
                                    dest.IsAlienSpecies = true;
                                    dest.ConnectedToAnother = false;
                                }

                                break;
                        }

                        if (src.AlienSpeciesCategory == "AlienSpecie" || src.AlienSpeciesCategory == "DoorKnocker")
                        {
                            dest.AlienSpecieUncertainIfEstablishedBefore1800 = false;
                        }

                        if (src.AlienSpeciesCategory == "RegionallyAlien")
                        {
                            dest.IsRegionallyAlien = true;
                        }

                        for (var i = 0; i < dest.RiskAssessment.SpeciesSpeciesInteractions.Count; i++)
                        {
                            if (dest.RiskAssessment.SpeciesSpeciesInteractions[i].EffectLocalScale == true)
                            {
                                dest.RiskAssessment.SpeciesSpeciesInteractions[i].Scale = "Limited";
                            }
                            else
                            {
                                dest.RiskAssessment.SpeciesSpeciesInteractions[i].Scale = "Large";
                            }
                        }

                        for (var i = 0; i < dest.RiskAssessment.SpeciesNaturetypeInteractions.Count; i++)
                        {
                            if (dest.RiskAssessment.SpeciesNaturetypeInteractions[i].EffectLocalScale == true)
                            {
                                dest.RiskAssessment.SpeciesNaturetypeInteractions[i].Scale = "Limited";
                            }
                            else
                            {
                                dest.RiskAssessment.SpeciesNaturetypeInteractions[i].Scale = "Large";
                            }
                        }

                        for (var i = 0; i < dest.RiskAssessment.HostParasiteInformations.Count; i++)
                        {
                            if (dest.RiskAssessment.HostParasiteInformations[i].EffectLocalScale == true)
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Scale = "Limited";
                            }
                            else
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Scale = "Large";
                            }

                            if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteNewForHost && dest.RiskAssessment.HostParasiteInformations[i].ParasiteIsAlien)
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Status = "NewAlien";
                            }
                            else if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteIsAlien)
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Status = "KnownAlien";
                            }
                            else if (dest.RiskAssessment.HostParasiteInformations[i].ParasiteNewForHost)
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Status = "NewNative";
                            }
                            else
                            {
                                dest.RiskAssessment.HostParasiteInformations[i].Status = "KnownNative";
                            }
                        }

                        for (var i = 0; i < dest.RiskAssessment.GeneticTransferDocumented.Count; i++)
                        {
                            if (dest.RiskAssessment.GeneticTransferDocumented[i].EffectLocalScale == true)
                            {
                                dest.RiskAssessment.GeneticTransferDocumented[i].Scale = "Limited";
                            }
                            else
                            {
                                dest.RiskAssessment.GeneticTransferDocumented[i].Scale = "Large";
                            }
                        }

                        dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes = dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.HasValue == false
                            ? 0
                            :
                            dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value > 95 ? 95
                                :
                                dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value > 75 ? 75
                                    :
                                    dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value >= 25 ? 25
                                        :
                                        dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes.Value >= 5 ? 5 : 0;

                        // issue #346
                        if (!string.IsNullOrWhiteSpace(src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time))
                        {
                            var riskAssessmentYearFirstIndoors = int.Parse(src.ObservedAndEstablishedStatusInCountry.Indoor.ObservedInCountry.Time);
                            dest.RiskAssessment.YearFirstIndoors = riskAssessmentYearFirstIndoors;
                        }
                        
                    });

                // - slik mapping fungerer ikke - da de blir kallt via convention - og det er ingen tilfeller der den har behov for å mappe fra FA3Legacy til Prod.Domain.RiskAssessment - koden blir ikke kallt
                //cfg.CreateMap<FA3Legacy, Prod.Domain.RiskAssessment>()
                //    .ForMember(dest => dest.AOOknown, opt => opt.MapFrom(src => src.CurrentExistenceArea))
                //    .ForMember(dest => dest.AOOtotalBest, opt => opt.MapFrom(src => src.CurrentExistenceAreaCalculated))
                //    .ForMember(dest => dest.AOOtotalLow,
                //        opt => opt.MapFrom(src => src.CurrentExistenceAreaLowCalculated))
                //    .ForMember(dest => dest.AOOtotalHigh,
                //        opt => opt.MapFrom(src => src.CurrentExistenceAreaHighCalculated))
                //    .ForMember(dest => dest.AOO50yrBest, opt => opt.MapFrom(src => src.PotentialExistenceArea))
                //    .ForMember(dest => dest.AOO50yrLow,
                //        opt => opt.MapFrom(src => src.PotentialExistenceAreaLowQuartile))
                //    .ForMember(dest => dest.AOO50yrHigh,
                //        opt => opt.MapFrom(src => src.PotentialExistenceAreaHighQuartile))
                //    .ForMember(dest => dest.AOOyear1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOendyear1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOyear2, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOendyear2, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOO1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOO2, opt => opt.Ignore())
                //    .ForMember(dest => dest.StartYear, opt => opt.Ignore())
                //    .ForMember(dest => dest.EndYear, opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes,
                //        opt => opt.MapFrom(src => src.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes))
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest,
                //        opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow,
                //        opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh,
                //        opt => opt.Ignore())
                //    .ForAllOtherMembers(opt => opt.Ignore());



            });
            mapperConfig.AssertConfigurationIsValid();
            var mapper = new Mapper(mapperConfig);
            return mapper;
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