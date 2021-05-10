using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using McMaster.Extensions.CommandLineUtils;
using Microsoft.EntityFrameworkCore;
using Prod.Data.EFCore;
using Prod.Domain;
using Prod.Domain.Legacy;

namespace SwissKnife.Database
{
    class Maintenance
    {
        private SqlServerProdDbContext _database;

        public Maintenance(string connectionString)
        {
            _database = new Prod.Data.EFCore.SqlServerProdDbContext(connectionString);
        }

        public void Import(IConsole console, string inputFolder)
        {
            _database.Database.EnsureCreated();
            // serialization 
            var jsonSerializerOptions = new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            var brukere = GetBrukers(inputFolder);
            var dummyDate = new DateTime(2018,1,1);
            foreach (var bruker in brukere)
            {
                _database.Users.Add(new User()
                {
                    Id = Guid.Parse(bruker.GUID),
                    Brukernavn = bruker.Brukernavn,
                    DatoForTilgang = dummyDate,
                    DatoOpprettet = dummyDate,
                    DatoSistAktiv = dummyDate,
                    Email = "",
                    HarTilgang = false,
                    Navn = bruker.Brukernavn,
                    TilgangAvvist = true
                });
            }

            _database.SaveChanges();
            var users = _database.Users.ToDictionary(x => x.Brukernavn, x => x);

            // mapping
            var mapper = CreateMappingFromOldToNew();
            var batchsize = 50;
            var count = 0;
            IEnumerable<Prod.Domain.Legacy.FA3Legacy> assessments = GetAssessments(inputFolder);
            foreach (var assessment in assessments)
            {
                var entity = InitialTransformFrom2018to2023(assessment, jsonSerializerOptions, mapper);
                _database.Assessments.Add(entity);
                count++;
                if (count > batchsize)
                {
                    _database.SaveChanges();
                    count = 0;
                }
            }

            _database.SaveChanges();

            // add users

            // add files
            count = 0;
            var dummydate = dummyDate;
            var array = _database.Assessments.Include(x=>x.Attachments).ToArray();
            foreach (var assessment in array)
            {
                var doc = JsonSerializer.Deserialize<FA4>(assessment.Doc);
                if (doc != null)
                {
                    doc.Id = assessment.Id;
                    if (doc.Datasett.Files.Any())
                    {
                        foreach (var datasettFile in doc.Datasett.Files)
                        {
                            var readAllBytes =
                                File.ReadAllBytes(inputFolder + "\\Files\\" + datasettFile.Url.Replace("/", "\\"));
                            if (readAllBytes.Length > 0)
                            {
                                assessment.Attachments.Add(new Attachment()
                                {
                                    FileName = datasettFile.Filename,
                                    Date = (string.IsNullOrWhiteSpace(datasettFile.LastModified) || datasettFile.LastModified.StartsWith("0001-01-01") ? dummydate : DateTimeOffset
                                        .FromUnixTimeMilliseconds(long.Parse(datasettFile.LastModified)).DateTime),
                                    Name = datasettFile.Filename,
                                    Description = string.IsNullOrWhiteSpace(datasettFile.Description)
                                        ? ""
                                        : datasettFile.Description,
                                    File = readAllBytes,
                                    UserId = users[doc.LastUpdatedBy].Id,
                                    Type = datasettFile.Filename.ToLowerInvariant().EndsWith("zip") ? "application/zip" : "application/csv"
                                });
                            }

                        }
                    }

                    count++;
                    if (count > batchsize)
                    {
                        _database.SaveChanges();
                        count = 0;
                    }
                }
            }
            _database.SaveChanges();

        }

        private static Mapper CreateMappingFromOldToNew()
        { 
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<FA3Legacy.NaturalOrigin, FA4.NaturalOrigin>();
                cfg.CreateMap<FA3Legacy.RedlistedNatureType, FA4.RedlistedNatureType>();
                cfg.CreateMap<FA3Legacy.Reference, FA4.Reference>();
                cfg.CreateMap<FA3Legacy.RegionalRiskAssessment, FA4.RegionalRiskAssessment>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.Criterion, Prod.Domain.RiskAssessment.Criterion>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.HostParasiteInteraction,
                    Prod.Domain.RiskAssessment.HostParasiteInteraction>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.Interaction, Prod.Domain.RiskAssessment.Interaction>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.NaturetypeInteraction,
                    Prod.Domain.RiskAssessment.NaturetypeInteraction>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesInteraction,
                    Prod.Domain.RiskAssessment.SpeciesInteraction>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesNaturetypeInteraction,
                    Prod.Domain.RiskAssessment.SpeciesNaturetypeInteraction>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesSpeciesInteraction,
                    Prod.Domain.RiskAssessment.SpeciesSpeciesInteraction>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment, Prod.Domain.RiskAssessment>();
                cfg.CreateMap<Prod.Domain.Legacy.MigrationPathway, Prod.Domain.MigrationPathway>();
                cfg.CreateMap<Prod.Domain.Legacy.MigrationPathwayCode, Prod.Domain.MigrationPathwayCode>();
                cfg.CreateMap<Prod.Domain.Legacy.SpreadHistory, Prod.Domain.SpreadHistory>();
                //cfg.CreateMap<Prod.Domain.Legacy.Kode, Prod.Domain.Kode>();
                //cfg.CreateMap<Prod.Domain.Legacy.KodeGrupper, Prod.Domain.KodeGrupper>();
                cfg.CreateMap<Prod.Domain.Legacy.RedlistedNatureTypeCode, Prod.Domain.RedlistedNatureTypeCode>();
                cfg.CreateMap<Prod.Domain.Legacy.RedlistedNatureTypeCodeGroup, Prod.Domain.RedlistedNatureTypeCodeGroup>();
                cfg.CreateMap<Prod.Domain.Legacy.RegionalPresence, Prod.Domain.RegionalPresence>();
                cfg.CreateMap<Prod.Domain.Legacy.RegionalPresenceWithPotential, Prod.Domain.RegionalPresenceWithPotential>();
                cfg.CreateMap<FA3Legacy.ImpactedNatureType, FA4.ImpactedNatureType>();
                cfg.CreateMap<FA3Legacy.TimeAndPlace, FA4.TimeAndPlace>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablished, FA4.ObservedAndEstablished>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablishedInCountry, FA4.ObservedAndEstablishedInCountry>();
                cfg.CreateMap<FA3Legacy, FA4>()
                    .ForMember(dest => dest.LastUpdatedBy, opt => opt.MapFrom(src => src.SistOppdatertAv))
                    .ForMember(dest => dest.LastUpdatedAt, opt => opt.MapFrom(src => src.SistOppdatert))
                    .ForMember(dest => dest.LockedForEditAt,
                        opt => opt.MapFrom(src => src.SistOppdatert)) // må ha dato - bruker en kjent en
                    .ForMember(dest => dest.LockedForEditBy, opt => opt.Ignore())
                    .ForMember(dest => dest.EvaluationStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.TaxonHierarcy, opt => opt.Ignore())
                    .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                    .ForMember(dest => dest.VurderingId2018, opt => opt.MapFrom(src => src.Id))
                    .ForMember(dest => dest.Id, opt => opt.Ignore()) // primærnøkkel
                    .AfterMap((src, dest) =>
                    {
                        // set some standard values
                        dest.EvaluationStatus = "imported";
                        dest.TaxonHierarcy = "";
                        dest.IsDeleted = false;
                    });
            });
            mapperConfig.AssertConfigurationIsValid();
            var mapper = new Mapper(mapperConfig);
            return mapper;
        }

        private static Assessment InitialTransformFrom2018to2023(FA3Legacy assessment,
            JsonSerializerOptions jsonSerializerOptions, Mapper mapper)
        {
            return new Assessment {Doc = JsonSerializer.Serialize(mapper.Map<FA4>(assessment), jsonSerializerOptions)};
        }

        private IEnumerable<FA3Legacy> GetAssessments(string inputFolder)
        {
            var dir = Directory.CreateDirectory(inputFolder);
            var path = dir.FullName;
            using var read = new StreamReader(path + "\\fa3.json");
            var hasLine = true;
            do
            {
                var line = read.ReadLine();
                if (string.IsNullOrWhiteSpace(line))
                {
                    hasLine = false;
                }
                else
                {
                    yield return JsonSerializer.Deserialize<FA3Legacy>(line);
                }

            } while (hasLine);
        }
        private IEnumerable<Bruker> GetBrukers(string inputFolder)
        {
            var dir = Directory.CreateDirectory(inputFolder);
            var path = dir.FullName;
            using var read = new StreamReader(path + "\\brukere.json");
            var hasLine = true;
            do
            {
                var line = read.ReadLine();
                if (string.IsNullOrWhiteSpace(line))
                {
                    hasLine = false;
                }
                else
                {
                    yield return JsonSerializer.Deserialize<Bruker>(line);
                }

            } while (hasLine);
        }
    }
}
