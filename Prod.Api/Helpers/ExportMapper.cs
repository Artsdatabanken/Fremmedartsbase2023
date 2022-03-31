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

        #region RiskAssessment 
        public string Category { get; set; }
        public string Criteria { get; set; }

        public int RiskAssessmentRiskLevel { get; set; } = -1;
        public string RiskAssessmentDecisiveCriteria { get; set; }
        public string RiskAssessmentRiskLevelCode { get; set; }
        public string RiskAssessmentRiskLevelText { get; set; }

        public int RiskAssessmentEcoEffectLevel { get; set; }
        public int[] RiskAssessmentEcoEffectUncertaintyLevels { get; set; }

        public int RiskAssessmentInvationPotentialLevel { get; set; }
        public int[] RiskAssessmentInvationPotentialUncertaintyLevels { get; set; }


        public int? RiskAssessmentYearFirstIndoors { get; set; }
        public bool RiskAssessmentYearFirstIndoorsInsecure { get; set; }
        public int? RiskAssessmentYearFirstReproductionIndoors { get; set; }
        public bool RiskAssessmentYearFirstReproductionIndoorsInsecure { get; set; }
        public int? RiskAssessmentYearFirstProductionOutdoors { get; set; }
        public bool RiskAssessmentYearFirstProductionOutdoorsInsecure { get; set; }
        public int? RiskAssessmentYearFirstReproductionOutdoors { get; set; }
        public bool RiskAssessmentYearFirstReproductionOutdoorsInsecure { get; set; }
        public int? RiskAssessmentYearFirstEstablishmentProductionArea { get; set; }
        public bool RiskAssessmentYearFirstEstablishmentProductionAreaInsecure { get; set; }
        public int? RiskAssessmentYearFirstNature { get; set; }
        public bool RiskAssessmentYearFirstNatureInsecure { get; set; }
        public int? RiskAssessmentYearFirstReproductionNature { get; set; }
        public bool RiskAssessmentYearFirstReproductionNatureInsecure { get; set; }
        public int? RiskAssessmentYearFirstEstablishedNature { get; set; }
        public bool RiskAssessmentYearFirstEstablishedNatureInsecure { get; set; }
        public string RiskAssessmentYearFirstDomesticObservation { get; set; }

        //public List<Criterion> Criteria { get; set; }

        // ---------- invasjonspotensial -------------
        public bool? RiskAssessmentQuantitativeDataForDomesticSpreadExsists { get; set; }  // Quantitative_Domestic_Spread_Data_Exsists
        public bool? RiskAssessmentQuantitativeDataForForeignSpreadExsists { get; set; }   // Quantitative_Foreign_Spread_Data_Exsists
        public string RiskAssessmentQuantitativeDataComment { get; set; }         // Quantitative_Spread_Data_Comment

        // -- forventet levetid for norsk populasjon
        public Int64? RiskAssessmentEstimatedSpeciesCount { get; set; }   // Estimated_Species_Count
        public string RiskAssessmentEstimatedSpeciesCountMethod { get; set; }   // Estimated_Species_Count_Estimation_Method
        public string RiskAssessmentEstimatedSpeciesCountAssumption { get; set; }   // Estimated_Species_Count_Assumption
        public bool? RiskAssessmentEstimatedSpeciesLongevityMoreThan1000Years { get; set; }   // Estimated_Species_Longevity_More_than_1000_years
        public string RiskAssessmentEstimatedSpeciesLongevity { get; set; }  // Estimated_Species_Longevity
        public string RiskAssessmentEstimatedSpeciesLongevityMethod { get; set; }  // Estimated_Species_Longevity_Method





        //*************** Forekomstareal i dag ************************************
        [Name("AOOknown")]
        public Int64? RiskAssessmentAOOknown { get; set; }
        [Name("AOOtotalBest")]
        public Int64? RiskAssessmentAOOtotalBest { get; set; }
        [Name("AOOtotalLow")]
        public Int64? RiskAssessmentAOOtotalLow { get; set; }
        [Name("AOOtotalHigh")]
        public Int64? RiskAssessmentAOOtotalHigh { get; set; }

        [Name("AOOchangeBest")]
        public double? RiskAssessmentAOOchangeBest { get; set; }
        [Name("AOOchangeLow")]
        public double? RiskAssessmentAOOchangeLow { get; set; }
        [Name("AOOchangeHigh")]
        public double? RiskAssessmentAOOchangeHigh { get; set; }


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





        // *******  (B2a) Økning i forekomstareal – selvstendig reproduserende arter  **********
        [Name("AOOyear1")]
        public long? RiskAssessmentAOOyear1 { get; set; } // fra-årstallet for det første forekomstarealet 
        [Name("AOOendyear1")]
        public long? RiskAssessmentAOOendyear1 { get; set; } // basert på periode: f.o.m. år (t0) - (NB!! //todo: denne egenskaper bør skifte navn i neste FAB)
        [Name("AOOyear2")]
        public long? RiskAssessmentAOOyear2 { get; set; } // fra-årstallet for det andre forekomstarealet 
        [Name("AOOendyear2")]
        public long? RiskAssessmentAOOendyear2 { get; set; } // basert på periode: t.o.m. år  - (NB!! //todo: denne egenskaper bør skifte navn i neste FAB)
        [Name("AOO1")]
        public long? RiskAssessmentAOO1 { get; set; } // forekomstarealet i år 1 
        [Name("AOO2")]
        public long? RiskAssessmentAOO2 { get; set; } // forekomstarealet i år 2 
        // ************************************************************************************


        //*************** Forekomstareal om 50år ************************************
        [Name("AOO50yrBest")]
        public Int64? RiskAssessmentAOO50yrBest { get; set; } // beste anslag på totalt forekomstareal om 50 år 
        [Name("AOO50yrLow")]
        public Int64? RiskAssessmentAOO50yrLow { get; set; } // lavt anslag på totalt forekomstareal om 50 år 
        [Name("AOO50yrHigh")]
        public Int64? RiskAssessmentAOO50yrHigh { get; set; }
        // -------- disse (forekomstareal om 50år) er erstattet:  
        //todo: *sjekk konvertering fra FAB3 før sletting av utkommentert kode*
        //public Int64? PotentialExistenceAreaLowQuartile { get; set; }
        //public Int64? PotentialExistenceArea { get; set; }
        //public Int64? PotentialExistenceAreaHighQuartile { get; set; }
        //public string PotentialPresenceComment { get; set; }
        //*******************************************************************

        // end nye


        //public Int64? SpeciesCount { get; set; } // fab: Species_Count  // ikke i bruk som egen attributt (ligger i spredningshistorikk item) i 2012


        public double? RiskAssessmentSpreadHistoryDomesticAreaInStronglyChangedNatureTypes { get; set; }
        public double? RiskAssessmentSpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow { get; set; }
        public double? RiskAssessmentSpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest { get; set; }
        public double? RiskAssessmentSpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh { get; set; }



        //        public bool hasPVA { get; set; } // = !string.IsNullOrWhiteSpace(detailsinfo.Spread_PVA_Analysis);
        #region (A) Populasjonens mediane levetid
        // todo: find unused properties in this region
        // ikke i bruk i 2012 applikasjon (?)
        //public string SpreadingDescription { get; set; } //Spreading_Description

        public string RiskAssessmentAcceptOrAdjustCritA { get; set; } = "accept";  // ametod submetod (radio)
        public string RiskAssessmentChosenSpreadMedanLifespan { get; set; } = "";  // ametod (radio)
        public string RiskAssessmentReasonForAdjustmentCritA { get; set; } = ""; // added 06.01.2022

        public bool RiskAssessmentActiveSpreadPVAAnalysisSpeciesLongevity { get; set; } // added 27.09.2016

        [Name("PVA-analyse beskrivelse")]
        public string RiskAssessmentSpreadPVAAnalysis { get; set; } //Spread_PVA_Analysis
        [Name("Forventet levetid")]
        public bool RiskAssessmentActiveSpreadPVAAnalysisEstimatedSpeciesLongevity { get; set; } // lagt til 27.09.2016
        public string RiskAssessmentSpreadPVAAnalysisEstimatedSpeciesLongevity { get; set; }  //Spread_PVA_Analysis_Estimated_Species_Longevity
        public string RiskAssessmentSpreadPVAAnalysisEstimatedSpeciesLongevityLowerQuartile { get; set; }  // lagt til 07.09.2016
        public string RiskAssessmentSpreadPVAAnalysisEstimatedSpeciesLongevityUpperQuartile { get; set; }  // lagt til 07.09.2016 

        public string RiskAssessmentFilesDescription { get; set; } //Spread_PVA_Analysis


        //todo: is this section in use???
        //Rødliste info
        public bool RiskAssessmentActiveRedListCategoryLevel { get; set; } // lagt til 27.09.2016
        public string RiskAssessmentRedListUsedCriteria { get; set; }  // lagt til 07.09.2016
        public string RiskAssessmentRedListDataDescription { get; set; }  // lagt til 07.09.2016
        public string RiskAssessmentRedListCategory { get; set; }  // lagt til 07.09.2016
        public string RiskAssessmentRedListSubCategory { get; set; }  // lagt til 07.09.2016
                                                        // -----------------------------------------------------------------------------------------



        // ****************************  (A2) Numerisk estimering  ****************************
        public long? RiskAssessmentPopulationSize { get; set; } // bestandens nåværende størrelse (individtall) 
        public double? RiskAssessmentGrowthRate { get; set; } // bestandens multiplikative vekstrate 
        public double? RiskAssessmentEnvVariance { get; set; } // miljøvarians 
        public double? RiskAssessmentDemVariance { get; set; } // demografisk varians 
        public long? RiskAssessmentCarryingCapacity { get; set; } // bestandens bæreevne (individtall) 
        public long? RiskAssessmentExtinctionThreshold { get; set; } // kvasiutdøingsterskel (individtall) 
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

        #region Median life time
        public double? RiskAssessmentMedianLifetimeInput { get; set; } // artens mediane levetid i Norge i år (brukerinput)
        public long RiskAssessmentMedianLifetime { get; set; } // artens mediane levetid i Norge i år (beregnet/avrundet)
        public long? RiskAssessmentLifetimeLowerQInput { get; set; } // nedre kvartil for artens levetid i Norge i år 
        public long RiskAssessmentLifetimeLowerQ { get; set; } // nedre kvartil for artens levetid i Norge i år 
        public long? RiskAssessmentLifetimeUpperQInput { get; set; } // øvre kvartil for artens levetid i Norge i år 
        public long RiskAssessmentLifetimeUpperQ { get; set; } // øvre kvartil for artens levetid i Norge i år 
        #endregion Median life time

        public string RiskAssessmentAmethod { get; set; } // metode som ble brukt for å beregne A-kriteriet 
        public int RiskAssessmentAscore { get; set; } // skår for A-kriteriet 
        public int RiskAssessmentAlow { get; set; } // nedre skår for A-kriteriet (inkludert usikkerhet) 
        public int RiskAssessmentAhigh { get; set; } // øvre skår for A-kriteriet (inkludert usikkerhet) 
        public string RiskAssessmentBmethod { get; set; } // metode som ble brukt for å beregne B-kriteriet 
        public int RiskAssessmentBscore { get; set; } // skår for B-kriteriet 
        public int RiskAssessmentBlow { get; set; } // nedre skår for B-kriteriet (inkludert usikkerhet) 
        public int RiskAssessmentBhigh { get; set; } // øvre skår for B-kriteriet (inkludert usikkerhet) 

        public string RiskAssessmentBCritMCount { get; set; } = "";
        public string RiskAssessmentBCritExact { get; set; } = "false";
        public string RiskAssessmentBCritP { get; set; }
        public string RiskAssessmentBCritNewObs { get; set; } = "True";


        public int RiskAssessmentStartYear { get; set; } // startår for B-kriteriet / utbredelse

        public int RiskAssessmentEndYear { get; set; } // sluttår for B-kriteriet / utbredelse

        [Name("AOOdarkfigureBest")]
        public float? RiskAssessmentAOOdarkfigureBest { get; set; } // beste anslag på forekomstarealets mørketall 
        [Name("AOOdarkfigureLow")]
        public float? RiskAssessmentAOOdarkfigureLow { get; set; } // lavt anslag på forekomstarealets mørketall 
        [Name("AOOdarkfigureHigh")]
        public float? RiskAssessmentAOOdarkfigureHigh { get; set; } // høyt anslag på forekomstarealets mørketall 
        [Name("AOO10yrBest")]
        public long? RiskAssessmentAOO10yrBest { get; set; } // beste anslag på totalt forekomstareal om 10 år
        [Name("AOO10yrLow")]
        public long? RiskAssessmentAOO10yrLow { get; set; } // lavt anslag på totalt forekomstareal om 10 år
        [Name("AOO10yrHigh")]
        public long? RiskAssessmentAOO10yrHigh { get; set; } // høyt anslag på totalt forekomstareal om 10 år


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

        public string RiskAssessmentChosenSpreadYearlyIncrease { get; set; } = "";  // bmetod (radio)
        public bool RiskAssessmentActiveSpreadYearlyIncreaseObservations { get; set; } //lagt til 29.09.2016


        // ********************** (b) Forekomstareal – dørstokkarter  ****************************
        public long? RiskAssessmentOccurrences1Best { get; set; }	// beste anslag på antall forekomster fra 1 introduksjon 
        public long? RiskAssessmentOccurrences1Low { get; set; }	// lavt anslag på antall forekomster fra 1 introduksjon 
        public long? RiskAssessmentOccurrences1High { get; set; }	// høyt anslag på antall forekomster fra 1 introduksjon 
        public long? RiskAssessmentIntroductionsBest { get; set; }	// beste anslag på antall introduksjoner i løpet av 10 år 
        public long? RiskAssessmentIntroductionsLow { get; set; }	    // lavt anslag på antall introduksjoner i løpet av 10 år 
        public long? RiskAssessmentIntroductionsHigh { get; set; }	// høyt anslag på antall introduksjoner i løpet av 10 år 
        // -------- disse (forekomstareal - dørstokkarter) er erstattet:  
        //todo: *sjekk konvertering fra FAB3 før sletting av utkommentert kode*
        //public string SpreadYearlyIncreaseObservations { get; set; } //lagt til 29.09.2016
        //public string SpreadYearlyIncreaseObservationsLowerQuartile { get; set; } //lagt til 29.09.2016
        //public string SpreadYearlyIncreaseObservationsUpperQuartile { get; set; } //lagt til 29.09.2016
        // ****************************************************************************************


        // ********************** ((B1) ekspansjonshastighet  ****************************
        public long? RiskAssessmentExpansionSpeedInput { get; set; }  // ekspansjonshastighet i meter per år 
        public long? RiskAssessmentExpansionSpeed { get; set; }  // ekspansjonshastighet i meter per år 
        public long? RiskAssessmentExpansionLowerQInput { get; set; } // nedre kvartil for ekspansjonshastighet i meter per år 
        public long? RiskAssessmentExpansionLowerQ { get; set; } // nedre kvartil for ekspansjonshastighet i meter per år 
        public long? RiskAssessmentExpansionUpperQInput { get; set; } // øvre kvartil for ekspansjonshastighet i meter per år 
        public long? RiskAssessmentExpansionUpperQ { get; set; } // øvre kvartil for ekspansjonshastighet i meter per år 
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


        public bool RiskAssessmentActiveSpreadYearlyLiteratureData { get; set; } //lagt til 29.09.2016
        public string RiskAssessmentSpreadYearlyLiteratureDataExpansionSpeed { get; set; } // lagt til 14.10.2016
        public string RiskAssessmentSpreadYearlyLiteratureDataUncertainty { get; set; } //lagt til 29.09.2016
        public string RiskAssessmentSpreadYearlyLiteratureDataNumberOfIntroductionSources { get; set; } //lagt til 29.09.2016  
        public string RiskAssessmentSpreadYearlyLiteratureData { get; set; } //lagt til 29.09.2016 
        //public string SpreadYearlyLiteratureDataAssumptions { get; set; } //lagt til 29.09.2016 // fjernet 03.11.2016
        public string RiskAssessmentSpreadYearlyLiteratureDataSource { get; set; } //lagt til 29.09.2016


        public bool RiskAssessmentActiveSpreadYearlyIncreaseCalculatedExpansionSpeed { get; set; } //lagt til 29.09.2016 // changed from ActiveSpreadYearlyIncreaseEstimate 09.11.2016
        public string RiskAssessmentSpreadYearlyIncreaseEstimate { get; set; } //lagt til 29.09.2016
        public string RiskAssessmentSpreadYearlyIncreaseEstimateDescription { get; set; } //lagt til 29.09.2016
        public string RiskAssessmentSpreadYearlyIncreaseCalculatedExpansionSpeed { get; set; } //lagt til 14.10.2016




        #endregion (B) Ekspansjonshastighet



        #region unused ???????
        // -- spredningshastighet

        public double? RiskAssessmentSpreadYearlyIncrease { get; set; }   // Spread_Yearly_Increase
        public string RiskAssessmentSpreadYearlyIncreaseMethod { get; set; }  // Spread_Yearly_Increase_EstimationMethod
        #endregion unused ???????




        #region unused ???????
        [Name("Beskrivelse")]
        public string RiskAssessmentSpreadManualEstimate { get; set; } // fab: Spread_Manual_Estimate
        public string RiskAssessmentSpreadManualEstimateSpeciesLongevity { get; set; } // fab: Spread_Manual_Estimate_Species_Longevity
        public bool? RiskAssessmentSpreadManualEstimateSpeciesLongevityIsMoreThan1000years { get; set; } // fab: Spread_Manual_Estimate_Species_Longevity_More_than_1000_years



        // -- fortetningsrate
        [Name("Fortetningsrate, konklusjon")]
        public string RiskAssessmentIncreasingDensity { get; set; }  // Increasing_Density_Conclusion
        [Name("Grunnlag for fortetningsrate")]
        public string RiskAssessmentIncreasingDensityMethod { get; set; }  // Increasing_Density_Method
        #endregion





        #region unused keys fortetningsrate - PVA - manual estimates
        [Name("Resultat fra script")]
        public string RiskAssessmentIncreasingDensityPVAAnalysis { get; set; } //Increasing_Density_PVA_Analysis
        [Name("Verdi")]
        public string RiskAssessmentIncreasingDensityPercentualComputation { get; set; } //Increasing_Density_Percentual_Computation
        [Name("Tidsperiode")]
        public string RiskAssessmentIncreasingDensityPercentualComputationPeriod { get; set; } //Increasing_Density_Percentual_Computation_Period
        [Name("Anslag")]
        public string RiskAssessmentIncreasingDensityManualEstimate { get; set; } //Increasing_Density_Manual_Estimate
        [Name("Begrunnelse")]
        public string RiskAssessmentIncreasingDensityManualEstimateDescription { get; set; } //Increasing_Density_Manual_Estimate_Description
        #endregion

        // -- naturtype forventet kolonisert
        [Name("Beskrivelse")]
        public string RiskAssessmentNaturetypeExpectedColonized { get; set; }  // Spread_Naturetype_Expected_Colonization_Description


        //public List<SpeciesSpeciesInteraction> SpeciesSpeciesInteractions { get; set; } = new List<SpeciesSpeciesInteraction>(); // lagt til 11.10.2016
        //public List<SpeciesNaturetypeInteraction> SpeciesNaturetypeInteractions { get; set; } = new List<SpeciesNaturetypeInteraction>(); // lagt til 22.12.2016
        //public string SpeciesSpeciesInteractionsSupplementaryInformation { get; set; }

        //// - H kriteriet
        //public List<SpeciesSpeciesInteraction> GeneticTransferDocumented { get; set; } = new List<SpeciesSpeciesInteraction>(); // lagt til 12.09.2016
        //public List<HostParasiteInteraction> HostParasiteInformations { get; set; } = new List<HostParasiteInteraction>(); // lagt til 09.09.2016

        public List<string> RiskAssessmentThreatenedNatureTypes { get; set; } = new List<string>(); // 09.01.2017  // Threatened_Nature_Types
        // public string Threatened_Nature_Types_Affected_Documentation  { get; set; }             // ************ intern informasjon *************
        public bool? RiskAssessmentThreatenedNatureTypesDomesticObserved { get; set; }  // Threatened_Nature_Types_Affected_Domestic_Observed
        public bool? RiskAssessmentThreatenedNatureTypesDomesticDocumented { get; set; }  // Threatened_Nature_Types_Affected_Domestic_Documented
        public bool? RiskAssessmentThreatenedNatureTypesForeignDocumented { get; set; }  // Threatened_Nature_Types_Affected_Foreign_Documented
        public string RiskAssessmentThreatenedNatureTypesAffectedDomesticDescription { get; set; }    //  Threatened_Nature_Types_Affected_Domestic_Description  ????????????
        public string RiskAssessmentThreatenedNatureTypesAffectedAbroadDescription { get; set; } = "";   //  lagt til 15.11.2016

        // -- (D) potensiale for å endre én eller flere øvrige naturtyper
        public List<string> RiskAssessmentCommonNatureTypes { get; set; } = new List<string>(); // 09.01.2017  // Common_Nature_Types
        //public string Common_Nature_Types_Affected_Documentation { get; set; }               //intern informasjon

        public List<string> RiskAssessmentNaturetype2018 { get; set; } = new List<string>();
        public List<string> RiskAssessmentNaturetypeNIN2 { get; set; } = new List<string>();

        public List<string> RiskAssessmentBackgroundC { get; set; } = new List<string>();

        public List<string> RiskAssessmentBackgroundF { get; set; } = new List<string>();

        public List<string> RiskAssessmentBackgroundG { get; set; } = new List<string>();
        public List<string> RiskAssessmentHovedøkosystem { get; set; } = new List<string>();


        public string RiskAssessmentNatureAffectedAbroadF { get; set; }

        public string RiskAssessmentNatureAffectedAbroadG { get; set; }

        public bool? RiskAssessmentCommonNatureTypesDomesticObserved { get; set; }  // Common_Nature_Types_Affected_Domestic_Observed
        public bool? RiskAssessmentCommonNatureTypesDomesticDocumented { get; set; }  // Common_Nature_Types_Affected_Domestic_Documented
        public bool? RiskAssessmentCommonNatureTypesForeignDocumented { get; set; }  // Common_Nature_Types_Affected_Foreign_Documented
        public string RiskAssessmentCommonNatureTypesAffectedDomesticDescription { get; set; }         // Common_Nature_Types_Affected_Domestic_Description??????????????
        public string RiskAssessmentCommonNatureTypesAffectedAbroadDescription { get; set; } = "";        // lagt til 15.11.2016

        // -- (E) kan overføre genetisk materiale til stedegne arter
        public string RiskAssessmentGeneticTransferDomesticDescription { get; set; }        //Genetic_Transfer_Domestic_Description intern informasjon
        public bool? RiskAssessmentGeneticTransferDomesticObserved { get; set; }  // Genetic_Transfer_Domestic_Observed
        public bool? RiskAssessmentGeneticTransferDomesticDocumented { get; set; }  // Genetic_Transfer_Domestic_Documented
        public bool? RiskAssessmentGeneticTransferForeignDocumented { get; set; }  // Genetic_Transfer_Foreign_Documented

        // -- (F) Kan overføre bakterier, parasitter eller virus til stedegne arter
        public string RiskAssessmentVectorBiologicalDiseaseSpreadingDomesticDescription { get; set; }    //Vector_Biological_Disease_Spreading_Domestic_Description intern informasjon
        public bool? RiskAssessmentBiologicalDiseaseSpreadingDomesticObserved { get; set; }  // Vector_Biological_Disease_Spreading_Domestic_Observed
        public bool? RiskAssessmentBiologicalDiseaseSpreadingDomesticDocumented { get; set; }  // Vector_Biological_Disease_Spreading_Domestic_Documented
        public bool? RiskAssessmentBiologicalDiseaseSpreadingForeignDocumented { get; set; }

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

        //[Name("Fremtidig spredningsprognose i Norge, inkl. potensielt utbredelsesområde, antatte kritiske parametre for arten, og forventede endringer i disse:")] // 
        public string SpreadHistoryDomesticDocumentation { get; set; } // fab: SpreadHistoryDomesticDocumentation
        //[Name("Detaljinformasjon for Naturtyper:")] // 
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
