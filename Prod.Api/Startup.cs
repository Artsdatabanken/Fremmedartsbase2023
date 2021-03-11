using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using IdentityModel.Client;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Prod.Api.Controllers;
using Prod.Data.EFCore;


namespace Prod.Api
{
    using Microsoft.AspNetCore.Http.Connections;
    using Microsoft.Extensions.Configuration;

    using Prod.Api.Services;

    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            // The following line enables Application Insights telemetry collection.
            services.AddApplicationInsightsTelemetry();// "023396f1-285d-45cc-920c-eb957cdd6c01");
            StartupAddDependencies(services);
            services.AddControllers().AddNewtonsoftJson();
            services.AddMvc();

            
            services.AddCors();

            services.AddSignalR(hubOptions =>
            {
                hubOptions.EnableDetailedErrors = true;
                hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(1);
            });
            services.AddResponseCompression();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseResponseCompression();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors(builder =>
                //builder.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod()
                builder.WithOrigins(new []{"https://rl2021.test.artsdatabanken.no", "https://rl2021.artsdatabanken.no", "http://localhost:1234"}).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
            );
            app.UseStaticFiles();

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("These are not the droids you're looking for! Ver: 2020.02.22");
                });
                endpoints.MapHub<Hubs.MessageHub>("/messageHub", options =>
                {
                    //options.Transports =
                    //    //HttpTransportType.WebSockets;
                    //    HttpTransportType.LongPolling;
                });
            });
        }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        private void StartupAddDependencies(IServiceCollection services)
        {
            services.AddDbContext<ProdDbContext>(opt => opt.UseSqlServer(Configuration.GetValue<string>("Redlist2019Database")));
            var options = new ReferenceServiceOptions()
            {
                AuthAuthority = Configuration.GetValue("AuthAuthority", "https://demo.identityserver.io"),
                ReferenceApiEndPoint = Configuration.GetValue(
                                      "ReferenceApiEndPoint",
                                      "https://referenceApiUrl.no/"),
                ReferenceApiClientSecret = Configuration.GetValue("ReferenceApiClientSecret", "test-secret"),
                ReferenceApiScope = Configuration.GetValue("ReferenceApiScope", "api"),
                ReferenceApiClientId = Configuration.GetValue("ReferenceApiClientId", "redlistapi")
            };
            services.AddSingleton<IReferenceService>(new ReferenceService(options));

            services.AddSingleton<IDiscoveryCache>(r =>
            {
                var factory = r.GetRequiredService<IHttpClientFactory>();
                return new DiscoveryCache(options.AuthAuthority, () => factory.CreateClient());
            });

            services.AddAuthentication(IdentityServerAuthenticationDefaults.AuthenticationScheme)
                .AddIdentityServerAuthentication(identityServerAuthenticationOptions =>
                {
                    // base-address of your identityserver
                    identityServerAuthenticationOptions.Authority = options.AuthAuthority;

                    // name of the API resource
                    identityServerAuthenticationOptions.ApiName = "redlist2019api";
                    identityServerAuthenticationOptions.RequireHttpsMetadata = false;

                    identityServerAuthenticationOptions.JwtBearerEvents = new JwtBearerEvents
                    {
                        OnMessageReceived = e =>
                        {
                            // _logger.LogTrace("JWT: message received");
                            return Task.CompletedTask;
                        },
                        OnTokenValidated = e =>
                        {
                            // _logger.LogTrace("JWT: token validated");
                            return Task.CompletedTask;
                        },
                        OnAuthenticationFailed = e =>
                        {
                            // _logger.LogTrace("JWT: authentication failed");
                            return Task.CompletedTask;
                        },
                        OnChallenge = e =>
                        {
                            // _logger.LogTrace("JWT: challenge");
                            return Task.CompletedTask;
                        }
                    };
                });
        }
    }
}
