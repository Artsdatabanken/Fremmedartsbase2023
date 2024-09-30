using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
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
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Prod.Api.Helpers;
using Prod.Domain.Helpers;


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
                x.JsonSerializerOptions.Converters.Add(new JsonHelpers.BoolJsonConverter());
                x.JsonSerializerOptions.Converters.Add(new JsonHelpers.BoolNullableJsonConverter());
                x.JsonSerializerOptions.Converters.Add(new JsonHelpers.DoubleJsonConverter());

            }
                ); //.AddNewtonsoftJson(); For å unngå camelcase - frem til klienten er camelcase.....

            //services.AddMvc();
            services.AddSwaggerGen(c =>
            {
                c.CustomSchemaIds(type => type.ToString());
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Prod.Api", Version = "v1" });
                c.IncludeXmlComments(Assembly.GetExecutingAssembly(), true);
            });

            services.AddCors();

            services.AddSignalR(hubOptions =>
            {
                hubOptions.EnableDetailedErrors = true;
                hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(1);
            });
            services.AddResponseCompression();
            services.AddHealthChecks()
                .AddDbContextCheck<ProdDbContext>(); ;
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var culture = new CultureInfo("nb-NO");
            CultureInfo.DefaultThreadCurrentCulture = culture;
            CultureInfo.DefaultThreadCurrentUICulture = culture;

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
                endpoints.MapHealthChecks("/hc", new HealthCheckOptions
                {
                    ResponseWriter = WriteResponse
                });
                endpoints.MapControllers();
                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("These are not the droids you're looking for! Ver:" + Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion);
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
            Index implementationInstance;
            try
            {
                implementationInstance = new Index();
            }
            catch (Exception e)
            {
                implementationInstance = new Index(false, true);
                throw;
            }
            services.AddSingleton(implementationInstance);
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
            //services.AddHttpClient();
            services.AddSingleton<IDiscoveryCache>(r =>
            {
                //var factory = r.GetRequiredService<IHttpClientFactory>();
                return new DiscoveryCache(options.AuthAuthority, () => new HttpClient()); // factory.CreateClient()); // factory fails - should cache it for 24 hours anyway....
            });

            services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(identityServerAuthenticationOptions =>
                {
                    // base-address of your identityserver
                    identityServerAuthenticationOptions.Authority = options.AuthAuthority;

                    // name of the API resource
                    //identityServerAuthenticationOptions.ApiName = "fab4api";
                    identityServerAuthenticationOptions.RequireHttpsMetadata = false;
                    identityServerAuthenticationOptions.TokenValidationParameters.ValidateAudience = false;
                    //identityServerAuthenticationOptions.TokenValidationParameters.ValidAudiences = new List<string>()
                    //{
                    //    "fab4api"
                    //};

                    IdentityModelEventSource.ShowPII = true;
                    identityServerAuthenticationOptions.Events = new JwtBearerEvents
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
        private static Task WriteResponse(HttpContext context, HealthReport healthReport)
        {
            context.Response.ContentType = "application/json; charset=utf-8";

            var options = new JsonWriterOptions { Indented = true };

            using var memoryStream = new MemoryStream();
            using (var jsonWriter = new Utf8JsonWriter(memoryStream, options))
            {
                jsonWriter.WriteStartObject();
                jsonWriter.WriteString("status", healthReport.Status.ToString());
                jsonWriter.WriteStartObject("results");

                foreach (var healthReportEntry in healthReport.Entries)
                {
                    jsonWriter.WriteStartObject(healthReportEntry.Key);
                    jsonWriter.WriteString("status",
                        healthReportEntry.Value.Status.ToString());
                    jsonWriter.WriteString("description",
                        healthReportEntry.Value.Description);
                    jsonWriter.WriteStartObject("data");

                    foreach (var item in healthReportEntry.Value.Data)
                    {
                        jsonWriter.WritePropertyName(item.Key);

                        JsonSerializer.Serialize(jsonWriter, item.Value,
                            item.Value?.GetType() ?? typeof(object));
                    }

                    jsonWriter.WriteEndObject();
                    jsonWriter.WriteEndObject();
                }

                jsonWriter.WriteEndObject();
                jsonWriter.WriteEndObject();
            }

            return context.Response.WriteAsync(
                Encoding.UTF8.GetString(memoryStream.ToArray()));
        }
    }
}
