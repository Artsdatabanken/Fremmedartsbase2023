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
    public class Maintenance
    {
        private SqlServerProdDbContext _database;

        public Maintenance(string connectionString)
        {
            _database = new Prod.Data.EFCore.SqlServerProdDbContext(connectionString);
        }

        public void Import(IConsole console, string inputFolder)
        {
            _database.Database.EnsureDeleted();
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
                    UserName = bruker.Brukernavn,
                    DateGivenAccess = dummyDate,
                    DateCreated = dummyDate,
                    DateLastActive = dummyDate,
                    Email = "",
                    HasAccess = false,
                    FullName = bruker.Brukernavn,
                    AccessDenied = true
                });
            }

            _database.SaveChanges();
            var users = _database.Users.ToDictionary(x => x.UserName, x => x);

            // mapping
            var mapper = CreateMappingFromOldToNew();
            var batchsize = 50;
            var count = 0;
            IEnumerable<Prod.Domain.Legacy.FA3Legacy> assessments = GetAssessments(inputFolder);
            foreach (var assessment in assessments)
            {
                var entity = InitialTransformFrom2018to2023(assessment, jsonSerializerOptions, mapper);
                if (string.IsNullOrWhiteSpace(assessment.SistOppdatertAv))
                {
                    entity.LastUpdatedByUserId = new Guid("00000000-0000-0000-0000-000000000001");
                    entity.LastUpdatedAt = DateTime.Today;
                }
                else
                {
                    entity.LastUpdatedByUserId = users[assessment.SistOppdatertAv].Id;
                    entity.LastUpdatedAt = assessment.SistOppdatert;
                }
                
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

        public static Mapper CreateMappingFromOldToNew()
        { 
            var mapperConfig = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<FA3Legacy.NaturalOrigin, FA4.NaturalOrigin>();
                cfg.CreateMap<FA3Legacy.RedlistedNatureType, FA4.RedlistedNatureType>()
                    .ForMember(dest => dest.Background, opt => opt.Ignore());
                cfg.CreateMap<FA3Legacy.Reference, FA4.SimpleReference>();
                cfg.CreateMap<FA3Legacy.RegionalRiskAssessment, FA4.RegionalRiskAssessment>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.Criterion, Prod.Domain.RiskAssessment.Criterion>();
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.HostParasiteInteraction,
                    Prod.Domain.RiskAssessment.HostParasiteInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.Interaction, Prod.Domain.RiskAssessment.Interaction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.NaturetypeInteraction,
                    Prod.Domain.RiskAssessment.NaturetypeInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesInteraction,
                    Prod.Domain.RiskAssessment.SpeciesInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesNaturetypeInteraction,
                    Prod.Domain.RiskAssessment.SpeciesNaturetypeInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());
                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment.SpeciesSpeciesInteraction,
                    Prod.Domain.RiskAssessment.SpeciesSpeciesInteraction>()
                    .ForMember(dest => dest.Scale, opt => opt.Ignore())
                    .ForMember(dest => dest.InteractionTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.BasisOfAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.KeyStoneOrEndangeredSpecie, opt => opt.Ignore());

                cfg.CreateMap<Prod.Domain.Legacy.RiskAssessment, Prod.Domain.RiskAssessment>()

                    .ForMember(dest => dest.Naturetype2018, opt => opt.Ignore())
                    .ForMember(dest => dest.NaturetypeNIN2, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundC, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundF, opt => opt.Ignore())
                    .ForMember(dest => dest.BackgroundG, opt => opt.Ignore())
                    .ForMember(dest => dest.AcceptOrAdjustCritA, opt => opt.Ignore())
                    .ForMember(dest => dest.Hovedøkosystem, opt => opt.Ignore())

                    .ForMember(dest => dest.StartYear, opt => opt.Ignore())
                    .ForMember(dest => dest.EndYear, opt => opt.Ignore())
                    // todo: delete this section when domain is fixed
                    //.ForMember(dest => dest.ScoreA, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureA, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreB, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureB, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreC, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureC, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreD, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureD, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreE, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureE, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreF, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureF, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreG, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureG, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreH, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureH, opt => opt.Ignore())
                    //.ForMember(dest => dest.ScoreI, opt => opt.Ignore())
                    //.ForMember(dest => dest.UnsureI, opt => opt.Ignore())
                    // --------------------------------
                    .ForMember(dest => dest.PossibleLowerCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.natureAffectedAbroadF, opt => opt.Ignore())
                    .ForMember(dest => dest.natureAffectedAbroadG, opt => opt.Ignore())

                    .ForMember(dest => dest.PopulationSize, opt => opt.MapFrom(src => ParceLongFromNullableInt(src.SpreadRscriptSpeciesCount)))
                    .ForMember(dest => dest.GrowthRate, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptPopulationGrowth, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.EnvVariance, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptEnvironmantVariance, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.DemVariance, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptDemographicVariance, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.CarryingCapacity, opt => opt.MapFrom(src => ParceLong(src.SpreadRscriptSustainabilityK)))
                    .ForMember(dest => dest.ExtinctionThreshold, opt => opt.MapFrom(src => ParceLong(src.SpreadRscriptQuasiExtinctionThreshold)))
                    .ForMember(dest => dest.MedianLifetime, opt => opt.MapFrom(src => ParceLong(src.SpreadRscriptEstimatedSpeciesLongevity))) //ActiveSpreadRscriptEstimatedSpeciesLongevity?? ChosenSpreadMedanLifespan??
                    .ForMember(dest => dest.LifetimeLowerQ, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeUpperQ, opt => opt.Ignore())
                    .ForMember(dest => dest.Occurrences1Best, opt => opt.MapFrom(src => ParceLong(src.SpreadYearlyIncreaseObservations)))
                    .ForMember(dest => dest.Occurrences1Low, opt => opt.MapFrom(src => ParceLong(src.SpreadYearlyIncreaseObservationsLowerQuartile)))
                    .ForMember(dest => dest.Occurrences1High, opt => opt.MapFrom(src => ParceLong(src.SpreadYearlyIncreaseObservationsUpperQuartile)))
                    .ForMember(dest => dest.IntroductionsBest, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionSpeed, opt => opt.MapFrom(src => ParceLong(src.SpreadYearlyIncreaseOccurrenceArea))) // ActiveSpreadYearlyIncreaseOccurrenceArea?? SpreadYearlyIncreaseCalculatedExpansionSpeed?? SpreadYearlyIncreaseObservations??
                    .ForMember(dest => dest.ExpansionLowerQ, opt => opt.MapFrom(src => ParceLong(src.SpreadYearlyIncreaseOccurrenceAreaLowerQuartile)))
                    .ForMember(dest => dest.ExpansionUpperQ, opt => opt.MapFrom(src => ParceLong(src.SpreadYearlyIncreaseOccurrenceAreaUpperQuartile)))

                    // følgende blir mappet fra FA3Legacy lenger nede
                    .ForMember(dest => dest.AOOknown, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOtotalHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO50yrHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOyear1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOendyear1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOyear2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOendyear2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOdarkfigureHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO10yrHigh, opt => opt.Ignore())

                    .ForMember(dest => dest.Amethod, opt => opt.Ignore())
                    .ForMember(dest => dest.Ascore, opt => opt.Ignore())
                    .ForMember(dest => dest.Alow, opt => opt.Ignore())
                    .ForMember(dest => dest.Ahigh, opt => opt.Ignore())
                    .ForMember(dest => dest.Bmethod, opt => opt.Ignore())
                    .ForMember(dest => dest.Bscore, opt => opt.Ignore())
                    .ForMember(dest => dest.Blow, opt => opt.Ignore())
                    .ForMember(dest => dest.Bhigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AAO1, opt => opt.Ignore())
                    .ForMember(dest => dest.AAO2, opt => opt.Ignore())



                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh, opt => opt.Ignore())
                    ;
                //.ForMember(dest => dest., opt => opt.MapFrom(src => src.))



                cfg.CreateMap<Prod.Domain.Legacy.MigrationPathway, Prod.Domain.MigrationPathway>();
                cfg.CreateMap<Prod.Domain.Legacy.MigrationPathwayCode, Prod.Domain.MigrationPathwayCode>();
                cfg.CreateMap<Prod.Domain.Legacy.SpreadHistory, Prod.Domain.SpreadHistory>();
                //cfg.CreateMap<Prod.Domain.Legacy.Kode, Prod.Domain.Kode>();
                //cfg.CreateMap<Prod.Domain.Legacy.KodeGrupper, Prod.Domain.KodeGrupper>();
                cfg.CreateMap<Prod.Domain.Legacy.RedlistedNatureTypeCode, Prod.Domain.RedlistedNatureTypeCode>();
                cfg.CreateMap<Prod.Domain.Legacy.RedlistedNatureTypeCodeGroup, Prod.Domain.RedlistedNatureTypeCodeGroup>();
                
                cfg.CreateMap<Prod.Domain.Legacy.RegionalPresence, Prod.Domain.RegionalPresence>();
                cfg.CreateMap<Prod.Domain.Legacy.RegionalPresenceWithPotential, Prod.Domain.RegionalPresenceWithPotential>();
                cfg.CreateMap<FA3Legacy.ImpactedNatureType, FA4.ImpactedNatureType>()
                    .ForMember(dest => dest.Background, opt => opt.Ignore());
                cfg.CreateMap<FA3Legacy.TimeAndPlace, FA4.TimeAndPlace>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablished, FA4.ObservedAndEstablished>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablishedInCountry, FA4.ObservedAndEstablishedInCountry>();
                cfg.CreateMap<FA3Legacy, FA4>()

                    .ForMember(dest => dest.IsAlienSpecies, opt => opt.Ignore())
                    .ForMember(dest => dest.IsRegionallyAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.ConnectedToAnother, opt => opt.Ignore())
                    .ForMember(dest => dest.SpeciesStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.ProductionSpecies, opt => opt.Ignore())
                    .ForMember(dest => dest.ConnectedTaxon1, opt => opt.Ignore())
                    .ForMember(dest => dest.ConnectedTaxon2, opt => opt.Ignore())
                    .ForMember(dest => dest.ChangedFromAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.ChangedAssessment, opt => opt.Ignore())
                    .ForMember(dest => dest.ReasonForChangeOfCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.IndoorProduktion, opt => opt.Ignore())
                    .ForMember(dest => dest.LastUpdatedBy, opt => opt.MapFrom(src => src.SistOppdatertAv))
                    .ForMember(dest => dest.LastUpdatedAt, opt => opt.MapFrom(src => src.SistOppdatert))
                    .ForMember(dest => dest.LockedForEditAt,
                        opt => opt.MapFrom(src => src.SistOppdatert)) // må ha dato - bruker en kjent en
                    .ForMember(dest => dest.LockedForEditBy, opt => opt.Ignore())
                    .ForMember(dest => dest.LockedForEditByUserId, opt => opt.Ignore())
                    .ForMember(dest => dest.EvaluationStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.TaxonHierarcy, opt => opt.Ignore())
                    .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                    .ForMember(dest => dest.VurderingId2018, opt => opt.MapFrom(src => src.Id))
                    .ForMember(dest => dest.HorizonDoScanning, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEcologicalEffect, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEcologicalEffectDescription, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEstablismentPotential, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEstablismentPotentialDescription, opt => opt.Ignore())
                    .ForMember(dest => dest.Id, opt => opt.Ignore()) // primærnøkkel

                    .AfterMap((src, dest) =>
                    {
                        // set some standard values
                        dest.EvaluationStatus = "imported";
                        dest.TaxonHierarcy = "";
                        dest.IsDeleted = false;
                    });

                cfg.CreateMap<FA3Legacy, Prod.Domain.RiskAssessment>()
                    .ForMember(dest => dest.AOOknown, opt => opt.MapFrom(src => src.CurrentExistenceArea))
                    .ForMember(dest => dest.AOOtotalBest, opt => opt.MapFrom(src => src.CurrentExistenceAreaCalculated))
                    .ForMember(dest => dest.AOOtotalLow, opt => opt.MapFrom(src => src.CurrentExistenceAreaLowCalculated))
                    .ForMember(dest => dest.AOOtotalHigh, opt => opt.MapFrom(src => src.CurrentExistenceAreaHighCalculated))
                    .ForMember(dest => dest.AOO50yrBest, opt => opt.MapFrom(src => src.PotentialExistenceArea))
                    .ForMember(dest => dest.AOO50yrLow, opt => opt.MapFrom(src => src.PotentialExistenceAreaLowQuartile))
                    .ForMember(dest => dest.AOO50yrHigh, opt => opt.MapFrom(src => src.PotentialExistenceAreaHighQuartile))
                    .ForMember(dest => dest.AOOyear1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOendyear1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOyear2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOendyear2, opt => opt.Ignore())
                    .ForMember(dest => dest.AAO1, opt => opt.Ignore())
                    .ForMember(dest => dest.AAO2, opt => opt.Ignore())
                    .ForMember(dest => dest.StartYear, opt => opt.Ignore())
                    .ForMember(dest => dest.EndYear, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes, opt => opt.MapFrom(src => src.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes))
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh, opt => opt.Ignore())
                    .ForAllOtherMembers(opt => opt.Ignore());


            });
            mapperConfig.AssertConfigurationIsValid();
            var mapper = new Mapper(mapperConfig);
            return mapper;
        }

        private static long ParceLong(string spreadYearlyIncreaseObservations)
        {
            if (string.IsNullOrWhiteSpace(spreadYearlyIncreaseObservations))
            {
                return 0;
            }
            // todo : her kommer det og verdier som '> 100 år' inn
            if (long.TryParse(spreadYearlyIncreaseObservations, out long test))
            {
                return test;
            }
            return 0;
        }
        private static long ParceLongFromNullableInt(int? spreadYearlyIncreaseObservations)
        {
            if (!spreadYearlyIncreaseObservations.HasValue)
            {
                return 0;
            }
            
            return (long)spreadYearlyIncreaseObservations.Value;
        }

        private static Assessment InitialTransformFrom2018to2023(FA3Legacy assessment,
            JsonSerializerOptions jsonSerializerOptions, Mapper mapper)
        {
            var newassesment = new Assessment { Doc = JsonSerializer.Serialize(mapper.Map<FA4>(assessment), jsonSerializerOptions) };
            return newassesment;
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
