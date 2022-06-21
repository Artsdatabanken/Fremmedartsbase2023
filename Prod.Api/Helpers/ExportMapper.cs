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
                        dest.AOO10yrLow = AOO10yrLow(src.RiskAssessment); //returnerer nada 
                        dest.AOO10yrHigh = AOO10yrHigh(src.RiskAssessment); //returnerer nada 

                    });


            });
            var mapper = new Mapper(mapperConfig);
            return mapper;
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
            //console.log("#&! AOO10yr occ: " + occ.toString() + " intr: " + intr.toString() + " result: " + result.toString())
            return result;
        }
        
        private static long? AOO10yrBest(RiskAssessment ra)
        {
            //kan vurdere å legge inn en spørring på om arten er en dørstokkart..
            var result = AOO10yr(ra.Occurrences1Best, ra.IntroductionsBest);
            return result;
        }

        private static long? AOO10yrLow(RiskAssessment ra)
        {
            //kan vurdere å legge inn en spørring på om arten er en dørstokkart..
            var result = AOO10yr(ra.Occurrences1Low, ra.IntroductionsLow);
            return result;
        }
        private static long? AOO10yrHigh(RiskAssessment ra)
        {
            //kan vurdere å legge inn en spørring på om arten er en dørstokkart..
            var result = AOO10yr(ra.Occurrences1High, ra.IntroductionsHigh);
            return result;
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
        [Name("Vurderingsområde")]
        public string EvaluationContext { get; set; }        
        // public bool IsEvaluated { get; set; }  // ???
        //public bool IsDeleted { get; set; }
        [Name("Vurderinsstatus")]
        public string EvaluationStatus { get; set; }
        [Name("Vitenskapelig navneID")]
        public string EvaluatedScientificNameId { get; set; }
        //public Datasett Datasett { get; set; } = new Datasett();

        [Name("Taksonsomisk sti")]
        public string TaxonHierarcy { get; set; }
        //public string DoorKnockerType { get; set; }
        
        [Name("Vitenskapelig navn")]
        public string EvaluatedScientificName { get; set; }
        [Name("Autor")]
        public string EvaluatedScientificNameAuthor { get; set; }
        [Name("Taksonomisk rang")]
        public string EvaluatedScientificNameRank { get; set; }

        [Name("Norsk navn")]
        public string EvaluatedVernacularName { get; set; }
        [Name("Sist endret")]
        public DateTime LastUpdatedAt { get; set; }
        [Name("Sist endret av")]
        public string LastUpdatedBy { get; set; }
        

        //public int TaxonId { get; set; }

        // public string Citation { get; set; }
        [Name("Fremmedartsstatus")]
        public string AlienSpeciesCategory { get; set; }
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
            public long? IntroductionsLow { get; set; }	    // lavt anslag på antall introduksjoner i løpet av 10 år - Denne funker!!
            [Name("AntIntroduksjonerIla10aarBesteAnslag")]
            public long? RiskAssessmentIntroductionsBest { get; set; }	// beste anslag på antall introduksjoner i løpet av 10 år 
            [Name("AntIntroduksjonerIla10aarHoytAnslag")]
            public long? IntroductionsHigh { get; set; }	// høyt anslag på antall introduksjoner i løpet av 10 år - VIRKER IKKE
            [Name("AOO10aarEtterForsteIntroduksjonLavtAnslag")]
            public long? AOO10yrLow { get; set; } // lavt anslag på totalt forekomstareal om 10 år - VIRKER IKKE 
             [Name("AOO 10 år etter første introduksjon beste anslag")]
            public long? AOO10yrBest { get; set; } // beste anslag på totalt forekomstareal om 10 år - Tester.. - her trengs nok en justering i koden. spytter ut feil tall!
            [Name("AOO 10 år etter første introduksjon høyt anslag")]
            public long? AOO10yrHigh { get; set; } // høyt anslag på totalt forekomstareal om 10 år - VIRKER IKKE 

            //Regionvis utbredelse "fylkesforekomst"
            [Name("RegionvisUtbredelse")]
            public string RegionalDistribution {get; set;}
            [Name("RegionvisUtbredelseKommentar")]
            public string CurrentPresenceComment { get; set; }
            #endregion Utbredelse
            
            #region Naturtyper
            //public List<ImpactedNatureType> ImpactedNatureTypes { get; set; } = new List<ImpactedNatureType>(); TO DO - lag en string av de valgte naturtypene 16.06.22
            [Name("EffektPaaTruetSjeldenNaturtypeBeskrivelse")] //Todo: Hvilket felt er dette? 16.06.22
            public string RiskAssessmentThreatenedNatureTypesAffectedDomesticDescription { get; set; }  
            #endregion Naturtyper
        #endregion Bakgrunnsdata for risikovurdering
        #region RiskAssessment 
        public string Category { get; set; }
        public string Criteria { get; set; }

        public string Category2018 { get; set; }
        public string Criteria2018 { get; set; }
            
        // public string ProductionSpeciesDescription { get; set; } = "";

        // public int RiskAssessmentRiskLevel { get; set; } = -1;
        // public string RiskAssessmentDecisiveCriteria { get; set; }
        public string RiskAssessmentRiskLevelCode { get; set; }
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
        // public bool RiskAssessmentActiveRedListCategoryLevel { get; set; } // lagt til 27.09.2016
        // public string RiskAssessmentRedListUsedCriteria { get; set; }  // lagt til 07.09.2016
        // public string RiskAssessmentRedListDataDescription { get; set; }  // lagt til 07.09.2016
        // public string RiskAssessmentRedListCategory { get; set; }  // lagt til 07.09.2016
        // public string RiskAssessmentRedListSubCategory { get; set; }  // lagt til 07.09.2016
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
        public long RiskAssessmentLifetimeUpperQ  { get; set; } // øvre kvartil for artens levetid i Norge i år 
        #endregion Median life time

        // public string RiskAssessmentAmethod { get; set; } // metode som ble brukt for å beregne A-kriteriet 
        public int RiskAssessmentAscore { get; set; } // skår for A-kriteriet 
        public int RiskAssessmentAlow { get; set; } // nedre skår for A-kriteriet (inkludert usikkerhet) 
        public int RiskAssessmentAhigh { get; set; } // øvre skår for A-kriteriet (inkludert usikkerhet) 
        // public string RiskAssessmentBmethod { get; set; } // metode som ble brukt for å beregne B-kriteriet 
        public int RiskAssessmentBscore { get; set; } // skår for B-kriteriet 
        public int RiskAssessmentBlow { get; set; } // nedre skår for B-kriteriet (inkludert usikkerhet) 
        public int RiskAssessmentBhigh { get; set; } // øvre skår for B-kriteriet (inkludert usikkerhet) 

        public string RiskAssessmentBCritMCount { get; set; } = "";
        public string RiskAssessmentBCritExact { get; set; } = "false";
        public string RiskAssessmentBCritP { get; set; }
        public string RiskAssessmentBCritNewObs { get; set; } = "True";


        public int RiskAssessmentStartYear { get; set; } // startår for B-kriteriet / utbredelse

        public int RiskAssessmentEndYear { get; set; } // sluttår for B-kriteriet / utbredelse


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




        #region unused ???????
        [Name("Beskrivelse")]
        public string RiskAssessmentSpreadManualEstimate { get; set; } // fab: Spread_Manual_Estimate
        public string RiskAssessmentSpreadManualEstimateSpeciesLongevity { get; set; } // fab: Spread_Manual_Estimate_Species_Longevity
        // public bool? RiskAssessmentSpreadManualEstimateSpeciesLongevityIsMoreThan1000years { get; set; } // fab: Spread_Manual_Estimate_Species_Longevity_More_than_1000_years



        // -- fortetningsrate
        // [Name("Fortetningsrate, konklusjon")]
        // public string RiskAssessmentIncreasingDensity { get; set; }  // Increasing_Density_Conclusion
        // [Name("Grunnlag for fortetningsrate")]
        // public string RiskAssessmentIncreasingDensityMethod { get; set; }  // Increasing_Density_Method
        #endregion





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
        //public string SpeciesSpeciesInteractionsSupplementaryInformation { get; set; }

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
        public string RiskAssessmentCommonNatureTypesAffectedDomesticDescription { get; set; }         // Common_Nature_Types_Affected_Domestic_Description??????????????
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

        public bool? IsAlienSpecies { get; set; }

        public string IsAlien { get; set; } // new in 2021
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

        //public List<RedlistedNatureType> RedlistedNatureTypes { get; set; } = new List<RedlistedNatureType>(); //lagt til 18.11.2016

        //public List<Habitat> Habitats { get; set; } = new List<Habitat>();

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
