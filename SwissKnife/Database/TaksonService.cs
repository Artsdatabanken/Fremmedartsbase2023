using System;
using System.Collections.Generic;
using System.Text;

using System.Linq;

using System.Threading.Tasks;
using System.Web;

using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Prod.Domain;


namespace SwissKnife.Database
{
    public class TaxonInfo
    {
        public int Id { get; set; } //taxonId
        public string CategoryValue { get; set; } // "kingdom" || "phylum" || "class" || "order" || ....
        public string Name { get; set; }
        public string ValidScientificName { get; set; }
        public int ValidScientificNameId { get; set; }
        public string ValidScientificNameAuthorship { get; set; }
        public int TaxonId { get; set; }
        public string PrefferedPopularname { get; set; }

        public string Kingdom { get; set; }
        public string Phylum { get; set; }
        public string Class { get; set; }
        public string Order { get; set; }
        public string Family { get; set; }
        public string Genus { get; set; }
        public string Species { get; set; }
        public string SubSpecies { get; set; }
        public ScientificName[] ScientificNames { get; set; }

        public class ScientificName
        {
            public int ScientificNameId { get; set; }
            public bool Accepted { get; set; }
            public string scientificName { get; set; }
        public string ScientificNameAuthorship { get; set; }
        }

        // public bool IsDeleted { get; set; } // dont care. always false from the nbic service
    }


    public class TaksonService
    {
        private HttpClient client;
        private const string baseUrl = @"https://artskart.artsdatabanken.no/publicapi/api/taxon";
        private const string taxonApiUrl = @"https://artsdatabanken.no/api/taxon/";
        //private string baseUrl;
        public TaksonService()
        {
            //var latnavn = textBox1.Text;

            //api/taxon/scientificnameid?id={ id}

            client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));

        }

        public static (string, string) GetFullPathScientificName(TaxonInfo ti)
        {
            string[] ranks = {
                "Kingdom",
                "Phylum",
                "Class",
                "Order",
                "Family",
                "Genus",
                "Species",
                "SubSpecies"
            };

            var result = ti.Kingdom;
            var names = new List<string>() {
                ti.Phylum,
                ti.Class,
                ti.Order,
                ti.Family,
                ti.Genus,
                ti.Species,
                ti.SubSpecies
            };
            var n = 0; // 0 = "Kingdom"
            foreach (var name in names)
            {
                if (name != null)
                {
                    n++;
                    result += "/" + name;
                }
            }
            return (result, ranks[n]);
        }

        public static string GetRankSciName(string fullPathScientificName, string rank)
        {
            string[] ranks = {
                "Kingdom",
                "Phylum",
                "Class",
                "Order",
                "Family",
                "Genus",
                "Species",
                "SubSpecies"
            };
            int ordinal = Array.IndexOf(ranks, rank);
            string[] taxonhierarcy = fullPathScientificName.Split('/');
            string result = taxonhierarcy[ordinal];
            return result;
        }

        private string scientificNameIdUrl(int scientificNameId)
        {
            string scinameIdUrl = baseUrl + @"/scientificnameid?id=";
            var url = scinameIdUrl + scientificNameId.ToString();
            return url;
        }
        private string taxonApiTaxonIdUrl(int taxonId)
        {
            //string scinameIdUrl = taxonApiUrl + @"scientificname/";
            var url = taxonApiUrl + taxonId.ToString();
            return url;
        }
        private string taxonApiTaxonScientificnameIdUrl(int taxonId)
        {
            string scinameIdUrl = taxonApiUrl + @"scientificname/";
            var url = scinameIdUrl + taxonId.ToString();
            return url;
        }
        private string taxonApiTaxonScientificnameUrl(string name)
        {
            string scinameIdUrl = taxonApiUrl + @"ScientificName?scientificName=";
            var url = scinameIdUrl + name.ToString();
            return url;
        }

        private string taxonIdUrl(int taxonId)
        {
            string taxonIdUrl = baseUrl + @"/";
            var url = taxonIdUrl + taxonId.ToString();
            return url;
        }

        private string scientificNameUrl(string scientificName)
        {
            string scinameUrl = baseUrl + @"?term=";
            var query = HttpUtility.UrlEncode(scientificName);
            var url = scinameUrl + query;
            return url;
        }

        private async Task<List<TaxonInfo>> getTaxonInfos(string url)
        {
            var response = await client.GetAsync(url).ConfigureAwait(false); ;
            if (response.IsSuccessStatusCode)
            {
                var taxonInfostring = await response.Content.ReadAsStringAsync().ConfigureAwait(false); ;
                List<TaxonInfo> taxonInfos = JsonConvert.DeserializeObject<List<TaxonInfo>>(taxonInfostring);
                return taxonInfos;
            }
            else
            {
                return null;
            }
        }
        private async Task<dynamic> getDynamicTaxonInfo(string url)
        {
            var response = await client.GetAsync(url).ConfigureAwait(false); ;
            if (response.IsSuccessStatusCode)
            {
                var taxonInfostring = await response.Content.ReadAsStringAsync().ConfigureAwait(false); ;
                dynamic taxonInfos = JsonConvert.DeserializeObject(taxonInfostring);
                return taxonInfos;
            }
            else
            {
                return null;
            }
        }


        public async Task<dynamic> getDynamicScientificNameInfo(int taxonId)
        {
            var url = taxonApiTaxonIdUrl(taxonId);
            var taxonInfos = await getDynamicTaxonInfo(url);
            return taxonInfos;
        }
        public async Task<dynamic> getDynamicScientificName2Info(int taxonId)
        {
            var url = taxonApiTaxonScientificnameIdUrl(taxonId);
            var taxonInfos = await getDynamicTaxonInfo(url);
            return taxonInfos;
        }
        public async Task<dynamic> getDynamicScientificName3Info(string name)
        {
            var url = taxonApiTaxonScientificnameUrl(name);
            var taxonInfos = await getDynamicTaxonInfo(url);
            return taxonInfos;
        }

        public async Task<TaxonInfo> getTaxonInfo(int scientificNameId)
        {
            var url = scientificNameIdUrl(scientificNameId);
            var taxonInfos = await getTaxonInfos(url);
            if (taxonInfos != null)
            {
                if (taxonInfos.Count() == 0)
                {
                    return null;
                }
                else if (taxonInfos.Count() > 1)
                {
                    throw new Exception("Api returnerer mer enn en taxoninfo for sci id: " + scientificNameId.ToString());
                }
                else
                {
                    return taxonInfos.First();
                }
            }
            else
            {
                return null;
            }
        }

        public async Task<TaxonInfo> getTaxonInfoFromTaxonId(int taxonId)
        {
            var url = taxonIdUrl(taxonId);
            var taxonInfos = await getTaxonInfos(url);
            if (taxonInfos != null)
            {
                if (taxonInfos.Count() == 0)
                {
                    return null;
                }
                else if (taxonInfos.Count() > 1)
                {
                    throw new Exception("Api returnerer mer enn en taxoninfo for taxonid: " + taxonId);
                }
                else
                {
                    return taxonInfos.First();
                }
            }
            else
            {
                return null;
            }
        }


        public async Task<TaxonInfo> getTaxonInfo(string latnavn, int? scientificnameid)
        {
            var url = scientificNameUrl(latnavn);
            var taxonInfos = await getTaxonInfos(url);
            if (taxonInfos != null)
            {
                if (taxonInfos.Count() == 0)
                {
                    return null;
                }
                else
                if (taxonInfos.Count() > 1)
                {
                    TaxonInfo it;
                    try
                    {
                        if (latnavn == "Erigeron uniflorus")
                        {
                            it = taxonInfos.Where(x => x.ValidScientificName == latnavn && x.ValidScientificNameAuthorship == "L.").SingleOrDefault();
                        }
                        else
                        if (latnavn == "Dichodontium flavescens")
                        {
                            it = taxonInfos.Where(x => x.ValidScientificName == latnavn && x.ValidScientificNameAuthorship == "(Dicks. ex With.) Lindb.").SingleOrDefault();
                        }
                        else
                        {
                            it = taxonInfos.Where(x => x.ValidScientificName == latnavn).SingleOrDefault();
                        }
                    }
                    catch (Exception e)
                    {

                        Console.WriteLine(e);
                        throw;
                    }

                    return it;
                }
                else
                {
                    if (scientificnameid.HasValue)
                    {
                        var tis = taxonInfos.Where(ti => ti.ValidScientificNameId == scientificnameid);
                        if (tis.Count() == 0)
                        {
                            return taxonInfos.First(); // did not find the scientific name id in the result, still return the matching name result
                        }
                        else
                        {
                            return tis.FirstOrDefault(x => x.CategoryValue == "22" || x.CategoryValue == "23" || x.CategoryValue == "24");
                        }
                    }
                    else
                    {
                        return taxonInfos.FirstOrDefault(x => x.CategoryValue == "22" || x.CategoryValue == "23" || x.CategoryValue == "24");
                    }
                }
            }
            else
            {
                return null;
            }
        }

        public class TaxonServiceResult
        {
            public string OrgScientificName { get; set; }
            public int OrgScientificNameId { get; set; }
            public int OrgTaxonId { get; set; }
            public string LogMessage { get; set; }
            public string CurrentScientificName { get; set; }
            public int CurrentScientificNameId { get; set; }
            public int CurrentTaxonId { get; set; }
            public string CurrentFullPathScientificName { get; set; }
            public string CurrentTaxonRank { get; set; }
            public string CurrentRecommendedPopularname { get; set; }
            public List<RlAssessment> Assessments { get; set; }

            public string CurrentScientificNameAuthor { get; set; }
        }


        public async Task<TaxonServiceResult> getUpdatedTaxonInfo(string scientificname, int scientificnameid, int taxonid, string assessmentid)
        {
            // manuell override:
            if (scientificname == "Brachycome iberidifolia") scientificname = "Brachyscome iberidifolia";
            if (scientificname == "Artemisia siversiana") scientificname = "Artemisia sieversiana";
            if (scientificnameid == 116282) scientificname = "Proctotrupes bistriatus";
            if (scientificname == "Aster x  frikartii") scientificname = "Aster x frikartii";
            if (scientificname == "Syringa ×persica") scientificname = "Syringa persica";
            if (scientificname == "Euphrasia stricta stricta") scientificname = "Euphrasia stricta brevipila";
            if (scientificname == "Hieracium vulgatum") scientificname = "Hieracium vulgatum agg.";

            if (scientificnameid == 107130)
            {
                var res = new TaxonServiceResult
                {
                    OrgScientificName = scientificname,
                    OrgScientificNameId = scientificnameid,
                    OrgTaxonId = taxonid,
                    CurrentScientificName = "Microspongium gelatinosum",
                    CurrentScientificNameId = 107130,
                    CurrentTaxonId = 66776,
                    CurrentRecommendedPopularname = "",
                    CurrentFullPathScientificName =
                        "Chromista/Ochrophyta/Phaeophyceae/Ectocarpales/Chordariaceae/Microspongium/gelatinosum",
                    CurrentTaxonRank = "Species"
                };

                return res;
            }
            if (scientificnameid == 107657)
            {
                var res = new TaxonServiceResult
                {
                    OrgScientificName = scientificname,
                    OrgScientificNameId = scientificnameid,
                    OrgTaxonId = taxonid,
                    CurrentScientificName = "Didemnum helgolandicum",
                    CurrentScientificNameId = 107657,
                    CurrentTaxonId = 67175,
                    CurrentRecommendedPopularname = "helgolandsekkdyr",
                    CurrentFullPathScientificName =
                        "Animalia/Chordata/Ascidiacea/Enterogona/Didemnidae/Didemnum/helgolandicum",
                    CurrentTaxonRank = "Species"
                };

                return res;
            }

            /*  nb=navnebase accepted name
             
             1. scientificnameid > 0 - søk på scientificnameid:
             -- hvis nb latnavn + scientificnameid er lik, oppdater taxonid (trenger ikke sjekke)
             -- hvis nb scientificnameid er lik, log og oppdater latnavn og taxonid
             -- hvis nb scientificnameid er ulik - log og oppdater scientificnameid, latnavn og taxonid


             2.  (scientificnameid == 0 || ingen treff i 1.) && vurdertnavn != null - søk på artsnavn:
             -- hvis nb latnavn er lik, oppdater scientificnameid og taxonid
             -- hvis nb latnavn er ulik, log, oppdater latnavn, scientificnameid og taxonid

             3. ingen treff i 2. && taxonid != null - søk på taxonid
             -- hvis latnavn er lik, oppdater scientificnameid og taxonid (trenger ikke sjekke)
             -- hvis latnavn er ulik, log, oppdater latnavn, scientificnameid og taxonid (trenger ikke sjekke)

            */
            if (string.IsNullOrWhiteSpace(assessmentid))
            {
                throw new Exception("Taxonservice 3 missing assessmentid");
            }
            if (string.IsNullOrWhiteSpace(scientificname) && scientificnameid <= 0 && taxonid <= 0)
            {
                Console.WriteLine("Taxonservice - no information to work on for asssesment: " + assessmentid.ToString());
            }
            var result = new TaxonServiceResult
            {
                OrgScientificName = scientificname,
                OrgScientificNameId = scientificnameid,
                OrgTaxonId = taxonid
            };
            if (result.OrgScientificNameId > 0)
            {
                var ti = await getTaxonInfo(result.OrgScientificNameId);
                if (ti != null)
                {
                    //dynamic sciName = await getDynamicScientificNameInfo(ti.ValidScientificNameId);
                    result.CurrentScientificName = ti.ValidScientificName;
                    result.CurrentScientificNameAuthor = ti.ValidScientificNameAuthorship;
                    result.CurrentScientificNameId = ti.ValidScientificNameId;
                    result.CurrentTaxonId = ti.TaxonId;
                    result.CurrentRecommendedPopularname = ti.PrefferedPopularname;
                    var cti = GetFullPathScientificName(ti);
                    result.CurrentFullPathScientificName = cti.Item1;
                    result.CurrentTaxonRank = cti.Item2;


                    if (ti.ValidScientificNameId == result.OrgScientificNameId && ti.ValidScientificName == result.OrgScientificName)
                    {
                        result.LogMessage = null;
                    }
                    else if (ti.ValidScientificNameId == result.OrgScientificNameId && ti.ValidScientificName != result.OrgScientificName)
                    {
                        result.LogMessage = "1. Same ScientificNameId, changed ScientificName: " + result.OrgScientificName + "->" + result.CurrentScientificName;
                    }
                    else if (ti.ValidScientificNameId != result.OrgScientificNameId)
                    {
                        result.LogMessage = "1. Changed ScientificnameId: " + result.OrgScientificNameId + "->" + result.CurrentScientificNameId + " - ScientificName: " + result.OrgScientificName + "->" + result.CurrentScientificName;
                    }

                }
            }
            if (result.CurrentScientificNameId <= 0 && !string.IsNullOrEmpty(result.OrgScientificName))
            {
                var ti = await getTaxonInfo(result.OrgScientificName, null);
                if (ti != null)
                {
                    result.CurrentScientificName = ti.ValidScientificName;
                    result.CurrentScientificNameAuthor = ti.ValidScientificNameAuthorship;
                    result.CurrentScientificNameId = ti.ValidScientificNameId;
                    result.CurrentTaxonId = ti.TaxonId;
                    result.CurrentRecommendedPopularname = ti.PrefferedPopularname;
                    var cti = GetFullPathScientificName(ti);
                    result.CurrentFullPathScientificName = cti.Item1;
                    result.CurrentTaxonRank = cti.Item2;

                    if (ti.ValidScientificName == result.OrgScientificName)
                    {
                        result.LogMessage = "2. Same ScientificName: " + result.OrgScientificName + " Scientificname: " + result.OrgScientificNameId + "->" + result.CurrentScientificNameId;
                    }
                    else
                    {
                        result.LogMessage = "2. Changed ScientificName: " + result.OrgScientificNameId + "->" + result.CurrentScientificNameId + " - changed ScientificName: " + result.OrgScientificName + "->" + result.CurrentScientificName;
                    }
                }
            }
            if (result.CurrentScientificNameId <= 0 && result.CurrentScientificName == null && result.OrgTaxonId > 0)
            {
                var ti = await getTaxonInfoFromTaxonId(result.OrgTaxonId);
                if (ti != null)
                {
                    result.CurrentScientificName = ti.ValidScientificName;
                    result.CurrentScientificNameAuthor = ti.ValidScientificNameAuthorship;
                    result.CurrentScientificNameId = ti.ValidScientificNameId;
                    result.CurrentTaxonId = ti.TaxonId;
                    result.CurrentRecommendedPopularname = ti.PrefferedPopularname;
                    var cti = GetFullPathScientificName(ti);
                    result.CurrentFullPathScientificName = cti.Item1;
                    result.CurrentTaxonRank = cti.Item2;
                    if (ti.ValidScientificName == result.OrgScientificName)
                    {
                        result.LogMessage = "3. Same ScientificName: " + result.OrgScientificName + " Scientificname: " + result.OrgScientificNameId + "->" + result.CurrentScientificNameId;
                    }
                    else
                    {
                        result.LogMessage = "3. Changed ScientificName: " + result.OrgScientificNameId + "->" + result.CurrentScientificNameId + " - changed ScientificName: " + result.OrgScientificName + "->" + result.CurrentScientificName;
                    }
                }
            }

            if (
                (result.CurrentScientificName == null
                || result.CurrentScientificNameId <= 0
                || result.CurrentTaxonId <= 0
                || result.CurrentFullPathScientificName == null
                || result.CurrentTaxonRank == null)
                && string.IsNullOrWhiteSpace(result.LogMessage)
                )
            {
                var message = "Taxonservice - no logg message for missing result. AssessmentId: " + assessmentid;
                Console.WriteLine(message);
                result.LogMessage = "NB! " + message;
            }
            return result;
        }






        public static async Task<TaxonInfo> GetTaxonInfo(string latnavn, int? scientificnameid)
        {
            //var latnavn = textBox1.Text;
            var query = HttpUtility.UrlEncode(latnavn);
            var baseUrl = @"http://webtjenester.artsdatabanken.no/Artskart/api/taxon?term=";
            var url = baseUrl + query;

            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await client.GetAsync(url).ConfigureAwait(false);
            if (response.IsSuccessStatusCode)
            {
                //var taxonInfos = await response.Content.ReadAsAsync<IEnumerable<TaxonInfo>>().ConfigureAwait(false); //.Result;
                var taxonInfostring = await response.Content.ReadAsStringAsync().ConfigureAwait(false); //.Result;
                List<TaxonInfo> taxonInfos = JsonConvert.DeserializeObject<List<TaxonInfo>>(taxonInfostring);
                if (taxonInfos.Count() == 0)
                {
                    return null;
                }
                else
                {
                    if (scientificnameid.HasValue)
                    {
                        var tis = taxonInfos.Where(ti => ti.ValidScientificNameId == scientificnameid);
                        if (tis.Count() == 0)
                        {
                            return taxonInfos.First(); // did not find the scientific name id in the result, still return the matching name result
                        }
                        else
                        {
                            return tis.First();
                        }
                    }
                    else
                    {
                        return taxonInfos.First();
                    }
                }
            }
            else
            {
                return null;
            }
        }

        //public async Task populateFromFullTaxonInfo(FA4 assessment,
        //    Dictionary<string, DatabankID> databankDictionary)
        //{
        //    try
        //    {
        //        dynamic sciName = await getDynamicScientificNameInfo(assessment.TaxonId);
        //        // special case - nongood taxon
        //        if (sciName == null || sciName.scientificNames == null || sciName.scientificNames.Count == 0)
        //        {
        //            // check nameid from taxonapi
        //            dynamic sciname2 = await getDynamicScientificName2Info(assessment.EvaluatedScientificNameId.Value);
        //            if (sciname2 != null && sciname2.taxonID != null)
        //            {
        //                Fixipus(assessment, sciname2);
        //                sciName = await getDynamicScientificNameInfo(assessment.TaxonId);
        //            }
        //            else if(!string.IsNullOrWhiteSpace(assessment.ImportInfo.OrgVitenskapeligNavn))
        //            {
        //                dynamic sciname3 = await getDynamicScientificName3Info(assessment.ImportInfo.OrgVitenskapeligNavn);
        //                if (sciname3 != null && sciname3.Count == 1 && sciname3[0] != null && sciname3[0].taxonID != null)
        //                {
        //                    Fixipus(assessment, sciname3[0]);


        //                    sciName = await getDynamicScientificNameInfo(assessment.TaxonId);
        //                }
        //                else if (sciname3 != null && sciname3.Count > 1)
        //                {

        //                }
        //            }

        //        }
        //        if (assessment.LatinsknavnId == 0)
        //        {
        //            assessment.LatinsknavnId = assessment.EvaluatedScientificNameId;
        //        }

        //        if (assessment.ImportInfo.OrgVitenskapeligNavnId == 0)
        //        {
        //            assessment.ImportInfo.OrgVitenskapeligNavnId = assessment.LatinsknavnId;
        //        }

        //        // prøv å identifisere 2015 og 2010 vurderinger
        //        var found2015 = false;
        //        var found2015dilemma = false;
        //        var found2010 = false;
        //        foreach (dynamic name in sciName.scientificNames)
        //        {
        //            var vitenskapeligNavn = (name.scientificName.ToString() + ' ' + name.scientificNameAuthorship.ToString()).Trim();
        //            if (string.IsNullOrWhiteSpace(assessment.ImportInfo.OrgVitenskapeligNavn) && assessment.ImportInfo.OrgVitenskapeligNavnId > 0 && name.scientificNameID.ToString() == assessment.ImportInfo.OrgVitenskapeligNavnId.ToString())
        //            {
        //                assessment.ImportInfo.OrgVitenskapeligNavn =
        //                    vitenskapeligNavn;
        //            }
        //            if (assessment.ImportInfo.OrgVitenskapeligNavnId > 0 && name.scientificNameID.ToString() == assessment.ImportInfo.OrgVitenskapeligNavnId.ToString() && assessment.ImportInfo.OrgVitenskapeligNavn != vitenskapeligNavn)
        //            {
        //                assessment.ImportInfo.OrgVitenskapeligNavn =
        //                    vitenskapeligNavn;
        //            }
        //            if (assessment.ImportInfo.OrgVitenskapeligNavnId == 0 && assessment.ImportInfo.OrgVitenskapeligNavn == name.scientificName.ToString())
        //            {
        //                assessment.ImportInfo.OrgVitenskapeligNavnId = int.Parse(name.scientificNameID.ToString());
        //            }

        //            //se om 2015 vurdering er der:
        //            List<RlAssessment> assess = GetAssesments(name, new[] {"Rødliste 2015"}, assessment.VurderingsContext, 2015);
        //            var importInfoKategori2015 = assessment.ImportInfo.Kategori2015;
        //            if (importInfoKategori2015 != null && importInfoKategori2015.Length == 3)
        //            {
        //                importInfoKategori2015 = importInfoKategori2015.Substring(0, 2);
        //            }
        //            if (assess.Count == 1 && assess[0].Kategori == importInfoKategori2015)
        //            {
        //                if (found2015)
        //                {
        //                    assessment.ImportInfo.MultipleUrl2015 =
        //                        (string.IsNullOrWhiteSpace(assessment.ImportInfo.MultipleUrl2015)
        //                            ? assessment.ImportInfo.Url2015
        //                            : assessment.ImportInfo.MultipleUrl2015) + ";" + assess[0].Url;
        //                    if (assessment.LatinsknavnId != assessment.ImportInfo.ScientificNameId2015 &&
        //                        assess[0].SciId == assessment.LatinsknavnId)
        //                    {
        //                        // den nye er bedre match
        //                        //assessment.VurderingsId2015Int = assess[0].AssId;
        //                        assessment.ImportInfo.Url2015 = assess[0].Url;
        //                        assessment.ImportInfo.ScientificNameId2015 = assess[0].SciId;
        //                        found2015dilemma = false;
        //                    }
        //                    else if (assessment.LatinsknavnId == assessment.ImportInfo.ScientificNameId2015 &&
        //                             assess[0].SciId != assessment.LatinsknavnId)
        //                    {
        //                        // den gamle var bedre match
        //                    }
        //                    else
        //                    {
        //                        found2015dilemma = true;
        //                        //throw new Exception("too many");
        //                    }

        //                }
        //                else
        //                {
        //                    found2015 = true;
        //                //assessment.VurderingsId2015Int = assess[0].AssId;
        //                assessment.ImportInfo.Url2015 = assess[0].Url;
        //                assessment.ImportInfo.ScientificNameId2015 = assess[0].SciId;
        //                }


        //            }
        //            else if (assess.Count > 1)
        //            {
        //                throw new Exception("too many");
        //            }

        //            assess = GetAssesments(name,new []{ "Rødliste 2010" }, assessment.VurderingsContext,2010);
        //            if (assess.Count == 1 && (string.IsNullOrWhiteSpace(assessment.ImportInfo.Kategori2010) || assess[0].Kategori == assessment.ImportInfo.Kategori2010))
        //            {
        //                if (found2010)
        //                {
        //                    assessment.ImportInfo.MultipleUrl2010 =
        //                        (string.IsNullOrWhiteSpace(assessment.ImportInfo.MultipleUrl2010)
        //                            ? assessment.ImportInfo.Url2010
        //                            : assessment.ImportInfo.MultipleUrl2010) + ";" + assess[0].Url;
        //                }
        //                else
        //                {
        //                    found2010 = true;
        //                    assessment.ImportInfo.VurderingsId2010 = assess[0].AssId;
        //                    assessment.ImportInfo.Url2010 = assess[0].Url;
        //                    assessment.ImportInfo.ScientificNameId2010 = assess[0].SciId;
        //                    if (string.IsNullOrWhiteSpace(assessment.KategoriFraForrigeListe))
        //                    {
        //                        assessment.KategoriFraForrigeListe = assess[0].Kategori;
        //                        assessment.Kategori = assess[0].Kategori;
        //                    }

        //                    if (string.IsNullOrWhiteSpace(assessment.ImportInfo.Kategori2010))
        //                    {
        //                        assessment.ImportInfo.Kategori2010 = assess[0].Kategori;
        //                    }
        //                }
        //            }
        //            else if (assess.Count > 1)
        //            {
        //                throw new Exception("too many");
        //            }

        //            assess = GetAssesments(name, new[] { "Rødliste 2015" }, assessment.VurderingsContext, 2010);
        //            if (assess.Count == 1 && (string.IsNullOrWhiteSpace(assessment.ImportInfo.Kategori2010) || assess[0].Kategori == assessment.ImportInfo.Kategori2010))
        //            {
        //                if (found2010)
        //                {
        //                    assessment.ImportInfo.MultipleUrl2010 =
        //                        (string.IsNullOrWhiteSpace(assessment.ImportInfo.MultipleUrl2010)
        //                            ? assessment.ImportInfo.Url2010
        //                            : assessment.ImportInfo.MultipleUrl2010) + ";" + assess[0].Url;
        //                }
        //                else
        //                {
        //                    found2010 = true;
        //                    assessment.ImportInfo.VurderingsId2010 = assess[0].AssId;
        //                    assessment.ImportInfo.Url2010 = assess[0].Url;
        //                    assessment.ImportInfo.ScientificNameId2010 = assess[0].SciId;
        //                    if (string.IsNullOrWhiteSpace(assessment.KategoriFraForrigeListe))
        //                    {
        //                        assessment.KategoriFraForrigeListe = assess[0].Kategori;
        //                        assessment.Kategori = assess[0].Kategori;
        //                    }

        //                    if (string.IsNullOrWhiteSpace(assessment.ImportInfo.Kategori2010))
        //                    {
        //                        assessment.ImportInfo.Kategori2010 = assess[0].Kategori;
        //                    }
        //                }
        //            }
        //            else if (assess.Count > 1)
        //            {
        //                throw new Exception("too many");
        //            }
        //        }

        //        if (found2015dilemma)
        //        {
        //            //throw new Exception("too many and none good");
        //        }

        //        if (!found2015 && found2010)
        //        {
        //            assessment.SistVurdertAr = 2010;
        //        }
        //        else if (found2015)
        //        {
        //            assessment.SistVurdertAr = 2015;
        //        }
        //        else
        //        {
        //            assessment.SistVurdertAr = 0;
        //        }

        //        // try fix original names = 
        //        if (assessment.ImportInfo.ScientificNameId2015 > 0)
        //        {
        //            // traverse and identify name
        //            assessment.ImportInfo.ScientificName2015 = GetScientificName(sciName, assessment.ImportInfo.ScientificNameId2015);
        //        }

        //        if (assessment.ImportInfo.ScientificNameId2010 > 0)
        //        {
        //            // traverse and identify name
        //            assessment.ImportInfo.ScientificName2010 = GetScientificName(sciName, assessment.ImportInfo.ScientificNameId2010);
        //        }

        //        if (!assessment.Slettet)
        //        {
        //            // try identify databank 
        //            var match = false;

        //            match = TryMatch(assessment, databankDictionary,
        //                ("Rodliste2015/" + (assessment.ImportInfo.VurderingsId2015.IndexOf("/N/") > 0 ? "N" : "S") + "/" +
        //                 assessment.LatinsknavnId).ToLowerInvariant());
        //            if (!match)
        //            {
        //                match = TryMatch(assessment, databankDictionary,
        //                    ("Rodliste2015/" + (assessment.ImportInfo.VurderingsId2015.IndexOf("/N/") > 0 ? "N" : "S") + "/" +
        //                     assessment.ImportInfo.OrgVitenskapeligNavnId).ToLowerInvariant());
        //            }
        //            if (!match)
        //            {
        //                match = TryMatch(assessment, databankDictionary,
        //                    ("Rodliste2015/" + (assessment.ImportInfo.VurderingsId2015.IndexOf("/N/") > 0 ? "N" : "S") + "/" +
        //                     assessment.ImportInfo.ScientificNameId2015).ToLowerInvariant());
        //            }

        //            if (!match)
        //            {
        //                match = TryMatch(assessment, databankDictionary,
        //                    ("Rodliste2015/" + (assessment.ImportInfo.VurderingsId2015.IndexOf("/N/") > 0 ? "N" : "S") + "/" +
        //                     assessment.ImportInfo.ScientificNameId2010).ToLowerInvariant());
        //            }
        //        }

        //        // final fix for stupid ass assessments - with bad connections----
        //        if (assessment.LatinsknavnId == 5817 || assessment.LatinsknavnId == 10820 || assessment.LatinsknavnId == 119005 || assessment.LatinsknavnId == 62063)
        //        {
        //            int ny = 0;
        //            if (assessment.LatinsknavnId == 5817) ny = 186669;
        //            if (assessment.LatinsknavnId == 10820) ny = 10822;
        //            if (assessment.LatinsknavnId == 119005) ny = 120168;
        //            if (assessment.LatinsknavnId == 62063) ny = 151988;
        //            // check nameid from taxonapi
        //            dynamic sciname2 = await getDynamicScientificName2Info(ny);
        //            if (sciname2 != null && sciname2.taxonID != null)
        //            {
        //                Fixipusoverride(assessment, sciname2);
        //            }
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        Console.WriteLine(e);
        //    }
        //}

        private static void Fixipus(FA4 assessment, dynamic sciname3)
        {
            assessment.TaxonId = sciname3.taxonID;
            if (string.IsNullOrWhiteSpace(assessment.EvaluatedScientificName))
                assessment.EvaluatedScientificName = sciname3
                    .scientificName.ToString();
            if (string.IsNullOrWhiteSpace(assessment.EvaluatedScientificNameAuthor))
                assessment.EvaluatedScientificNameAuthor = sciname3
                                                          .scientificNameAuthorship.ToString();
            if (assessment.EvaluatedScientificNameId == 0)
                assessment.EvaluatedScientificNameId = int.Parse(sciname3
                    .scientificNameID.ToString());
            if (string.IsNullOrWhiteSpace(assessment.EvaluatedScientificNameRank))
                assessment.EvaluatedScientificNameRank = sciname3
                    .taxonRank.ToString();


            if (string.IsNullOrWhiteSpace(assessment.TaxonHierarcy))
            {
                var pis = new List<string>();
                foreach (dynamic thep in sciname3.higherClassification)
                {
                    string[] split = thep.scientificName.ToString()
                        .Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    pis.Add(split.Last());
                }

                assessment.TaxonHierarcy = string.Join("/", pis.ToArray());
            }
        }
        private static void Fixipusoverride(FA4 assessment, dynamic sciname3)
        {
            assessment.TaxonId = sciname3.taxonID;
            assessment.EvaluatedScientificName = sciname3
                                                          .scientificName.ToString();
            assessment.EvaluatedScientificNameAuthor = sciname3
                                                           .scientificNameAuthorship.ToString();
            assessment.EvaluatedScientificNameId = int.Parse(sciname3
                    .scientificNameID.ToString());
            assessment.EvaluatedScientificNameRank = sciname3
                    .taxonRank.ToString();

            var pis = new List<string>();
            foreach (dynamic thep in sciname3.higherClassification)
            {
                string[] split = thep.scientificName.ToString()
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries);
                pis.Add(split.Last());
            }

            assessment.TaxonHierarcy = string.Join("/", pis.ToArray());
        }

        private static bool TryMatch(FA4 assessment, Dictionary<string, DatabankID> databankDictionary, string assessmentLatinsknavnId)
        {
            bool match = false;
            if (databankDictionary.ContainsKey(assessmentLatinsknavnId))
            {
                var it = databankDictionary[assessmentLatinsknavnId];
                if (it.Match != null)
                {
                }

                databankDictionary[assessmentLatinsknavnId].Match = assessment.ImportInfo.VurderingsId2015;
                databankDictionary[assessmentLatinsknavnId].Matches.Add(assessment);
                match = true;
                assessment.ImportInfo.VurderingsId2015Databank = it.databankVurdering.Id;
                if (string.IsNullOrWhiteSpace(assessment.ImportInfo.ScientificName2015) || !assessment.ImportInfo.ScientificName2015.StartsWith(it.databankVurdering.VurdertVitenskapeligNavn.ToString()))
                {
                    if (!assessment.EvaluatedScientificName.StartsWith(it.databankVurdering.EvaluatedScientificName.ToString()))
                    {
                        Console.WriteLine(it.databankVurdering.EvaluatedScientificName.ToString() + " -> " + assessment.ImportInfo.ScientificName2015 + " -> " + assessment.EvaluatedScientificName);
                    }
                }
                if (assessment.ImportInfo.ScientificNameId2015.ToString() != it.databankVurdering.LatinsknavnId.ToString())
                {

                }
                //if (assessment. != it.databankVurdering.Kategori.ToString())
                //{

                //}
            }
            return match;
        }

        private static string GetScientificName(dynamic sciName, int id)
        {
            var found = false;
            string result = null;
            foreach (dynamic name in sciName.scientificNames)
            {
                if (name.scientificNameID == id)
                {
                    found = true;

                    result = (name.scientificName.ToString() + ' ' + name.scientificNameAuthorship.ToString()).Trim();
                }
            }

            if (!found)
            {
                throw new Exception("Name not found");
            }
            return result;
        }

        private static List<RlAssessment> GetAssesments(dynamic name, string[] rødliste, string context, int year)
        {
            var asses = new List<RlAssessment>();
            foreach (dynamic dynamicProperty in name.dynamicProperties)
            {
                if (dynamicProperty.Name != "Kategori") continue;
                var good = true;
                var ass = new RlAssessment { Kategori = dynamicProperty.Value.ToString() };
                foreach (var property in dynamicProperty.Properties)
                {
                    if (!good) continue;
                    switch (property.Name.ToString())
                    {
                        case "Kontekst":

                            string value = property.Value.ToString();
                            if (!rødliste.Contains(value))
                            {
                                good = false;
                            }

                            break;
                        case "RodlistevurderingID":
                            ass.AssId = int.Parse(property.Value.ToString());
                            break;
                        case "scientificNameID":
                            ass.SciId = int.Parse(property.Value.ToString());
                            break;
                        case "Aar":
                            if (property.Value.ToString() != year.ToString())
                            {
                                good = false;
                            }
                            ass.Year = int.Parse(property.Value.ToString());
                            break;
                        case "Url":
                            ass.Url = property.Value.ToString();
                            break;
                        case "Område":
                            if (property.Value.ToString() == "Norge")
                            {
                                ass.Region = "N";
                            }
                            else if (property.Value.ToString() == "Svalbard")
                            {
                                ass.Region = "S";
                            }
                            else
                            {
                            }

                            break;
                    }
                }

                if (ass.AssId == 0)
                {
                    ass.AssId = ass.SciId;
                }

                if (good) asses.Add(ass);
            }
            return asses.Where(x => x.Region == context).ToList();
        }
    }

    public class RlAssessment
    {
        public string Kategori { get; set; }
        public int AssId { get; set; }
        public int Year { get; set; }
        public string Url { get; set; }
        public string Region { get; set; }
        public int SciId { get; set; }
    }
    public class DatabankID
    {
        public DatabankID()
        {
            Matches = new List<FA4>();
        }
        public string Match { get; set; }
        public dynamic databankVurdering { get; set; }
        public List<FA4> Matches { get; set; }
    }
}

