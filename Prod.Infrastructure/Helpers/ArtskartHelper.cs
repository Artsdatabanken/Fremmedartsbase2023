using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Prod.Domain;

namespace Prod.Infrastructure.Helpers
{
    public class ArtskartHelper
    {
        public static async Task<byte[]> GetZipDataFromArtskart(FA4 fab4)
        {
            // hent datasett fra artskart
            var date = DateTime.Parse((string)fab4.ArtskartSistOverført);
            var kriterier = fab4.ArtskartModel;

            var apibase = 
                //"http://localhost:16784/api/listhelper/";
                "https://artskart.artsdatabanken.no/PublicApi/api/listhelper/";
            var type = //"all";
                kriterier.ExcludeObjects == false
                    ? "all"
                    : "specimen";
            var region =
                kriterier.IncludeNorge == kriterier.IncludeSvalbard
                    ? "all"
                    : kriterier.IncludeNorge
                        ? "fastland"
                        : "svalbard";
            var excludeGbif =
                kriterier.ExcludeGbif ? "&sourcedatabases[]=-40,-211" : "";
            var queryparams =
                $"&fromYear={kriterier.ObservationFromYear}&toYear={kriterier.ObservationToYear}&type={type}&region={region}{excludeGbif}";
            queryparams += $"&scientificNameId={fab4.EvaluatedScientificNameId}";

            if (!string.IsNullOrWhiteSpace(fab4.ArtskartSelectionGeometry))
            {
                queryparams += $"&geojsonPolygon=";
                JsonElement json = JsonSerializer.Deserialize<JsonElement>(fab4.ArtskartSelectionGeometry);
                var coordinates = json.GetProperty("geometry")
                    .GetProperty("coordinates")
                    .EnumerateArray();//.TryGetStringArray("coordinates");
                //dynamic items = coordinates[0];
                foreach (JsonElement item in coordinates)
                {
                    //var list = item.TryGetStringArray()
                    foreach (JsonElement i in item.EnumerateArray())
                    {
                        foreach (JsonElement o in i.EnumerateArray())
                        {
                            string s = o.ToString();
                            queryparams += s.Replace(",", ".") + ",";
                        }
                    }
                }

                queryparams = queryparams.Substring(0, queryparams.Length - 1);
            }

            if (!string.IsNullOrWhiteSpace(fab4.ArtskartAdded))
            {
                queryparams += $"&addPoints={fab4.ArtskartAdded}";
            }

            if (!string.IsNullOrWhiteSpace(fab4.ArtskartRemoved))
            {
                queryparams += $"&removePoints={fab4.ArtskartRemoved}";
            }

            queryparams += "&crs=EPSG:32633";

            var urlen = apibase + fab4.TaxonId + "/downloadObservations/?" + queryparams;
            var postparam = "";
            if (fab4.ArtskartWaterModel != null && fab4.ArtskartWaterModel.Areas != null)
            {
                var geoids = Enumerable.ToArray<string>(fab4.ArtskartWaterModel.Areas.Where(x => x.Selected == 1).Select(x => "\"" + x.GlobalId + "\""));
                if (geoids.Length > 0)
                {
                    postparam = "["+ string.Join(",", geoids) +"]";
                }
            }

            
            using var client = new HttpClient();
            var post = await client.PostAsync(urlen, new StringContent(postparam));
            var test = post.IsSuccessStatusCode;
            var zipfile = await post.Content.ReadAsByteArrayAsync();
            //var zipfile = await client.GetByteArrayAsync(urlen);
            return zipfile;
        }
    }
}
