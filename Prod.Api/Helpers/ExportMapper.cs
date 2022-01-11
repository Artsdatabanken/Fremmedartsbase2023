using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CsvHelper.Configuration.Attributes;
using Prod.Domain;
using Prod.Domain.Legacy;

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
                cfg.CreateMap<FA4WithComments, FA4Export>()
                    //.ForMember(x => x.DoorKnockerType, opt => opt.MapFrom(src => GetDoorknockerType(src)))
                    ;
            });
            var mapper = new Mapper(mapperConfig);
            return mapper;
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
        public string ExpertGroup { get; set; }
        public string EvaluationContext { get; set; }        
        public bool IsEvaluated { get; set; }  // ???
        //public bool IsDeleted { get; set; }
        public string EvaluationStatus { get; set; }

        public string TaxonHierarcy { get; set; }

        //public Datasett Datasett { get; set; } = new Datasett();
        public string EvaluatedScientificNameRank { get; set; }
        //public string DoorKnockerType { get; set; }

        public string EvaluatedScientificNameId { get; set; }


        public string EvaluatedScientificName { get; set; }

        public string EvaluatedVernacularName { get; set; }
        public string EvaluatedScientificNameAuthor { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        [Name("SistOppdatertAv")]
        public string LastUpdatedBy { get; set; }
        

        public int TaxonId { get; set; }

        public string Citation { get; set; }
        public string AlienSpeciesCategory { get; set; }
        //public List<string> ReasonForChangeOfCategory { get; set; } = new List<string>();

        public DateTime LockedForEditAt { get; set; }
        public string LockedForEditBy { get; set; }

        // (3.1) Artens status{
        public string AlienSpeciesCategory2012 { get; set; } // added 10.01.2017
        public string DoorKnockerDescription { get; set; } // fab: Door_Knocker_Description
        public string NotReproductiveDescription2012 { get; set; } // fab: Not_Reproductive_Description 
        public string NotReproductiveFutureDescription2012 { get; set; } // fab: Not_Reproductive_Future_Description
        public string AssesmentNotApplicableDescription { get; set; } // fab: Assesment_Not_Applicable_Description

        public bool? IsAlienSpecies { get; set; }

        public string IsAlien { get; set; } // new in 2021
        public bool? IsRegionallyAlien { get; set; }

        public bool? ConnectedToAnother { get; set; }

        public string Connected { get; set; }

        public string SpeciesStatus { get; set; }

        public string ConnectedTaxon1 { get; set; } = "";

        public string ConnectedTaxon2 { get; set; } = "";

        public bool? ProductionSpecies { get; set; } = false;

        public string ChangedFromAlien { get; set; }

        public string ChangedAssessment { get; set; }

        public bool? AlienSpecieUncertainIfEstablishedBefore1800 { get; set; } // lagt til: 19.10.2016 - renamed 15.11.2016
        public bool AlienSpecieUncertainAntropochor { get; set; } // lagt til: 19.10.2016
        public string AlienSpecieUncertainDescription { get; set; } // lagt til: 22.12.2016

        public bool SkalVurderes { get; set; }

        //public string EtableringsmulighetINorge { get; set; } // lagt til 22.08.2016 //fjernet 25.08.2016
        public string DoorKnockerCategory { get; set; } // lagt til 25.08.2016 // fjernet 14.12.2016 // lagt til 21.12.2016
        public string RegionallyAlienCategory { get; set; } // lagt til 25.08.2016
        public string NotApplicableCategory { get; set; } // lagt til 25.08.2016
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

        // todo: fylkesforekomster...

        // (3.2) Artsegenskaper
    
        //public string LimnicTerrestrialMarine { get; set; } // lagt til 2.9.2016 // fjernet 26.09.2016
        public bool Limnic { get; set; } // lagt til 26.9.2016
        public bool Terrestrial { get; set; } // lagt til 26.9.2016
        public bool Marine { get; set; } // lagt til 26.9.2016
        public bool BrackishWater { get; set; } // lagt til 26.9.2017 (for sfab)

        public string FirstDomesticObservation { get; set; } // fab: First_Domestic_Observation
        public string FirstDomesticObservationLocation { get; set; } // fab: First_Domestic_Observation_Location
        public string FirstDomesticEstablishmentObserved { get; set; } // fab: First_Domestic_Observed_Establishment
        public string FirstDomesticEstablishmentObservedLocation { get; set; } // fab: First_Domestic_Observed_Establishment_Location


        public List<string> ArrivedCountryFrom { get; set; } = new List<string>(); // fab: string Arived_Norway_From_Code
        public string ArrivedCountryFromDetails { get; set; } = ""; // fab: Natural_Origin 'NaturalOrigin'  - lagt til 14.11.2016


        //public List<NaturalOrigin> NaturalOrigins { get; set; } = new List<NaturalOrigin>(); // lagt til 09.01.2017
        public string NaturalOriginUnknownDocumentation { get; set; }
        //public List<NaturalOrigin> CurrentInternationalExistenceAreas { get; set; } = new List<NaturalOrigin>(); // lagt til 09.01.2017
        public string CurrentInternationalExistenceAreasUnknownDocumentation { get; set; }

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

        public List<string> NaturalOriginMarine { get; set; } = new List<string>(); // lagt til 05.09.2016
        public string NaturalOriginMarineDetails { get; set; } // lagt til 21.04.2017
        public List<string> CurrentInternationalExistenceMarineAreas { get; set; } = new List<string>(); // lagt til 05.09.2016
        public string CurrentInternationalExistenceMarineAreasDetails { get; set; } // lagt til 21.04.2017

        public bool SurvivalBelow5c { get; set; } // lagt til 27.09.2016

        public List<string> IntroductionCourse { get; set; } // fab: List<int> Introduction_Course  //Årsak til tilstedeværelse

        public bool? DomesticRiskEvaluationExists { get; set; } // fab: Domestic_RiskEvaluation_Exists
        public bool? DomesticRiskEvaluationExists2007 { get; set; } // lagt til 26.09.2016
        public bool? ForeignRiskEvaluationExists { get; set; } // fab: Foreign_RiskEvaluation_Exists_Exists
        public string ForeignRiskEvaluationComment { get; set; } // fab: Foreign_RiskEvaluation_Comment

        public string Regeneration { get; set; } // fab: Regeneration
        public int? RegenerationYears { get; set; } // fab: Regeneration_Years
        public string Reproduction { get; set; } // fab: Reproduction
        public bool? ReproductionAsexual { get; set; } // fab: Reproduction_Asexual
        public double? ReproductionGenerationTime { get; set; } // fab: Reproduction_Geteration_Time
        public bool? ReproductionSexual { get; set; } // fab: Reproduction_Sexual
        //public string ReproductiveCapability { get; set; } // fab: Int64? Reproductive_Capability // removed 17.01.2017
        public bool? SimilarDemographicComparison { get; set; } // fab: Similar_Demographic_Comparison



        //Ikke-vurderte effekter  - Har vi disse fra 2012?
        public string HealthEffects { get; set; } // lagt til 31.08.2016
        public string EconomicEffects { get; set; } // lagt til 31.08.2016
        //public string EcosystemServiceEffects { get; set; } // lagt til 31.08.2016 // fjernet 16.09.2016
        public List<string> EcosystemServiceEffectsBasicLifeProcesses { get; set; } = new List<string>(); // lagt til 02.09.2016
        public List<string> EcosystemServiceEffectsProvisioningServices { get; set; } = new List<string>(); // lagt til 02.09.2016
        public List<string> EcosystemServiceEffectsRegulatingServices { get; set; } = new List<string>(); // lagt til 02.09.2016
        public List<string> EcosystemServiceEffectsHumanSpiritualServices { get; set; } = new List<string>(); // :-) // lagt til 02.09.2016
        public string PositiveEcologicalEffects { get; set; } // lagt til 31.08.2016
        public string EffectsOnPopulationOfOrigin { get; set; } // lagt til 31.08.2016

        // OsA, He, Fi
        public string RegionalPresenceKnown { get; set; }
        public string RegionalPresenceAssumed { get; set; }
        public string RegionalPresencePotential { get; set; }
        // slutt artsegenskaper


        //// (3.3) Import
        //public List<MigrationPathway> ImportPathways { get; set; } = new List<MigrationPathway>();
        public bool ImportedToIndoorOrProductionArea { get; set; } = false;

        public string IndoorProduktion { get; set; }
        // (3.4) Spredningsveier
        //public List<MigrationPathway> AssesmentVectors { get; set; } = new List<MigrationPathway>(); // lagt til 09.01.2017
        public string Vector { get; set; }  // ???!!

        // (3.5) Spredningshistorikk
        //public List<SpreadHistory> SpreadHistory { get; set; } = new List<SpreadHistory>();

        //[DisplayName("Fremtidig spredningsprognose i Norge, inkl. potensielt utbredelsesområde, antatte kritiske parametre for arten, og forventede endringer i disse:")] // 
        public string SpreadHistoryDomesticDocumentation { get; set; } // fab: SpreadHistoryDomesticDocumentation
        //[DisplayName("Detaljinformasjon for Naturtyper:")] // 
        public string SpreadHistoryForeignDocumentation { get; set; } // fab: SpreadHistoryForeignDocumentation

        //public bool? FutureDistributionChangeExpected { get; set; } // fab: Future_Distribution_Change_Expected // ikke i bruk i 2012
        public string FutureDistributionChangeExpectedDescription { get; set; } // fab: Future_Distribution_Change_Expected_Description
        public string FutureDistributionCriticalParameters { get; set; } // fab: Future_Distribution_Critical_Parameters

        public Int64? PotentialAreaDistribution { get; set; } // fab: Potential_Area_Distribution -  ikke i bruk?
        public string PotentialAreaDistributionInTheFuture { get; set; } // fab: Potential_Area_Distribution_Future_Future @steinho - ikke i bruk?



        public Int64? CurrentIndividualCount { get; set; }
        public Int64? CurrentIndividualCountLowCalculated { get; set; }
        public string CurrentIndividualCountLowMultiplier { get; set; }
        public Int64? CurrentIndividualCountCalculated { get; set; }
        public string CurrentIndividualCountMultiplier { get; set; }
        public string CurrentIndividualCountHighMultiplier { get; set; }
        public Int64? CurrentIndividualCountHighCalculated { get; set; }

        public Int64? CurrentSpreadArea { get; set; }
        //public Int64? CurrentSpreadAreaLowMultiplier { get; set; }
        //public Int64? CurrentSpreadAreaHighMultiplier { get; set; }
        //public Int64? CurrentSpreadAreaMultiplier { get; set; }
        public Int64? CurrentSpreadAreaLowCalculated { get; set; }
        public Int64? CurrentSpreadAreaHighCalculated { get; set; }
        public Int64? CurrentSpreadAreaCalculated { get; set; }

        public string CurrentPresenceComment { get; set; }

        public string SpreadAreaInChangedNature { get; set; }

        public string SpeciesEstablishmentCategory { get; set; }

        // (4) Naturtyper
        //public List<ImpactedNatureType> ImpactedNatureTypes { get; set; } = new List<ImpactedNatureType>();

        //public List<RedlistedNatureType> RedlistedNatureTypes { get; set; } = new List<RedlistedNatureType>(); //lagt til 18.11.2016

        //public List<Habitat> Habitats { get; set; } = new List<Habitat>();

        //public string SpeciesNatureTypesDetails { get; set; } // fab: SpeciesNatureTypesDetails // removed 03.11.2016

        public bool UsesLivingSpeciesAsHabitat { get; set; }
        public string UsesLivingSpeciesAsHabitatScientificName { get; set; }

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
        [Name("DatoForSisteKommentar")]
        public string NewestCommentDate { get; set; }

        [Name("AntallBehandledeKommentarer")]
        public int CommentClosed { get; set; }

        [Name("AntallÅpneKommentarer")]
        public int CommentOpen { get; set; }
        //public int CommentNew { get; set; }

        [Name("VentendeTaksonomiskeEndringer")]
        public int TaxonChange { get; set; }

    }
}
