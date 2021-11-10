using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using IdentityModel.Client;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Logging;
using Microsoft.OpenApi.Models;
using Prod.Api.Controllers;
using Prod.Data.EFCore;
using Microsoft.Extensions.Configuration;


namespace Prod.Api
{
    using Microsoft.AspNetCore.Http.Connections;
    using Microsoft.Extensions.Configuration;

    using Prod.Api.Services;

    using Index = Nbic.Indexer.Index;

    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            // The following line enables Application Insights telemetry collection.
            services.AddApplicationInsightsTelemetry();// "023396f1-285d-45cc-920c-eb957cdd6c01");
            StartupAddDependencies(services);
            services.AddControllers().AddJsonOptions(x =>
            {
                x.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                x.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                //x.JsonSerializerOptions.Converters.Add(new BoolJsonConverter());

            }
                ); //.AddNewtonsoftJson(); For å unngå camelcase - frem til klienten er camelcase.....

            //services.AddMvc();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Prod.Api", Version = "v1" });
            });

            services.AddCors();

            services.AddSignalR(hubOptions =>
            {
                hubOptions.EnableDetailedErrors = true;
                hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(1);
            });
            services.AddResponseCompression();
            services.AddApplicationInsightsTelemetry();
        }
        public class BoolJsonConverter : JsonConverter<bool>
        {
            public override bool Read(
                ref Utf8JsonReader reader,
                Type typeToConvert,
                JsonSerializerOptions options)
            {
                if (reader.TokenType == JsonTokenType.False)
                {
                    return false;
                }

                if (reader.TokenType == JsonTokenType.True)
                {
                    return true;
                }

                var value = reader.GetString();
                return value != null && (value.ToLowerInvariant() == "true");
            }

            public override void Write(Utf8JsonWriter writer, bool value, JsonSerializerOptions options)
            {
                writer.WriteBooleanValue(value);
            }
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
                builder.WithOrigins(new []{ "https://fab4api.test.artsdatabanken.no", "https://fab4api.artsdatabanken.no", "http://localhost:1234", "http://localhost:12345", "http://localhost:63660", "http://localhost:12237" }).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
            );

            app.UseStaticFiles();

            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Prod.Api v1"));

            //app.UseHttpsRedirection();
            // temp serve sandbox app
            var path = Path.Combine(env.ContentRootPath, "Frontend");
            if (Directory.Exists(path))
            {
                app.UseDefaultFiles(new DefaultFilesOptions()
                {
                    DefaultFileNames = new List<string>() {
                        "index.html"},
                    FileProvider = new PhysicalFileProvider(
                        path)
                });
                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new PhysicalFileProvider(
                        path)
                    //RequestPath = "/App"
                });
            }
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


        public IConfiguration Configuration { get; }

        private void StartupAddDependencies(IServiceCollection services)
        {
            var connectionString = Configuration.GetValue<string>("FabDatabase");
            //using (var db = new Prod.Data.EFCore.SqlServerProdDbContext(connectionString))
            //{
            //    db.Database.Migrate();
            //}

            services.AddDbContext<ProdDbContext>(opt => opt.UseSqlServer(connectionString));
            services.AddSingleton(new Index());
            var options = new ReferenceServiceOptions()
            {
                AuthAuthority = Configuration.GetValue("AuthAuthority", "https://demo.identityserver.io"),
                ReferenceApiAuthAuthority = Configuration.GetValue("ReferenceApiAuthAuthority", "https://demo.identityserver.io"),
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
                    identityServerAuthenticationOptions.ApiName = "fab4api";
                    identityServerAuthenticationOptions.RequireHttpsMetadata = false;
                    IdentityModelEventSource.ShowPII = true;
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
