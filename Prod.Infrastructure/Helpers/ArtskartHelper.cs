using System.Text.Json;
using Prod.Domain;

namespace Prod.Infrastructure.Helpers
{
    /// <summary>
    /// Helper method to download archive of data from Artskart based on criteria selected on assessment
    /// </summary>
    public class ArtskartHelper
    {
        public static async Task<byte[]> GetZipDataFromArtskart(FA4 fab4)
        {
            var criteria = fab4.ArtskartModel;

            var apiBase = "https://artskart.artsdatabanken.no/PublicApi/api/listhelper/"; //"http://localhost:16784/api/listhelper/"; for testing on localhost artskart

            var queryParameters = GenerateQueryParameters(fab4, criteria);
            
            // Parameters that may be to long for url
            var postParameters = GeneratePostParameters(fab4);

            var requestUri = apiBase + fab4.TaxonId + "/downloadObservations/?" + queryParameters;

            using var client = new HttpClient();
            var post = await client.PostAsync(requestUri, new StringContent(postParameters));

            var zipFile = await post.Content.ReadAsByteArrayAsync();

            return zipFile;
        }

        private static string GeneratePostParameters(FA4 fab4)
        {
            var parameters = "";
            if (fab4.ArtskartWaterModel != null && fab4.ArtskartWaterModel.Areas != null)
            {
                var geoids = Enumerable.ToArray<string>(fab4.ArtskartWaterModel.Areas.Where(x => x.Selected == 1).Select(x => "\"" + x.GlobalId + "\""));
                if (geoids.Length > 0)
                {
                    parameters = "["+ string.Join(",", geoids) +"]";
                }
            }

            return parameters;
        }

        private static string GenerateQueryParameters(FA4 fab4, ArtskartModel criteria)
        {
            var type = //"all";
                criteria.ExcludeObjects == false
                    ? "all"
                    : "specimen";
            var region =
                criteria.IncludeNorge == criteria.IncludeSvalbard
                    ? "all"
                    : criteria.IncludeNorge
                        ? "fastland"
                        : "svalbard";
            var excludeGbif =
                criteria.ExcludeGbif ? "&sourcedatabases[]=-40,-211" : "";
            var queryparams =
                $"&fromYear={criteria.ObservationFromYear}&toYear={criteria.ObservationToYear}&type={type}&region={region}{excludeGbif}";
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
            return queryparams;
        }
    }
}
