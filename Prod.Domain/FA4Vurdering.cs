using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Prod.Domain
{
    //public class VelgArtInfo
    //{
    //    public string TaxonId { get; set; }
    //    public string VurderingsContext { get; set; }
    //    public string Ekspertgruppe { get; set; }
    //}
    //public class NyVurderingsInfo
    //{
    //    //public string VurderingId { get; set; }
    //    public string ScientificName { get; set; }
    //    public int ScientificNameId { get; set; }
    //    public int TaxonId { get; set; }
    //    public string Author { get; set; }
    //    //public string VernacularName { get; set; }
    //    public string TaxonRank { get; set; }   // "Species" or "SupSpecies"
    //    public string VurderingsContext { get; set; } // not set in the request, but used in the process of validate the creation of new vurdering // not needed becauso ekspertgruppe contains context - no need to validate
    //    //public string VurderingsStatus { get; set; }
    //    public string Ekspertgruppe { get; set; } // vurderingscontext is derived from Ekspertgruppe
    //    public DateTime SistOppdatert { get; set; }
    //    public string SistOppdatertAv { get; set; }
    //    //public string Kategori { get; set; }

    //    //public Guid[] References { get; set; }
    //}

    public partial class FA4 // () Id-informjosjon
    {
        public static FA4 CreateNewFA4()
        {
            var newfa = new FA4();
            newfa.initNaturalOrigins();
            newfa.RiskAssessment.Criteria = RiskAssessment.CreateDefaultCriteria();
            return newfa;
        }

        public int Id { get; set; }
        public string VurderingId2018 { get; set; }
        public int VurderingId2012 { get; set; }
        public int RiskLevel2012 { get; set; }
        public int SpreadRiskLevel2012 { get; set; }
        public int EcologicalRiskLevel2012 { get; set; }

        public string EvaluationContext { get; set; }

        //public string ExpertGroupId { get; set; } // removed sah 20210502

        //public Taxon Taxon { get; set; }
        public int TaxonId { get; set; }
        public string ExpertGroup { get; set; }
        //public string EvaluationGroup { get; set; } // slettet 06.12.2016 - this is propably connected to databank grouping in 2012, we will propably see this resurface for the next Databank application!
        //public string EvaluationCategory { get; set; } // slettet 10.01.2017

        public string Citation { get; set; }
        public string AlienSpeciesCategory { get; set; } 
        //public string Alien_Specie_Category { get; set; }

        //public Int64? ScientificNameId { get; set; }
        //public string ScientificName { get; set; }


        public string VurderingsStatus { get; set; }

        //public string SpeciesName { get; set; } // fab: SpeciesName // Brukes 'over alt' i 2012 - toooodo: bør kunne klare oss uten?
        public List<string> ReasonForChangeOfCategory { get; set; } = new List<string>();
        public DateTime LastUpdatedAt { get; set; }
        public string LastUpdatedBy { get; set; }
        public DateTime LockedForEditAt { get; set; }
        public string LockedForEditBy { get; set; }
        public bool IsEvaluated { get; set; }  // ???
        public bool IsDeleted { get; set; }
        public string EvaluationStatus { get; set; }

        /// <summary>
        /// Scientific name Id (from Artsnavnebase) used for Risk Evaluation (at the time of evaluation)
        /// </summary>
        public int? EvaluatedScientificNameId { get; set; }

        /// <summary>
        /// Scientific name used for Risk Evaluation (at the time of evaluation)
        /// </summary>
        public string EvaluatedScientificName { get; set; }
        public string EvaluatedScientificNameAuthor { get; set; } //added 23.08.2017
        public string EvaluatedVernacularName { get; set; } //added 29.09.2017

        public string TaxonHierarcy { get; set; }

        //public string VurdertVitenskapeligNavn { get; set; }

        //        public string SynonymSpecies_________ { get; set; } // fab: Synonym_Species

        public Datasett Datasett { get; set; } = new Datasett();
    }

    public partial class FA4 // Horisontskanning
    {
        /// <summary>
        /// If true this assessment is marked for horizon scanning prior to risk assessment
        /// </summary>
        public bool HorizonDoScanning { get; set; } = false;
        public string HorizonEstablismentPotential { get; set; }
        public string HorizonEstablismentPotentialDescription { get; set; } = "";
        public string HorizonEcologicalEffect { get; set; }
        public string HorizonEcologicalEffectDescription { get; set; } = "";
    }




    public partial class FA4 // (3.1) Artens status
    {
        public string AlienSpeciesCategory2012 { get; set; } // added 10.01.2017
        public string DoorKnockerDescription { get; set; } // fab: Door_Knocker_Description
        public string NotReproductiveDescription2012 { get; set; } // fab: Not_Reproductive_Description 
        public string NotReproductiveFutureDescription2012 { get; set; } // fab: Not_Reproductive_Future_Description
        public string AssesmentNotApplicableDescription { get; set; } // fab: Assesment_Not_Applicable_Description

        public bool IsAlienSpecies { get; set; }

        public bool ConnectedToAnother { get; set; }

        public string SpeciesStatus { get; set; }

        public bool AlienSpecieUncertainIfEstablishedBefore1800 { get; set; } // lagt til: 19.10.2016 - renamed 15.11.2016
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

        public class TimeAndPlace
        {
            public string Place { get; set; }
            public string Time { get; set; }
        }
        public class ObservedAndEstablished
        {
            public TimeAndPlace ObservedInCountry { get; set; } = new TimeAndPlace();
            public TimeAndPlace FertileSpecimenObserved { get; set; } = new TimeAndPlace();
            public TimeAndPlace Established { get; set; } = new TimeAndPlace();
            public TimeAndPlace Population { get; set; } = new TimeAndPlace();
            public string SpecimenCount { get; set; } // lagt til 26.09.2016
        }
        public class ObservedAndEstablishedInCountry
        {
            public ObservedAndEstablished Indoor { get; set; } = new ObservedAndEstablished();
            public ObservedAndEstablished ProductionArea { get; set; } = new ObservedAndEstablished();
            public ObservedAndEstablished NorwegianNature { get; set; } = new ObservedAndEstablished();
        }
        public ObservedAndEstablishedInCountry ObservedAndEstablishedStatusInCountry { get; set; } = new ObservedAndEstablishedInCountry(); // lagt til 30.08.2016 //
    }
    public partial class FA4 // (3.2) Artsegenskaper
    {
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
        //public string ArivedNorwayFromOther { get; set; } // fab: Arived_Norway_From_Otherm_Other - slettet 14.11.2016

        //public string NaturalOrigin { get; set; } // fab: Natural_Origin // slettet 1.9.2016
        //public List<string> NaturalOriginCodeItems { get; set; } // fab: List<int> Natural_Origin_Code // slettet 1.9.2016
        //public bool? NaturalOriginIsUnknown { get; set; } // fab: Natural_Origin_UnknownUnknown // slettet 1.9.2016

        public class NaturalOrigin
        {
            public string ClimateZone { get; set; }
            //public string ClimateZoneSubtype { get; set; }
            public bool Europe { get; set; }
            public bool Asia { get; set; }
            public bool Africa { get; set; }
            public bool Oceania { get; set; }
            public bool NorthAndCentralAmerica { get; set; }
            public bool SouthAmerica { get; set; }
        }

        public List<NaturalOrigin> NaturalOrigins { get; set; } = new List<NaturalOrigin>(); // lagt til 09.01.2017
        public string NaturalOriginUnknownDocumentation { get; set; }
        public List<NaturalOrigin> CurrentInternationalExistenceAreas { get; set; } = new List<NaturalOrigin>(); // lagt til 09.01.2017
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


        public void initNaturalOrigins()
        {
            //NaturalOrigins = createDefaultNaturalOrigins();
            //NaturalOrigins = new List<NaturalOrigin> {
            //    new NaturalOrigin() {ClimateZone = "polart",             ClimateZoneSubtype="inkl alpint",     Europe=false,Asia=false,Africa=null, Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "temperert",          ClimateZoneSubtype="boreal",          Europe=false,Asia=false,Africa=null, Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "temperert",          ClimateZoneSubtype="nemoral",         Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "temperert",          ClimateZoneSubtype="tørt",            Europe=false,Asia=false,Africa=null, Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "subtropisk",         ClimateZoneSubtype="Middelhavsklima", Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "subtropisk",         ClimateZoneSubtype="fuktig",          Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "subtropisk",         ClimateZoneSubtype="tørt",            Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "subtropisk",         ClimateZoneSubtype="høydeklima",      Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "subtropisk/tropisk", ClimateZoneSubtype="kappregionen",    Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
            //    new NaturalOrigin() {ClimateZone = "tropisk",            ClimateZoneSubtype="",                Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false }
            //};

            NaturalOrigins = new List<NaturalOrigin> {
                new NaturalOrigin() {ClimateZone = "polar;",                  Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "temperate;boreal",        Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "temperate;nemoral",       Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "temperate;dry",           Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;unspecified",   Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;mediterranean", Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;humid",         Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;dry",           Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;caperegion",    Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;highlands",     Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "tropic;",                 Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "unknown;",                Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false }
            };



            //CurrentInternationalExistenceAreas = createDefaultNaturalOrigins();
            CurrentInternationalExistenceAreas = new List<NaturalOrigin> {
                new NaturalOrigin() {ClimateZone = "polar;",                  Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "temperate;boreal",        Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "temperate;nemoral",       Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "temperate;dry",           Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;unspecified",   Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;mediterranean", Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;humid",         Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;dry",           Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;caperegion",    Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "subtropic;highlands",     Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "tropic;",                 Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false },
                new NaturalOrigin() {ClimateZone = "unknown;",                Europe=false,Asia=false,Africa=false,Oceania=false,NorthAndCentralAmerica=false,SouthAmerica=false }
            };
        }
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
        [JsonConverter(typeof(CustomDoubleFormatConverter))]
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
        public string RegionalPresenceKnown;
        public string RegionalPresenceAssumed;
        public string RegionalPresencePotential;
    }
    public partial class FA4 // (3.3) Import
    {
        public List<MigrationPathway> ImportPathways { get; set; } = new List<MigrationPathway>();
        public bool ImportedToIndoorOrProductionArea { get; set; } = false;
    }
    public partial class FA4 // (3.4) Spredningsveier
    {
        public List<MigrationPathway> AssesmentVectors { get; set; } = new List<MigrationPathway>(); // lagt til 09.01.2017
        public string Vector { get; set; }  // ???!!
    }
    public partial class FA4 // (3.5) Spredningshistorikk
    {
        public List<SpreadHistory> SpreadHistory { get; set; } = new List<SpreadHistory>();

        //[DisplayName("Fremtidig spredningsprognose i Norge, inkl. potensielt utbredelsesområde, antatte kritiske parametre for arten, og forventede endringer i disse:")] // 
        public string SpreadHistoryDomesticDocumentation { get; set; } // fab: SpreadHistoryDomesticDocumentation
        //[DisplayName("Detaljinformasjon for Naturtyper:")] // 
        public string SpreadHistoryForeignDocumentation { get; set; } // fab: SpreadHistoryForeignDocumentation

        //public bool? FutureDistributionChangeExpected { get; set; } // fab: Future_Distribution_Change_Expected // ikke i bruk i 2012
        public string FutureDistributionChangeExpectedDescription { get; set; } // fab: Future_Distribution_Change_Expected_Description
        public string FutureDistributionCriticalParameters { get; set; } // fab: Future_Distribution_Critical_Parameters

        public Int64? PotentialAreaDistribution { get; set; } // fab: Potential_Area_Distribution -  ikke i bruk?
        public string PotentialAreaDistributionInTheFuture { get; set; } // fab: Potential_Area_Distribution_Future_Future @steinho - ikke i bruk?

        //nye
        public Int64? CurrentExistenceArea { get; set; }
        public Int64? CurrentExistenceAreaLowCalculated { get; set; }
        public string CurrentExistenceAreaLowMultiplier { get; set; }
        public Int64? CurrentExistenceAreaCalculated { get; set; }
        public string CurrentExistenceAreaMultiplier { get; set; }
        public string CurrentExistenceAreaHighMultiplier { get; set; }
        public Int64? CurrentExistenceAreaHighCalculated { get; set; }

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

        public Int64? PotentialExistenceAreaLowQuartile { get; set; }
        public Int64? PotentialExistenceArea { get; set; }
        public Int64? PotentialExistenceAreaHighQuartile { get; set; }
        public string PotentialPresenceComment { get; set; }

        // end nye


        //public Int64? SpeciesCount { get; set; } // fab: Species_Count  // ikke i bruk som egen attributt (ligger i spredningshistorikk item) i 2012


        [JsonConverter(typeof(CustomDoubleFormatConverter))]
        public double? SpreadHistoryDomesticAreaInStronglyChangedNatureTypes { get; set; }
    }
    public partial class FA4 // (4) Naturtyper
    {
        //public List<NatureType> AssessmentNatureTypes { get; set; } // removed 03.11.2016 - * see comment for NatureType class
        public List<ImpactedNatureType> ImpactedNatureTypes { get; set; } = new List<ImpactedNatureType>();

        public List<RedlistedNatureType> RedlistedNatureTypes { get; set; } = new List<RedlistedNatureType>(); //lagt til 18.11.2016


        //public string SpeciesNatureTypesDetails { get; set; } // fab: SpeciesNatureTypesDetails // removed 03.11.2016

        public bool UsesLivingSpeciesAsHabitat { get; set; }
        public string UsesLivingSpeciesAsHabitatScientificName { get; set; }
    }

    public partial class FA4 // (5) Risikovurdering
    {
        public class RegionalRiskAssessment
        {
            public string Name { get; set; }
            public RiskAssessment RiskAssessment { get; set; }
        }

        public RiskAssessment RiskAssessment { get; set; } = new RiskAssessment();
        public List<RegionalRiskAssessment> RegionalRiskAssessments { get; set; } = new List<RegionalRiskAssessment>();


    }



    public partial class RiskAssessment // FA4 // () Risikovurdering (dette er avledet informasjon!!)
    {
        //-------------------------------------------------------------------------------
        // --------------------------- Risikovurdering ----------------------------------
        //-------------------------------------------------------------------------------

        //public Int64? RiskLevel { get; set; }
        ////public Int64? RiskUncertantyLevel { get; set; }
        //public Int64? SpreadRiskLevel { get; set; }
        //public Int64? EcologicalEffectRiskLevel { get; set; }
        ////public Int64? SpreadRiskUncertantyLevel { get; set; }
        ////public Int64? EcologicalEffectRiskUncertantyLevel { get; set; }
        //public string SpreadRiskDecisiveCriterias { get; set; }
        //public string EcologicalEffectDecisiveCriterias { get; set; }
        public int RiskLevel { get; set; } = -1;
        public string DecisiveCriteria { get; set; }
        public string RiskLevelCode { get; set; }
        public string RiskLevelText { get; set; }

        public int EcoEffectLevel { get; set; }
        public int[] EcoEffectUncertaintyLevels { get; set; }

        public int InvationPotentialLevel { get; set; }
        public int[] InvationPotentialUncertaintyLevels { get; set; }



    }

    public partial class RiskAssessment // (5.1+5.2) Klassifisering (Ivasjonspotensial+Økologisk effekt)
    {
        public class Criterion
        {
            public string Id { get; set; }

            public int Value { get; set; }
            public Axis Akse { get; set; }
            public string CriteriaLetter { get; set; }
            //public bool Uncertain { get; set; }
            //public bool HasValue { get; set; }
            public string NoValueInformation { get; set; }  // skal være med??
            //public string Type;
            //public int UncertaintyValue { get; set; }
            public int[] UncertaintyValues { get; set; } = new int[] { };

            //NB!  skal ikke publiseres!!!
            //  public string UncertantyInformation { get; set; }

            public enum Axis
            {
                Invasion,
                EcoEffect
            }
        }

        // ---------- klassifisering -------------
        #region Criterion
        public List<Criterion> Criteria { get; set; }
        //public List<Criterion> Criteria { get; set; } = new List<Criterion>
        //{
        //    new Criterion {Id = "InvasionPopulationLifetimeExpectancy",              Value = 0, Akse = Criterion.Axis.Invasion,  CriteriaLetter = "A", UncertaintyValues = new int[] {0}},
        //    new Criterion {Id = "InvasionExpansionSpeed",                            Value = 0, Akse = Criterion.Axis.Invasion,  CriteriaLetter = "B", UncertaintyValues = new int[] {0}},
        //    new Criterion {Id = "InvasionColonizationOfNaturetypeAfter50Years",      Value = 0, Akse = Criterion.Axis.Invasion,  CriteriaLetter = "C", UncertaintyValues = new int[] {0}},
        //    new Criterion {Id = "EcologicalEffectInteractionWithThreatenedSpecies",  Value = 0, Akse = Criterion.Axis.EcoEffect, CriteriaLetter = "D", UncertaintyValues = new int[] {0}},
        //    new Criterion {Id = "EcologicalEffectInteractionWithDomesticSpecies",    Value = 0, Akse = Criterion.Axis.EcoEffect, CriteriaLetter = "E", UncertaintyValues = new int[] {0}},
        //    new Criterion {Id = "EcologicalEffectInfluenceOnThreatenedNatureTypes",  Value = 0, Akse = Criterion.Axis.EcoEffect, CriteriaLetter = "F", UncertaintyValues = new int[] {0}},
        //    new Criterion {Id = "EcologicalEffectInfluenceOnCommonNatureTypes",      Value = 0, Akse = Criterion.Axis.EcoEffect, CriteriaLetter = "G", UncertaintyValues = new int[] {0}},
        //    new Criterion {Id = "EcologicalEffectTransferOfGeneticMaterial",         Value = 0, Akse = Criterion.Axis.EcoEffect, CriteriaLetter = "H", UncertaintyValues = new int[] {0}},
        //    new Criterion {Id = "EcologicalEffectTransferOfDiseasesAndParasites",    Value = 0, Akse = Criterion.Axis.EcoEffect, CriteriaLetter = "I", UncertaintyValues = new int[] {0}}
        //};
        public static RiskAssessment.Criterion CreateDomainCriterion(string id, string criteraLetter, RiskAssessment.Criterion.Axis akse)
        {
            return new RiskAssessment.Criterion()
            {
                Id = id,
                Akse = akse,
                CriteriaLetter = criteraLetter,
                Value = 0,
                NoValueInformation = null,
                //Type = crit.Type, =====>                spread  ecologicaleffect
                UncertaintyValues = new[] { 0 }
            };
        }

        public static List<Criterion> CreateDefaultCriteria()
        {
            var criteria = new List<RiskAssessment.Criterion>();
            criteria.Add(CreateDomainCriterion("InvasionPopulationLifetimeExpectancy",             "A", RiskAssessment.Criterion.Axis.Invasion));
            criteria.Add(CreateDomainCriterion("InvasionExpansionSpeed",                           "B", RiskAssessment.Criterion.Axis.Invasion));
            criteria.Add(CreateDomainCriterion("InvasionColonizationOfNaturetypeAfter50Years",     "C", RiskAssessment.Criterion.Axis.Invasion));
            criteria.Add(CreateDomainCriterion("EcologicalEffectInteractionWithThreatenedSpecies", "D", RiskAssessment.Criterion.Axis.EcoEffect));
            criteria.Add(CreateDomainCriterion("EcologicalEffectInteractionWithDomesticSpecies",   "E", RiskAssessment.Criterion.Axis.EcoEffect));
            criteria.Add(CreateDomainCriterion("EcologicalEffectInfluenceOnThreatenedNatureTypes", "F", RiskAssessment.Criterion.Axis.EcoEffect));
            criteria.Add(CreateDomainCriterion("EcologicalEffectInfluenceOnCommonNatureTypes",     "G", RiskAssessment.Criterion.Axis.EcoEffect));
            criteria.Add(CreateDomainCriterion("EcologicalEffectTransferOfGeneticMaterial",        "H", RiskAssessment.Criterion.Axis.EcoEffect));
            criteria.Add(CreateDomainCriterion("EcologicalEffectTransferOfDiseasesAndParasites",   "I", RiskAssessment.Criterion.Axis.EcoEffect));
            return criteria;
        }


        //        [{Id: "InvasionPopulationLifetimeExpectancy", Value: 0, Akse: 0, CriteriaLetter: "A",…},…]
        //0
        //:
        //{Id: "InvasionPopulationLifetimeExpectancy", Value: 0, Akse: 0, CriteriaLetter: "A",…}
        //1
        //:
        //{Id: "InvasionExpansionSpeed", Value: 0, Akse: 0, CriteriaLetter: "B", NoValueInformation: null,…}
        //2
        //:
        //{Id: "InvasionColonizationOfNaturetypeAfter50Years", Value: 0, Akse: 0, CriteriaLetter: "C",…}
        //3
        //:
        //{Id: "EcologicalEffectInteractionWithThreatenedSpecies", Value: 0, Akse: 1, CriteriaLetter: "D",…}
        //4
        //:
        //{Id: "EcologicalEffectInteractionWithDomesticSpecies", Value: 0, Akse: 1, CriteriaLetter: "E",…}
        //5
        //:
        //{Id: "EcologicalEffectInfluenceOnThreatenedNatureTypes", Value: 0, Akse: 1, CriteriaLetter: "F",…}
        //6
        //:
        //{Id: "EcologicalEffectInfluenceOnCommonNatureTypes", Value: 0, Akse: 1, CriteriaLetter: "G",…}
        //7
        //:
        //{Id: "EcologicalEffectTransferOfGeneticMaterial", Value: 0, Akse: 1, CriteriaLetter: "H",…}
        //8
        //:
        //{Id: "EcologicalEffectTransferOfDiseasesAndParasites", Value: 0, Akse: 1, CriteriaLetter: "I",…}



        #endregion
    }
    public partial class RiskAssessment // (5.1) Ivasjonspotensial
    {
        // ---------- invasjonspotensial -------------
        public bool? QuantitativeDataForDomesticSpreadExsists { get; set; }  // Quantitative_Domestic_Spread_Data_Exsists
        public bool? QuantitativeDataForForeignSpreadExsists { get; set; }   // Quantitative_Foreign_Spread_Data_Exsists
        public string QuantitativeDataComment { get; set; }         // Quantitative_Spread_Data_Comment

        // -- forventet levetid for norsk populasjon
        public Int64? EstimatedSpeciesCount { get; set; }   // Estimated_Species_Count
        public string EstimatedSpeciesCountMethod { get; set; }   // Estimated_Species_Count_Estimation_Method
        public string EstimatedSpeciesCountAssumption { get; set; }   // Estimated_Species_Count_Assumption
        public bool? EstimatedSpeciesLongevityMoreThan1000Years { get; set; }   // Estimated_Species_Longevity_More_than_1000_years
        public string EstimatedSpeciesLongevity { get; set; }  // Estimated_Species_Longevity
        public string EstimatedSpeciesLongevityMethod { get; set; }  // Estimated_Species_Longevity_Method










        //        public bool hasPVA { get; set; } // = !string.IsNullOrWhiteSpace(detailsinfo.Spread_PVA_Analysis);
        #region (A) Populasjonens mediane levetid
        // todo: find unused properties in this region
        // ikke i bruk i 2012 applikasjon (?)
        //public string SpreadingDescription { get; set; } //Spreading_Description

        public string AcceptOrAdjustCritA { get; set; } = "a";
        public string ChosenSpreadMedanLifespan { get; set; } = "";  //lagt til 08.11.2016

        public bool ActiveSpreadPVAAnalysisSpeciesLongevity { get; set; } // added 27.09.2016

        [DisplayName("PVA-analyse beskrivelse")]
        public string SpreadPVAAnalysis { get; set; } //Spread_PVA_Analysis
        [DisplayName("Forventet levetid")]
        public bool ActiveSpreadPVAAnalysisEstimatedSpeciesLongevity { get; set; } // lagt til 27.09.2016
        public string SpreadPVAAnalysisEstimatedSpeciesLongevity { get; set; }  //Spread_PVA_Analysis_Estimated_Species_Longevity
        public string SpreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile { get; set; }  // lagt til 07.09.2016
        public string SpreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile { get; set; }  // lagt til 07.09.2016 

        //Rødliste info

        public bool ActiveRedListCategoryLevel { get; set; } // lagt til 27.09.2016
        public string RedListUsedCriteria { get; set; }  // lagt til 07.09.2016
        public string RedListDataDescription { get; set; }  // lagt til 07.09.2016
        public string RedListCategory { get; set; }  // lagt til 07.09.2016
        public string RedListSubCategory { get; set; }  // lagt til 07.09.2016


        //public bool ActiveSpreadRscriptSpeciesCount { get; set; } // lagt til 27.09.2016

        [DisplayName("Bestandstørrelse")]
        public int? SpreadRscriptSpeciesCount { get; set; }  //Spread_Rscript_Species_Count
        [DisplayName("Vekstrate")]
        //public double SpreadRscriptPopulationGrowth { get; set; } //Spread_Rscript_Population_Growth
        public string SpreadRscriptPopulationGrowth { get; set; } // type change 01.11.2017

        /// <summary>
        /// R-script input - demographic variance - Description
        /// </summary>
        [DisplayName("Demografisk varians")]
        public string SpreadRscriptDemographicVariance { get; set; }  //Spread_Rscript_Demographic_Variance
        /// <summary>
        /// R-script input - environmant (stocastic) variance - Description
        /// </summary>
        [DisplayName("Miljø varians")]
        public string SpreadRscriptEnvironmantVariance { get; set; } //Spread_Rscript_Environmant_Variance

        /// <summary>
        /// R-script input - Quasi-extinction Threshold - Description
        /// </summary>
        [DisplayName("Terskel for kvasiutdøing")]
        public string SpreadRscriptQuasiExtinctionThreshold { get; set; }  //Spread_Rscript_Quasi_Extinction_Threshold

        /// <summary>
        /// R-script input - Sustainability K - Description
        /// </summary>
        [DisplayName("Bæreevne K")]
        public string SpreadRscriptSustainabilityK { get; set; } //Spread_Rscript_Sustainability_K

        public bool ActiveSpreadRscriptEstimatedSpeciesLongevity { get; set; } // lagt til 08.11.2016
        /// <summary>
        /// Estimated species longevity  Conclusion
        /// </summary>
        public string SpreadRscriptEstimatedSpeciesLongevity { get; set; } //Spread_Rscript_Sustainability_K
        #endregion



        #region (B) Ekspansjonshastighet

        public string ChosenSpreadYearlyIncrease { get; set; } = "";  //lagt til 14.10.2016

        public bool ActiveSpreadYearlyIncreaseObservations { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyIncreaseObservations { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyIncreaseObservationsLowerQuartile { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyIncreaseObservationsUpperQuartile { get; set; } //lagt til 29.09.2016


        public bool ActiveSpreadYearlyIncreaseOccurrenceArea { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyIncreaseOccurrenceArea { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyIncreaseOccurrenceAreaLowerQuartile { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyIncreaseOccurrenceAreaUpperQuartile { get; set; } //lagt til 29.09.2016


        public bool ActiveSpreadYearlyLiteratureData { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyLiteratureDataExpansionSpeed { get; set; } // lagt til 14.10.2016
        public string SpreadYearlyLiteratureDataUncertainty { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyLiteratureDataNumberOfIntroductionSources { get; set; } //lagt til 29.09.2016  
        public string SpreadYearlyLiteratureData { get; set; } //lagt til 29.09.2016 
        //public string SpreadYearlyLiteratureDataAssumptions { get; set; } //lagt til 29.09.2016 // fjernet 03.11.2016
        public string SpreadYearlyLiteratureDataSource { get; set; } //lagt til 29.09.2016


        public bool ActiveSpreadYearlyIncreaseCalculatedExpansionSpeed { get; set; } //lagt til 29.09.2016 // changed from ActiveSpreadYearlyIncreaseEstimate 09.11.2016
        public string SpreadYearlyIncreaseEstimate { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyIncreaseEstimateDescription { get; set; } //lagt til 29.09.2016
        public string SpreadYearlyIncreaseCalculatedExpansionSpeed { get; set; } //lagt til 14.10.2016




        #endregion (B) Ekspansjonshastighet



        #region unused ???????
        // -- spredningshastighet

        [JsonConverter(typeof(CustomDoubleFormatConverter))]
        public double? SpreadYearlyIncrease { get; set; }   // Spread_Yearly_Increase
        public string SpreadYearlyIncreaseMethod { get; set; }  // Spread_Yearly_Increase_EstimationMethod
        #endregion unused ???????




        #region unused ???????
        [DisplayName("Beskrivelse")]
        public string SpreadManualEstimate { get; set; } // fab: Spread_Manual_Estimate
        public string SpreadManualEstimateSpeciesLongevity { get; set; } // fab: Spread_Manual_Estimate_Species_Longevity
        public bool? SpreadManualEstimateSpeciesLongevityIsMoreThan1000years { get; set; } // fab: Spread_Manual_Estimate_Species_Longevity_More_than_1000_years



        // -- fortetningsrate
        [DisplayName("Fortetningsrate, konklusjon")]
        public string IncreasingDensity { get; set; }  // Increasing_Density_Conclusion
        [DisplayName("Grunnlag for fortetningsrate")]
        public string IncreasingDensityMethod { get; set; }  // Increasing_Density_Method
        #endregion





        #region unused keys fortetningsrate - PVA - manual estimates
        [DisplayName("Resultat fra script")]
        public string IncreasingDensityPVAAnalysis { get; set; } //Increasing_Density_PVA_Analysis
        [DisplayName("Verdi")]
        public string IncreasingDensityPercentualComputation { get; set; } //Increasing_Density_Percentual_Computation
        [DisplayName("Tidsperiode")]
        public string IncreasingDensityPercentualComputationPeriod { get; set; } //Increasing_Density_Percentual_Computation_Period
        [DisplayName("Anslag")]
        public string IncreasingDensityManualEstimate { get; set; } //Increasing_Density_Manual_Estimate
        [DisplayName("Begrunnelse")]
        public string IncreasingDensityManualEstimateDescription { get; set; } //Increasing_Density_Manual_Estimate_Description
        #endregion

        // -- naturtype forventet kolonisert
        [DisplayName("Beskrivelse")]
        public string NaturetypeExpectedColonized { get; set; }  // Spread_Naturetype_Expected_Colonization_Description
    }
    public partial class RiskAssessment // (5.2) Økologisk effekt
    {

        // slettet 09.09.2016
        //public class SpeciesSpeciesInteractions
        //{
        //    public bool DomesticDocumented { get; set; }
        //    public bool DomesticObserved { get; set; }
        //    public bool ForeignDocumented { get; set; }
        //    public bool SpecieThreatened { get; set; }
        //    public bool SpecieOther { get; set; }
        //    //public string Description { get; set; }   //  intern informasjon
        //    public bool HasSpeciesInteractions()
        //    {
        //        return SpecieThreatened || SpecieOther;
        //    }
        //}

        //// ---------- økologisk effekt -------------
        //// -- (A + B) art-artinteraksjoner
        //#region SpeciesSpeciesInteractions
        //public SpeciesSpeciesInteractions HabitatPressure { get; set; } //Habitat_Pressure
        //public SpeciesSpeciesInteractions ComparativeSpeciesAffected { get; set; } //Comparative_Species_Affected
        //public SpeciesSpeciesInteractions PredatorPreyInteractions { get; set; } //Predator_Prey_Interactions
        //public SpeciesSpeciesInteractions HostParasiteInteractions { get; set; } //Host_Parasite_Interactions
        //public SpeciesSpeciesInteractions TroficInteractions { get; set; }//Trofic_Interactions
        //#endregion 


        public abstract class Interaction
        {
            //public string ScientificName { get; set; }
            //public string ScientificNameId { get; set; }
            //public string ScientificNameAuthor { get; set; } = "";
            //public string VernacularName { get; set; }
            //public string TaxonRank { get; set; }
            //public string TaxonId { get; set; }
            public string RedListCategory { get; set; }
            public bool KeyStoneSpecie { get; set; }
            public bool KeyStoneOrEndangeredSpecie { get; set; }
            public string Effect { get; set; } // lagt til 10.10.2016
            public bool EffectLocalScale { get; set; } // lagt til 10.10.2016
            public string InteractionType { get; set; }
            public List<string> InteractionTypes { get; set; } = new List<string>();
            public List<string> BasisOfAssessment { get; set; } = new List<string>();
            public string Scale { get; set; }

            public bool LongDistanceEffect { get; set; }
            public bool ConfirmedOrAssumed { get; set; }
            //public string NorwayOrAbroad { get; set; }
            public string DomesticOrAbroad { get; set; }

        }
        public abstract class SpeciesInteraction : Interaction
        {
            public string ScientificName { get; set; }
            public string ScientificNameId { get; set; }
            public string ScientificNameAuthor { get; set; } = "";
            public string VernacularName { get; set; }
            public string TaxonRank { get; set; }
            public string TaxonId { get; set; }
        }

        public class SpeciesSpeciesInteraction : SpeciesInteraction // lagt til 09.09.2016
        {

            //public string ScientificName { get; set; }
            //public string VernacularName { get; set; }
            //public string RedListCategory { get; set; }
            //public bool? KeyStoneSpecie { get; set; }
            //public string Effect { get; set; } // lagt til 10.10.2016
            //public bool EffectLocalScale { get; set; } // lagt til 10.10.2016
            //public string InteractionType { get; set; }
            //public bool LongDistanceEffect { get; set; }
            //public bool ConfirmedOrAssumed { get; set; }
            //public string NorwayOrAbroad { get; set; }
        }

        public abstract class NaturetypeInteraction : Interaction
        {

        }
        public class SpeciesNaturetypeInteraction : NaturetypeInteraction // lagt til 22.12.2016
        {
            public string NiNCode { get; set; }
            public List<string> NiNVariation { get; set; } = new List<string>(); // lagt til 23.12.23
        }



        //// - D kriteriet
        //public List<SpeciesSpeciesInteractions> SpeciesSpeciesInteractionsThreatenedSpecies { get; set; } = new List<SpeciesSpeciesInteractions>(); // lagt til 09.09.2016 // slettet 11.10.2016
        //// - E kriteriet
        //public List<SpeciesSpeciesInteractions> SpeciesSpeciesInteractionsDomesticSpecies { get; set; } = new List<SpeciesSpeciesInteractions>(); // lagt til 12.09.2016 // slettet 11.10.2016

        // - D + E kriteriet
        public List<SpeciesSpeciesInteraction> SpeciesSpeciesInteractions { get; set; } = new List<SpeciesSpeciesInteraction>(); // lagt til 11.10.2016
        public List<SpeciesNaturetypeInteraction> SpeciesNaturetypeInteractions { get; set; } = new List<SpeciesNaturetypeInteraction>(); // lagt til 22.12.2016
        public string SpeciesSpeciesInteractionsSupplementaryInformation { get; set; }

        // - H kriteriet
        public List<SpeciesSpeciesInteraction> GeneticTransferDocumented { get; set; } = new List<SpeciesSpeciesInteraction>(); // lagt til 12.09.2016



        public class HostParasiteInteraction : SpeciesInteraction // lagt til 12.09.2016
        {
            //public string ScientificName { get; set; }
            //public string VernacularName { get; set; }
            //public string RedListCategory { get; set; }
            //public bool? KeyStoneSpecie { get; set; }
            //public bool NewHost { get; set; } // fjernet 17.01.2017
            public string ParasiteScientificName { get; set; }
            public string ParasiteVernacularName { get; set; }
            public string ParasiteEcoEffect { get; set; }
            public bool ParasiteNewForHost { get; set; }
            //public bool ParasiteNewForNorway { get; set; } // lagt til 09.11.2016
            public bool ParasiteIsAlien { get; set; } // nytt navn  17.01.2017 (ParasiteNewForNorway)
            public bool DiseaseConfirmedOrAssumed { get; set; }
            //public string NorwayOrAbroad { get; set; }
        }

        // I kriterie
        public List<HostParasiteInteraction> HostParasiteInformations { get; set; } = new List<HostParasiteInteraction>(); // lagt til 09.09.2016




        // -- (C) potensiale for å endre én eller flere truete/sjeldne naturtyper
        public List<string> ThreatenedNatureTypes { get; set; } = new List<string>(); // 09.01.2017  // Threatened_Nature_Types
        // public string Threatened_Nature_Types_Affected_Documentation  { get; set; }             // ************ intern informasjon *************
        public bool? ThreatenedNatureTypesDomesticObserved { get; set; }  // Threatened_Nature_Types_Affected_Domestic_Observed
        public bool? ThreatenedNatureTypesDomesticDocumented { get; set; }  // Threatened_Nature_Types_Affected_Domestic_Documented
        public bool? ThreatenedNatureTypesForeignDocumented { get; set; }  // Threatened_Nature_Types_Affected_Foreign_Documented
        public string ThreatenedNatureTypesAffectedDomesticDescription { get; set; }    //  Threatened_Nature_Types_Affected_Domestic_Description  ????????????
        public string ThreatenedNatureTypesAffectedAbroadDescription { get; set; } = "";   //  lagt til 15.11.2016

        // -- (D) potensiale for å endre én eller flere øvrige naturtyper
        public List<string> CommonNatureTypes { get; set; } = new List<string>(); // 09.01.2017  // Common_Nature_Types
        //public string Common_Nature_Types_Affected_Documentation { get; set; }               //intern informasjon

        public List<string> Naturetype2018 { get; set; } = new List<string>();        
        public List<string> NaturetypeNIN2 { get; set; } = new List<string>();

        public List<string> BackgroundC { get; set; } = new List<string>();

        public List<string> BackgroundF { get; set; } = new List<string>();

        public List<string> BackgroundG { get; set; } = new List<string>();
        public List<string> Hovedøkosystem { get; set; } = new List<string>();
        public List<string> ScoreA { get; set; } = new List<string>();

        public List<string> UnsureA { get; set; } = new List<string>();
        public List<string> ScoreB { get; set; } = new List<string>();

        public List<string> UnsureB { get; set; } = new List<string>();

        public List<string> ScoreC { get; set; } = new List<string>();

        public List<string> UnsureC { get; set; } = new List<string>();

        public List<string> ScoreD { get; set; } = new List<string>();

        public List<string> UnsureD { get; set; } = new List<string>();

        public List<string> ScoreE { get; set; } = new List<string>();

        public List<string> UnsureE { get; set; } = new List<string>();

        public List<string> ScoreF { get; set; } = new List<string>();

        public List<string> UnsureF { get; set; } = new List<string>();
        public List<string> ScoreG { get; set; } = new List<string>();

        public List<string> UnsureG { get; set; } = new List<string>();

        public List<string> ScoreI { get; set; } = new List<string>();

        public List<string> UnsureI { get; set; } = new List<string>();

        public List<string> ScoreH { get; set; } = new List<string>();

        public List<string> UnsureH { get; set; } = new List<string>();



        public string natureAffectedAbroadF { get; set; }

        public string natureAffectedAbroadG { get; set; }

        public bool? CommonNatureTypesDomesticObserved { get; set; }  // Common_Nature_Types_Affected_Domestic_Observed
        public bool? CommonNatureTypesDomesticDocumented { get; set; }  // Common_Nature_Types_Affected_Domestic_Documented
        public bool? CommonNatureTypesForeignDocumented { get; set; }  // Common_Nature_Types_Affected_Foreign_Documented
        public string CommonNatureTypesAffectedDomesticDescription { get; set; }         // Common_Nature_Types_Affected_Domestic_Description??????????????
        public string CommonNatureTypesAffectedAbroadDescription { get; set; } = "";        // lagt til 15.11.2016
        
        // -- (E) kan overføre genetisk materiale til stedegne arter
        public string GeneticTransferDomesticDescription { get; set; }        //Genetic_Transfer_Domestic_Description intern informasjon
        public bool? GeneticTransferDomesticObserved { get; set; }  // Genetic_Transfer_Domestic_Observed
        public bool? GeneticTransferDomesticDocumented { get; set; }  // Genetic_Transfer_Domestic_Documented
        public bool? GeneticTransferForeignDocumented { get; set; }  // Genetic_Transfer_Foreign_Documented

        // -- (F) Kan overføre bakterier, parasitter eller virus til stedegne arter
        public string VectorBiologicalDiseaseSpreadingDomesticDescription { get; set; }    //Vector_Biological_Disease_Spreading_Domestic_Description intern informasjon
        public bool? BiologicalDiseaseSpreadingDomesticObserved { get; set; }  // Vector_Biological_Disease_Spreading_Domestic_Observed
        public bool? BiologicalDiseaseSpreadingDomesticDocumented { get; set; }  // Vector_Biological_Disease_Spreading_Domestic_Documented
        public bool? BiologicalDiseaseSpreadingForeignDocumented { get; set; }
    }

    public partial class RiskAssessment // (5.3) Geografisk Variasjon
    {
        public List<string> GeographicalVariation { get; set; } = new List<string>(); // lagt til 23.09.2016
        public string GeographicalVariationDocumentation { get; set; } // lagt til 23.09.2016

    }

    public partial class RiskAssessment // (5.4) Klimaeffekter
    {
        public string ClimateEffectsInvationpotential { get; set; } // lagt til 23.09.2016
        public string ClimateEffectsEcoEffect { get; set; } // lagt til 23.09.2016
        public string ClimateEffectsDocumentation { get; set; } // lagt til 23.09.2016
    }



    public partial class RiskAssessment // (5.5) Kriteriedokumentasjon
    {
        public string CriteriaDocumentation { get; set; }
        public string CriteriaDocumentationSpeciesStatus { get; set; }
        public string CriteriaDocumentationDomesticSpread { get; set; }
        public string CriteriaDocumentationMigrationPathways { get; set; }
        public string CriteriaDocumentationInvationPotential { get; set; }
        public string CriteriaDocumentationEcoEffect { get; set; }






        //public string NotEvaluatedBackgroundInformation { get; set; } // Dette var et aggregat av beskrivelser i 'artens status'. Vi bruker de sepparate egenskapene
    }


    public partial class FA4 // (8) Referanser
    {
        public List<SimpleReference> References { get; set; } = new List<SimpleReference>();
    }


    public partial class FA4 // Disse variablene er sjekket og var ikke i bruk i 2012 fab Prod
    {

        // public bool? AlienGenotypOfDomesticSpecie { get; set; } // fab: Alien_Genotyp_Of_Domestic_Specie // ikke i bruk i 2012
        //        public string AuthoritySpecies { get; set; } // fab: Authority_Species

        //public string CompetitionImposeDescription { get; set; } // fab: Competition_Impose_Description // ikke i bruk i 2012
        //public bool? DomescicSpreadToNewAreas { get; set; } // fab: Domescic_Spreading_To_New_Areas // ikke i bruk i 2012
        //public string EcoClimate { get; set; } // fab: Eco_Climate // ikke i bruk i 2012



        //public string InteractionWithOtherSpecies { get; set; } // fab: Interaction_Other_Species // ikke i bruk i 2012
        //        public string KingdomSpecies_______ { get; set; } // fab: Kingdom_Species
        //public string Order___ { get; set; } // fab: Order_Species
        //public string P_SpeciesName { get; set; } // fab: P_SpeciesName
        //public string Predation { get; set; } // fab: Predation // ikke i bruk i 2012

        //public string Purpose { get; set; } // fab: Purpose // ikke i bruk i 2012
        //public string SpeciesStatus { get; set; } // fab: Species_Status // ikke i bruk i 2012


        //public string Substrate { get; set; } // fab: Substrate // ikke i bruk i 2012


        // Vector_Biological_Disease_Spreading_Foreign_Documented


        // ikke i bruk
        //public string Ecosystem_Processes_Description { get; set; }
        //public bool? Ecosystem_Processes_Domestic_Documented { get; set; }
        //public bool? Ecosystem_Processes_Foreign_Documented { get; set; }


        // ikke i bruk
        //public string Important_Species_Affected_Domestic_Description { get; set; }
        //public bool? Important_Species_Affected_Domestic_Observed { get; set; }
        //public bool? Important_Species_Affected_Domestic_Documented { get; set; }
        //public bool? Important_Species_Affected_Foreign_Documented { get; set; }

    }

    public partial class FA4 // FA4 Internal classes
    {

        // depricated 03.11.2016 - this class is from fab2012 and can be of interest for viewing old naturetype information
        //public class NatureType
        //{
        //    public string Name { get; set; }
        //    //public string NatureTypeCode { get; set; }  // internal code in allienspeciesassessment

        //    public string Period; // type NatureTypePeriod???
        //    public string NatureTypeCategoryDescription;
        //    public string NatureTypeDescription;
        //    public List<string> NatureTypeVariation;
        //}


        public class ImpactedNatureType
        {
            public string NiNCode { get; set; }
            public List<string> NiNVariation { get; set; } = new List<string>();
            public List<string> DominanceForrest { get; set; } = new List<string>(); // changed datatype from string 18.11.2016
            public string TimeHorizon { get; set; }
            public string ColonizedArea { get; set; }
            public List<string> StateChange { get; set; } = new List<string>(); // changed datatype from string 19.12.2016
            public string AffectedArea { get; set; }
        }

        public class RedlistedNatureType
        {
            public string RedlistedNatureTypeName { get; set; }
            public string Category { get; set; }
            //public List<string> NiNVariation { get; set; } = new List<string>();
            //public List<string> DominanceForrest { get; set; } = new List<string>(); 
            public string TimeHorizon { get; set; }
            public string ColonizedArea { get; set; }
            public List<string> StateChange { get; set; } = new List<string>(); // changed datatype from string 19.12.2016
            public string AffectedArea { get; set; }
        }




        public class SimpleReference
        {
            public string Type { get; set; }

            public Guid ReferenceId { get; set; }

            public string FormattedReference { get; set; }
        }

        public string LockedForEditByUser { get; set; }
        public string LockedForEditTimeStamp { get; set; }
    }


    // todo: Move into Fremmedart2012  (conflict with propertyname)
    public class SpreadHistory
    {
        public SpreadHistory()
        {
/*            this.RegionalPresence = new List<RegionalPresenseWithAssumed>()
                                               {
                                                   new RegionalPresenseWithAssumed { Id = "Øs", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "OsA", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "He", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Op", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Bu", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Ve", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Te", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Aa", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Va", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Ro", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Ho", Known = true, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Sf", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Mr", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "St", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Nt", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "No", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Tr", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Fi", Known = false, Assumed = true },
                                                   new RegionalPresenseWithAssumed { Id = "Sv", Known = false, Assumed = false },
                                                   new RegionalPresenseWithAssumed { Id = "Jm", Known = false, Assumed = false },
    };*/
        }

        public Guid Id;
        public string Location, Comment; //, SpeciesCount, ExistenceArea, ExistenceAreaCount, SpreadArea;
        public string Regions ="";
        public string RegionsAssumed ="";
        //public DateTime? ObservationSortDate;
        //public DateTime? ObservationFromDate, ObservationDate;
        public int ObservationYear, ObservationFromYear;
        public int ObservationMonth, ObservationFromMonth;
        public Int64? SpeciesCount, ExistenceArea, ExistenceAreaCount, SpreadArea;
        [JsonConverter(typeof(CustomDoubleFormatConverter))]
        public double? SpeciesCountDarkFigure, ExistenceAreaDarkFigure, ExistenceAreaCountDarkFigure, SpreadAreaDarkFigure;

        [JsonConverter(typeof(CustomDoubleFormatConverter))]
        public double? SpeciesCountCalculated, ExistenceAreaCalculated, ExistenceAreaCountCalculated, SpreadAreaCalculated;
        public string SelectionGeometry;// = "{\\\"type\\\": \\\"Feature\\\",\\\"geometry\\\": {\\\"type\\\": \\\"Polygon\\\", \\\"coordinates\\\": [[[10.33, 63.45], [11.951, 63.451], [10.949, 64.45]]]}}";
    }

    internal class CustomDoubleFormatConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteValue(((double)value).ToString(CultureInfo.InvariantCulture));
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var value = reader.Value?.ToString();
            
            if (value != null && !string.IsNullOrEmpty(value))
            {
                if (objectType == typeof(double) || objectType == typeof(double?))
                {
                    double temp;
                    var attempted = value.Replace(",", ".");
                    if (double.TryParse(
                        attempted,
                        NumberStyles.Number,
                        CultureInfo.InvariantCulture,
                        out temp)
                    )
                    {
                        return temp;
                    }
                }
            }
            return null;

        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(double) || objectType == typeof(double?);
        }
    }

    public class RegionalPresence
    {
        public string Id;

        public bool Known;
    }

    public class RegionalPresenceWithPotential
    {
        public string Id;
        public bool Assumed;
        public bool Known;
        public bool Potential;
    }

    public class RegionalPresenseWithAssumed : RegionalPresence
    {
        public bool Assumed;
        //private string v;

        public RegionalPresenseWithAssumed()
        {
        }

        public RegionalPresenseWithAssumed(string id)
        {
            this.Id = id;
            this.Known = true;
        }
    }

    // todo: Move into Fremmedart2012  (conflict with propertyname)
    public class MigrationPathway // Vector
    {
        public string CodeItem { get; set; }
        //public int CodeItemId { get; set; }
        //public string Comments { get; set; }
        //public string EditedBy { get; set; }
        //public string Factor { get; set; }
        //public int Id { get; set; }
        public string IntroductionSpread { get; set; } //lagt til 07.09.2016
        public string InfluenceFactor { get; set; }
        public string Magnitude { get; set; }
        public string TimeOfIncident { get; set; }
        public string ElaborateInformation { get; set; }



        //public string ItemPath { get; set; }
        public string Category { get; set; }
        //public bool IsValid { get; set; } = false;  // IsValid == false means this MigrationPathway is depricated and should be edited/removed // removed 15.12.2016 - no longer needed becaus we no longer import MigrationPathways
    }

    public class MigrationPathwayCode
    {
        public string Id { get; set; }
        public string name { get; set; }
        public string value { get; set; }
        public bool selectable { get; set; } = true; // should only select (raise event (to create new MigrationPath)) when true
        public List<MigrationPathwayCode> children { get; set; } = new List<MigrationPathwayCode>(); // 09.01.2017
    }


    public class RedlistedNatureTypeCodeGroup
    {
        public string Id { get; set; }

        public bool collapsed { get; set; } = true; // gui thing
        public List<RedlistedNatureTypeCode> children { get; set; } = new List<RedlistedNatureTypeCode>(); // 09.01.2017

    }
    public class RedlistedNatureTypeCode
    {
        public string Id { get; set; }
        public string theme { get; set; }
        public string link { get; set; }
        public string name { get; set; }
        public string NiN1TypeCode { get; set; }
        public string KTVNin1 { get; set; }
        public string category { get; set; }
    }
    public class FA4WithComments : FA4
    {
        public string NewestCommentDate { get; set; }
        public int CommentClosed { get; set; }
        public int CommentOpen { get; set; }
        //public int CommentNew { get; set; }
        public int TaxonChange { get; set; }
    }
}