using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
// ReSharper disable AsyncConverter.ConfigureAwaitHighlighting

namespace Prod.Api.Services
{
    public class ReferenceServiceOptions {
        public string AuthAuthority { get; set; }
        public string ReferenceApiEndPoint { get; set; }
        public string ReferenceApiClientSecret { get; set; }
        public string ReferenceApiScope { get; set; }
        public string ReferenceApiClientId { get; set; }
        public string ReferenceApiAuthAuthority { get; set; }
    }

    public class ReferenceService: IReferenceService
    {
        public static int AppId = 26; // id for fab4 in referencedb ....
        private static HttpClient _apiClient;
        private static DateTime _apiClientExpiresAt;
        private readonly ReferenceServiceOptions options;

        private HttpClient GetClient
        {
            get
            {
                if (_apiClient != null && (_apiClientExpiresAt > DateTime.UtcNow.AddSeconds(30))) return _apiClient;
                // discover endpoints from metadata
                using (var client = new HttpClient())
                {
                    var discoveryDocument = client.GetDiscoveryDocumentAsync(options.ReferenceApiAuthAuthority).ConfigureAwait(false).GetAwaiter().GetResult();

                    if (discoveryDocument.IsError)
                    {
                        Console.WriteLine(discoveryDocument.Error);
                        throw new Exception(discoveryDocument.Error);
                    }

                    // request token
                    //var clientSecret = "secret".ToSha256();
                    var tokenResponse = client.RequestClientCredentialsTokenAsync(
                        new ClientCredentialsTokenRequest
                        {
                            Address = discoveryDocument.TokenEndpoint,
                            ClientId = options.ReferenceApiClientId,
                            ClientSecret = options.ReferenceApiClientSecret,
                            Scope = options.ReferenceApiScope
                        }).ConfigureAwait(false).GetAwaiter().GetResult();

                    if (tokenResponse.IsError)
                    {
                        Console.WriteLine(tokenResponse.Error);
                        throw new Exception(tokenResponse.Error);
                    }

                    _apiClientExpiresAt = DateTime.UtcNow + TimeSpan.FromSeconds(tokenResponse.ExpiresIn);

                    Console.WriteLine(tokenResponse.Json);
                    Console.WriteLine("\n\n");

                    _apiClient = new HttpClient();
                    _apiClient.SetBearerToken(tokenResponse.AccessToken);
                }

                return _apiClient;
            }
        }

        public ReferenceService(ReferenceServiceOptions options)
        {
            this.options = options;
        }
        public async Task<Reference> Store(Reference value)
        {
            var api = GetApiClient();
            var reference = await api.ReferencesPOSTAsync(value);
            return reference;
        }

        private Client GetApiClient()
        {
            return new Client(options.ReferenceApiEndPoint, GetClient);
        }

        public async Task<Reference> Get(Guid referenceReferenceId)
        {
            var api = GetApiClient();
            var reference = await api.ReferencesGETAsync(referenceReferenceId);
            return reference;
        }

        public async Task<bool> SignalUsage(Guid[] usedReferences, string userId)
        {
            var api = GetApiClient();
            var refUsage = usedReferences.Select(x => new ReferenceUsage()
                {ApplicationId = AppId, ReferenceId = x, UserId = new Guid(userId)}).ToArray();
            var ok = await api.BulkAsync(refUsage);
            return ok;
        }

        public async Task<bool> Delete(Guid id)
        {
            var api = GetApiClient();
            await api.ReferencesDELETEAsync(id);
            return true;
        }

        public async Task<Reference> Update(Reference reference)
        {
            var api = GetApiClient();
            await api.ReferencesPUTAsync(reference.Id, reference);
            var refer = await api.ReferencesGETAsync(reference.Id);
            return refer;
        }
    }
}
