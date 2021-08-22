using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
// using Newtonsoft.Json;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;

// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting


namespace Prod.Api.Services
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

        // public bool IsDeleted { get; set; } // dont care. always false from the nbic service
    }
    public class TaxonService
    {

        private readonly HttpClient client;
        private const string BaseUrl = @"https://artskart.artsdatabanken.no/publicapi/api/taxon";
        public TaxonService()
        {
            client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
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

        private string scientificNameIdUrl(int scientificNameId)
        {
            string scinameIdUrl = BaseUrl + @"/scientificnameid?id=";
            var url = scinameIdUrl + scientificNameId.ToString();
            return url;
        }

        private async Task<List<TaxonInfo>> GetTaxonInfosAsync(string url)
        {
            var response = await client.GetAsync(url).ConfigureAwait(false); ;
            if (response.IsSuccessStatusCode)
            {
                var taxonInfostring = await response.Content.ReadAsStringAsync();
                List<TaxonInfo> taxonInfos = JsonSerializer.Deserialize<List<TaxonInfo>>(taxonInfostring);
                return taxonInfos;
            }
            else
            {
                return null;
            }
        }


        public async Task<TaxonInfo> GetTaxonInfoAsync(int scientificNameId)
        {
            var url = scientificNameIdUrl(scientificNameId);
            var taxonInfos = await GetTaxonInfosAsync(url);
            if (taxonInfos != null)
            {
                if (!taxonInfos.Any())
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


    }
}
