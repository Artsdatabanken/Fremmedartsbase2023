using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KellermanSoftware.CompareNetObjects;
using McMaster.Extensions.CommandLineUtils;
using Microsoft.EntityFrameworkCore;
using Prod.Data.EFCore;
using Prod.Domain;
using Prod.Domain.Legacy;

namespace SwissKnife.Database
{
    public class ImportDataService
    {
        private SqlServerProdDbContext _database;
        private static Dictionary<string, string> expertGroupReplacements = new Dictionary<string, string>()
        {
            { "ExpertGroups/Fisker/S", "Fisker (Svalbard)" },
            { "ExpertGroups/Marineinvertebrater/S", "Marine invertebrater (Svalbard)" },
            { "ExpertGroups/Fugler/S", "Fugler (Svalbard)" },
            { "ExpertGroups/Testedyr/N", "Testedyr" },
            { "ExpertGroups/Karplanter/S", "Karplanter (Svalbard)" },
            { "ExpertGroups/Pattedyr/S", "Pattedyr (Svalbard)" },
            { "ExpertGroups/Fugler/N", "Fugler" },
            { "ExpertGroups/Pattedyr/N", "Pattedyr" },
            { "ExpertGroups/Rundormerogflatormer/N", "Rundormer og flatormer" },
            { "ExpertGroups/Ikkemarineinvertebrater/N", "Ikke-marine invertebrater" },
            { "ExpertGroups/Moser/N", "Moser" },
            { "ExpertGroups/Marineinvertebrater/N", "Marine invertebrater" },
            { "ExpertGroups/Sopper/N", "Sopper" },
            { "ExpertGroups/Alger/N", "Alger" },
            { "ExpertGroups/Karplanter/N", "Karplanter" },
            { "ExpertGroups/Fisker/N", "Fisker" },
            { "ExpertGroups/Amfibierogreptiler/N", "Amfibier og reptiler" }
        };

    public ImportDataService(string connectionString)
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
            foreach (var oldAssessment in assessments)
            {
                var newAssesment = InitialTransformFrom2018to2023(oldAssessment, jsonSerializerOptions, mapper);
                var dbAssessment = new Assessment { Doc = JsonSerializer.Serialize(newAssesment, jsonSerializerOptions) };
                if (string.IsNullOrWhiteSpace(oldAssessment.SistOppdatertAv))
                {
                    dbAssessment.LastUpdatedByUserId = new Guid("00000000-0000-0000-0000-000000000001");
                    dbAssessment.LastUpdatedAt = DateTime.Today;
                }
                else
                {
                    dbAssessment.LastUpdatedByUserId = users[oldAssessment.SistOppdatertAv].Id;
                    dbAssessment.LastUpdatedAt = oldAssessment.SistOppdatert;
                }
                
                _database.Assessments.Add(dbAssessment);
                count++;

                string assessmentCommentString(string fieldName, string subFieldName, string oldValue, string newValue) 
                {
                    string baseString = $"Verdi fra 2018 ('{oldValue}') på '{fieldName}' ved estimeringsmetode '{subFieldName}' er satt til: {newValue}.";
                    string notTrillions(string newValue) => oldValue != "mer enn én billion år" ? " Vennligst endre til estimert verdi." : "";
                    return baseString + notTrillions(newValue);
                }

                Boolean valueHasChanged(string oldValue, double? newValue)
                {
                    if (double.TryParse(oldValue, out double test))
                    {
                        return false;
                    }
                    return oldValue != newValue.ToString();

                }

            dbAssessment.Comments = new List<AssessmentComment>();

                if (oldAssessment.RiskAssessment.SpreadRscriptEstimatedSpeciesLongevity != null &&
                    newAssesment.RiskAssessment.MedianLifetimeInput != null &&
                    valueHasChanged(oldAssessment.RiskAssessment.SpreadRscriptEstimatedSpeciesLongevity, newAssesment.RiskAssessment.MedianLifetimeInput))
                {
                    dbAssessment.Comments.Add(new AssessmentComment()
                    {
                        Comment = assessmentCommentString("Median levetid", "Numerisk estimering på A-kriteriet", oldAssessment.RiskAssessment.SpreadRscriptEstimatedSpeciesLongevity, newAssesment.RiskAssessment.MedianLifetimeInput.ToString()),
                        CommentDate = DateTime.Now,
                        UserId = new Guid("00000000-0000-0000-0000-000000000001"),
                        ClosedById = new Guid("00000000-0000-0000-0000-000000000001"),
                        Type = CommentType.System
                    });
                }
                if (oldAssessment.RiskAssessment.SpreadYearlyIncreaseObservations != null &&
                    newAssesment.RiskAssessment.Occurrences1Best != null &&
                    valueHasChanged(oldAssessment.RiskAssessment.SpreadYearlyIncreaseObservations, newAssesment.RiskAssessment.Occurrences1Best))
                {
                    dbAssessment.Comments.Add(new AssessmentComment()
                    {
                        Comment = assessmentCommentString("Gjennomsnittlig ekspansjonshastighet (m/år)", "Datasett med tid- og stedfesta observasjoner på B-kriteriet", oldAssessment.RiskAssessment.SpreadYearlyIncreaseObservations, newAssesment.RiskAssessment.Occurrences1Best.ToString()),
                        CommentDate = DateTime.Now,
                        UserId = new Guid("00000000-0000-0000-0000-000000000001"),
                        ClosedById = new Guid("00000000-0000-0000-0000-000000000001"),
                        Type = CommentType.System
                    });
                }

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
                    .ForMember(dest => dest.ReasonForAdjustmentCritA, opt => opt.Ignore())
                    .ForMember(dest => dest.Hovedøkosystem, opt => opt.Ignore())

                    .ForMember(dest => dest.FilesDescription, opt => opt.Ignore())

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

                    .ForMember(dest => dest.PopulationSize, opt => opt.MapFrom(src => ParseLongFromNullableInt(src.SpreadRscriptSpeciesCount)))
                    .ForMember(dest => dest.GrowthRate, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptPopulationGrowth, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.EnvVariance, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptEnvironmantVariance, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.DemVariance, opt => opt.MapFrom(src => double.Parse(src.SpreadRscriptDemographicVariance, System.Globalization.CultureInfo.InvariantCulture)))
                    .ForMember(dest => dest.CarryingCapacity, opt => opt.MapFrom(src => ParseLong(src.SpreadRscriptSustainabilityK)))
                    .ForMember(dest => dest.ExtinctionThreshold, opt => opt.MapFrom(src => ParseLong(src.SpreadRscriptQuasiExtinctionThreshold)))
                    .ForMember(dest => dest.MedianLifetimeInput, opt => opt.MapFrom(src => ParseDouble(src.SpreadRscriptEstimatedSpeciesLongevity))) //ActiveSpreadRscriptEstimatedSpeciesLongevity?? ChosenSpreadMedanLifespan??
                    .ForMember(dest => dest.MedianLifetime, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeLowerQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeLowerQ, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeUpperQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.LifetimeUpperQ, opt => opt.Ignore())
                    .ForMember(dest => dest.Occurrences1Best, opt => opt.MapFrom(src => ParseDouble(src.SpreadYearlyIncreaseObservations)))
                    .ForMember(dest => dest.Occurrences1Low, opt => opt.MapFrom(src => ParseDouble(src.SpreadYearlyIncreaseObservationsLowerQuartile)))
                    .ForMember(dest => dest.Occurrences1High, opt => opt.MapFrom(src => ParseDouble(src.SpreadYearlyIncreaseObservationsUpperQuartile)))
                    .ForMember(dest => dest.IntroductionsBest, opt => opt.Ignore())
                    .ForMember(dest => dest.IntroductionsLow, opt => opt.Ignore())
                    .ForMember(dest => dest.IntroductionsHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionSpeedInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionSpeed, opt => opt.MapFrom(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceArea))) // ActiveSpreadYearlyIncreaseOccurrenceArea?? SpreadYearlyIncreaseCalculatedExpansionSpeed?? SpreadYearlyIncreaseObservations??
                    .ForMember(dest => dest.ExpansionLowerQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionLowerQ, opt => opt.MapFrom(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceAreaLowerQuartile)))
                    .ForMember(dest => dest.ExpansionUpperQInput, opt => opt.Ignore())
                    .ForMember(dest => dest.ExpansionUpperQ, opt => opt.MapFrom(src => ParseDouble(src.SpreadYearlyIncreaseOccurrenceAreaUpperQuartile)))

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
                    .ForMember(dest => dest.AOO1, opt => opt.Ignore())
                    .ForMember(dest => dest.AOO2, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AOOchangeHigh, opt => opt.Ignore())

                    .ForMember(dest => dest.Amethod, opt => opt.Ignore())
                    .ForMember(dest => dest.Ascore, opt => opt.Ignore())
                    .ForMember(dest => dest.Alow, opt => opt.Ignore())
                    .ForMember(dest => dest.Ahigh, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultBest, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultLow, opt => opt.Ignore())
                    .ForMember(dest => dest.AdefaultHigh, opt => opt.Ignore())
                    .ForMember(dest => dest.ApossibleLow, opt => opt.Ignore())
                    .ForMember(dest => dest.ApossibleHigh, opt => opt.Ignore())


                    .ForMember(dest => dest.Bmethod, opt => opt.Ignore())
                    .ForMember(dest => dest.Bscore, opt => opt.Ignore())
                    .ForMember(dest => dest.Blow, opt => opt.Ignore())
                    .ForMember(dest => dest.Bhigh, opt => opt.Ignore())

                    .ForMember(dest => dest.BCritMCount, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritExact, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritP, opt => opt.Ignore())
                    .ForMember(dest => dest.BCritNewObs, opt => opt.Ignore())

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
                    .ForMember(dest => dest.Background, opt => opt.Ignore())
                    .ForMember(dest => dest.NatureTypeArea, opt => opt.Ignore());
                cfg.CreateMap<FA3Legacy.TimeAndPlace, FA4.TimeAndPlace>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablished, FA4.ObservedAndEstablished>();
                cfg.CreateMap<FA3Legacy.ObservedAndEstablishedInCountry, FA4.ObservedAndEstablishedInCountry>();
                cfg.CreateMap<FA3Legacy, FA4>()
                    .ForMember(dest => dest.IsAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.IsAlienSpecies, opt => opt.Ignore())
                    .ForMember(dest => dest.IsRegionallyAlien, opt => opt.Ignore())
                    .ForMember(dest => dest.Connected, opt => opt.Ignore())
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
                    //.ForMember(dest => dest.VurderingId2018, opt => opt.MapFrom(src => src.Id))
                    .ForMember(dest => dest.HorizonDoScanning, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonScanningStatus, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEcologicalEffect, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEcologicalEffectDescription, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEstablismentPotential, opt => opt.Ignore())
                    .ForMember(dest => dest.HorizonEstablismentPotentialDescription, opt => opt.Ignore())
                    .ForMember(dest => dest.SpreadAreaInChangedNature, opt => opt.Ignore())
                    .ForMember(dest => dest.SpeciesEstablishmentCategory, opt => opt.Ignore())
                    .ForMember(dest => dest.Id, opt => opt.Ignore()) // primærnøkkel
                    .ForMember(dest =>dest.PreviousAssessments, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.Fylkesforekomster, opt => opt.Ignore())
                    .ForMember(dest => dest.TaxonomicHistory, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ImportInfo, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.EvaluatedScientificNameRank, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartAdded, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartRemoved, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.ArtskartSelectionGeometry, opt => opt.Ignore()) // ny av året
                    .ForMember(dest => dest.Habitats, opt => opt.Ignore())  // ny av året
                    .AfterMap((src, dest) =>
                    {
                        // set some standard values
                        dest.EvaluationStatus = "imported";
                        dest.HorizonScanningStatus = "notStarted";
                        dest.TaxonHierarcy = "";
                        dest.IsDeleted = false;
                        if (string.IsNullOrWhiteSpace(dest.ExpertGroup) && !string.IsNullOrWhiteSpace(src.ExpertGroupId) && expertGroupReplacements.ContainsKey(src.ExpertGroupId))
                        {
                            dest.ExpertGroup = expertGroupReplacements[src.ExpertGroupId];
                        }

                        dest.PreviousAssessments.Add(new FA4.PreviousAssessment()
                        {
                            AssessmentId = src.Id,
                            RevisionYear = 2018,
                            RiskLevel = src.RiskAssessment.RiskLevel,
                            EcologicalRiskLevel = src.RiskAssessment.EcoEffectLevel,
                            SpreadRiskLevel = src.RiskAssessment.InvationPotentialLevel,
                            MainCategory = src.AlienSpeciesCategory,
                            MainSubCategory = src.AlienSpeciesCategory == "DoorKnocker" ? src.DoorKnockerCategory :
                                src.AlienSpeciesCategory == "NotApplicable" ? src.NotApplicableCategory:
                                    src.AlienSpeciesCategory == "RegionallyAlien" ? src.RegionallyAlienCategory:
                                ""
                        });
                        dest.PreviousAssessments.Add(new FA4.PreviousAssessment()
                        {
                            AssessmentId = src.VurderingId2012.ToString(),
                            RevisionYear = 2012,
                            RiskLevel = src.RiskLevel2012,
                            EcologicalRiskLevel = src.EcologicalRiskLevel2012,
                            SpreadRiskLevel = src.SpreadRiskLevel2012,
                            MainCategory = src.AlienSpeciesCategory2012,
                            MainSubCategory = ""
                        });

                        ConvertHelper.SetHorizonScanningBasedOn2018Assessments(dest);

                        // hentet fra det under - slik mapping fungerer ikke - da de blir kallt via convention - og det er ingen tilfeller der den har behov for å mappe fra FA3Legacy til Prod.Domain.RiskAssessment - koden blir ikke kallt
                        dest.RiskAssessment.AOOknown = src.CurrentExistenceArea;
                        dest.RiskAssessment.AOOtotalBest = src.CurrentExistenceAreaCalculated;
                        dest.RiskAssessment.AOOtotalLow = src.CurrentExistenceAreaLowCalculated;
                        dest.RiskAssessment.AOOtotalHigh = src.CurrentExistenceAreaHighCalculated;
                        dest.RiskAssessment.AOO50yrBest = src.PotentialExistenceArea;
                        dest.RiskAssessment.AOO50yrLow = src.PotentialExistenceAreaLowQuartile;
                        dest.RiskAssessment.AOO50yrHigh = src.PotentialExistenceAreaHighQuartile;

                        dest.RiskAssessment.AOOdarkfigureBest = ParseFloat(src.CurrentExistenceAreaMultiplier);
                        dest.RiskAssessment.AOOdarkfigureHigh = ParseFloat(src.CurrentExistenceAreaHighMultiplier);
                        dest.RiskAssessment.AOOdarkfigureLow = ParseFloat(src.CurrentExistenceAreaLowMultiplier);

                        dest.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes = src.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;

                        if (!string.IsNullOrWhiteSpace(src.RegionalPresenceKnown))
                        {
                            var elements = src.RegionalPresenceKnown.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State0 = 1;
                                    match.State1 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        if (!string.IsNullOrWhiteSpace(src.RegionalPresenceAssumed))
                        {
                            var elements = src.RegionalPresenceAssumed.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State1 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        if (!string.IsNullOrWhiteSpace(src.RegionalPresencePotential))
                        {
                            var elements = src.RegionalPresencePotential.Split(",", StringSplitOptions.RemoveEmptyEntries);
                            foreach (var item in elements)
                            {
                                var match = dest.Fylkesforekomster.SingleOrDefault(x => x.Fylke.ToLowerInvariant() == item.ToLowerInvariant());
                                if (match != null)
                                {
                                    match.State3 = 1;
                                }
                                else
                                {
                                    throw new Exception("No match not good");
                                }
                            }
                        }
                        foreach (var item in dest.Fylkesforekomster)
                        {
                            if (item.State0 == 0 && item.State1 == 00 && item.State3 == 0)
                            {
                                item.State2 = 1;
                            }
                            else
                            {
                                item.State2 = 0;
                            }
                        }
                        //                    "RegionalPresenceKnown": "St",
                        //"RegionalPresenceAssumed": "",
                        //"RegionalPresencePotential": "Ro,Ho,Sf,Mr,St",


                        switch (src.AlienSpeciesCategory)
                        {
                            case "AlienSpecie":
                            case "DoorKnocker":
                            case "RegionallyAlien":
                            case "EcoEffectWithoutEstablishment":
                                dest.IsAlienSpecies = true;
                                break;
                            case "NotApplicable":
                                if (src.NotApplicableCategory != "notAlienSpecie")
                                {
                                    dest.IsAlienSpecies = true;
                                }

                                if (src.NotApplicableCategory == "taxonIsEvaluatedInHigherRank")
                                {
                                    dest.ConnectedToAnother = true;
                                }

                                if (src.NotApplicableCategory == "traditionalProductionSpecie")
                                {
                                    dest.ProductionSpecies = true;
                                }

                                if (src.NotApplicableCategory == "establishedBefore1800")
                                {
                                    dest.AlienSpecieUncertainIfEstablishedBefore1800 = true;
                                    dest.IsAlienSpecies = true;
                                    dest.ConnectedToAnother = false;
                                }

                                break;
                        }

                        if (src.AlienSpeciesCategory == "AlienSpecie" || src.AlienSpeciesCategory == "DoorKnocker")
                        {
                            dest.AlienSpecieUncertainIfEstablishedBefore1800 = false;
                        }

                        if (src.AlienSpeciesCategory == "RegionallyAlien")
                        {
                            dest.IsRegionallyAlien = true;
                        }

                        // alt annet ser ut til å bli ignorert

                        // issue 290



                    });

                // - slik mapping fungerer ikke - da de blir kallt via convention - og det er ingen tilfeller der den har behov for å mappe fra FA3Legacy til Prod.Domain.RiskAssessment - koden blir ikke kallt
                //cfg.CreateMap<FA3Legacy, Prod.Domain.RiskAssessment>()
                //    .ForMember(dest => dest.AOOknown, opt => opt.MapFrom(src => src.CurrentExistenceArea))
                //    .ForMember(dest => dest.AOOtotalBest, opt => opt.MapFrom(src => src.CurrentExistenceAreaCalculated))
                //    .ForMember(dest => dest.AOOtotalLow,
                //        opt => opt.MapFrom(src => src.CurrentExistenceAreaLowCalculated))
                //    .ForMember(dest => dest.AOOtotalHigh,
                //        opt => opt.MapFrom(src => src.CurrentExistenceAreaHighCalculated))
                //    .ForMember(dest => dest.AOO50yrBest, opt => opt.MapFrom(src => src.PotentialExistenceArea))
                //    .ForMember(dest => dest.AOO50yrLow,
                //        opt => opt.MapFrom(src => src.PotentialExistenceAreaLowQuartile))
                //    .ForMember(dest => dest.AOO50yrHigh,
                //        opt => opt.MapFrom(src => src.PotentialExistenceAreaHighQuartile))
                //    .ForMember(dest => dest.AOOyear1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOendyear1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOyear2, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOOendyear2, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOO1, opt => opt.Ignore())
                //    .ForMember(dest => dest.AOO2, opt => opt.Ignore())
                //    .ForMember(dest => dest.StartYear, opt => opt.Ignore())
                //    .ForMember(dest => dest.EndYear, opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes,
                //        opt => opt.MapFrom(src => src.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes))
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesBest,
                //        opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesLow,
                //        opt => opt.Ignore())
                //    .ForMember(dest => dest.SpreadHistoryDomesticAreaInStronglyChangedNatureTypesHigh,
                //        opt => opt.Ignore())
                //    .ForAllOtherMembers(opt => opt.Ignore());
                    


            });
            mapperConfig.AssertConfigurationIsValid();
            var mapper = new Mapper(mapperConfig);
            return mapper;
        }

        private static long? ParseLong(string str)
        {
            if (long.TryParse(str, out long test))
            {
                return test;
            } 
            return null;
        }

        

        private static double? ParseDouble(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
            {
                return null;
            }
            var currencyDecimalSeparator = Thread.CurrentThread.CurrentCulture.NumberFormat.CurrencyDecimalSeparator;
            str = str.Replace(",", currencyDecimalSeparator).Replace(".", currencyDecimalSeparator);
            if (double.TryParse(str, out double test))
            {
                return test;
            } 

            switch (str)
            {
                case "> 100 år":
                    return 100;

                case "271 millioner år":
                    return 271000000;

                case "1-2 år":
                    return 1.5;
                    
                case "mer enn 1000 år":
                    return 1000;
                    
                case "40 år":
                    return 40;
                    
                case ">= 650 år":
                    return 650;

                case "60-649":
                    return 354.5;
                    
                case "mer enn én billion år":
                    return 1000000000000000000;

                case ">=650":
                    return 650;
                    
                case "1,5 år":
                    return 1.5;

                case ">1000 år":
                    return 1000;
                    
                case "=> 50 m/år":
                    return 50;

                case ">= 500 m/år":
                    return 500;
                
                default:
                    return null;
            }
        }
        private static float? ParseFloat(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
            {
                return null;
            }
            var currencyDecimalSeparator = Thread.CurrentThread.CurrentCulture.NumberFormat.CurrencyDecimalSeparator;
            str = str.Replace(",", currencyDecimalSeparator).Replace(".", currencyDecimalSeparator);
            if (float.TryParse(str, out float test))
            {
                return test;
            }

            return null;
        }
        private static long ParseLongFromNullableInt(int? spreadYearlyIncreaseObservations)
        {
            if (!spreadYearlyIncreaseObservations.HasValue)
            {
                return 0;
            }
            
            return (long)spreadYearlyIncreaseObservations.Value;
        }

        private static Prod.Domain.FA4 InitialTransformFrom2018to2023(FA3Legacy assessment,
            JsonSerializerOptions jsonSerializerOptions, Mapper mapper)
        {
            FA4 newAssesment = mapper.Map<FA4>(assessment);
            
            return newAssesment;
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

                if (reader.TokenType == JsonTokenType.Null)
                {
                    return false;
                }

                var value = reader.GetString();
                return value != null && (value.ToLowerInvariant() == "true");
            }

            public override void Write(Utf8JsonWriter writer, bool value, JsonSerializerOptions options)
            {
                writer.WriteBooleanValue(value);
            }
        }
        public class BoolNullableJsonConverter : JsonConverter<bool?>
        {
            public override bool? Read(
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

                if (reader.TokenType == JsonTokenType.Null)
                {
                    return null;
                }

                var value = reader.GetString();
                return value != null && (value.ToLowerInvariant() == "true");
            }

            public override void Write(Utf8JsonWriter writer, bool? value, JsonSerializerOptions options)
            {
                if (value.HasValue) writer.WriteBooleanValue(value.Value);
                writer.WriteNullValue();
            }
        }
        public void PatchImport(IConsole console, string inputFolder)
        {
            var jsonSerializerOptions = new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
            jsonSerializerOptions.Converters.Add(new BoolJsonConverter());
            jsonSerializerOptions.Converters.Add(new BoolNullableJsonConverter());

            var comparer = new KellermanSoftware.CompareNetObjects.CompareLogic(new ComparisonConfig()
            {
                IgnoreUnknownObjectTypes = true,
                TreatStringEmptyAndNullTheSame = true
            });

            var existing = _database.Assessments.ToDictionary(x => x.Id, x => JsonSerializer.Deserialize<FA4>(x.Doc, jsonSerializerOptions));

            // mapping
            var mapper = CreateMappingFromOldToNew();
            var batchsize = 50;
            var count = 0;
            IEnumerable<Prod.Domain.Legacy.FA3Legacy> assessments = GetAssessments(inputFolder);
            foreach (var oldAssessment in assessments)
            {
                var newAssesment = InitialTransformFrom2018to2023(oldAssessment, jsonSerializerOptions, mapper);
                var previd = newAssesment.PreviousAssessments
                    .Single(y => y.RevisionYear == 2018).AssessmentId;
                var theMatchingAssessment = existing.SingleOrDefault(x =>
                    x.Value.PreviousAssessments.Any(y => y.RevisionYear == 2018 && y.AssessmentId == previd));

                if (theMatchingAssessment.Value == null)
                {
                    continue;
                }
                var real = _database.Assessments.Single(x => x.Id == theMatchingAssessment.Key);

                // todo: overfør manglende morro
                var exAssessment = JsonSerializer.Deserialize<FA4>(real.Doc, jsonSerializerOptions);
                var orgCopy = JsonSerializer.Deserialize<FA4>(real.Doc, jsonSerializerOptions);

                // FieldsFix
                Debug.Assert(exAssessment != null, nameof(exAssessment) + " != null");
                exAssessment.SpreadHistory = newAssesment.SpreadHistory;

                exAssessment.RegionalPresenceKnown = newAssesment.RegionalPresenceKnown;
                exAssessment.RegionalPresenceAssumed = newAssesment.RegionalPresenceAssumed;
                exAssessment.RegionalPresencePotential = newAssesment.RegionalPresencePotential;
                exAssessment.Fylkesforekomster = newAssesment.Fylkesforekomster;

                //map fix

                exAssessment.RiskAssessment.AOOknown = newAssesment.RiskAssessment.AOOknown;
                exAssessment.RiskAssessment.AOOtotalBest = newAssesment.RiskAssessment.AOOtotalBest;
                exAssessment.RiskAssessment.AOOtotalLow = newAssesment.RiskAssessment.AOOtotalLow;
                exAssessment.RiskAssessment.AOOtotalHigh = newAssesment.RiskAssessment.AOOtotalHigh;
                exAssessment.RiskAssessment.AOO50yrBest = newAssesment.RiskAssessment.AOO50yrBest;
                exAssessment.RiskAssessment.AOO50yrLow = newAssesment.RiskAssessment.AOO50yrLow;
                exAssessment.RiskAssessment.AOO50yrHigh = newAssesment.RiskAssessment.AOO50yrHigh;
                exAssessment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes = newAssesment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;

                exAssessment.RiskAssessment.AOOdarkfigureBest = newAssesment.RiskAssessment.AOOdarkfigureBest;
                exAssessment.RiskAssessment.AOOdarkfigureHigh = newAssesment.RiskAssessment.AOOdarkfigureHigh;
                exAssessment.RiskAssessment.AOOdarkfigureLow = newAssesment.RiskAssessment.AOOdarkfigureLow;


                exAssessment.IsAlienSpecies = newAssesment.IsAlienSpecies;
                exAssessment.ConnectedToAnother = newAssesment.ConnectedToAnother;
                exAssessment.ProductionSpecies = newAssesment.ProductionSpecies;
                exAssessment.AlienSpecieUncertainIfEstablishedBefore1800 = newAssesment.AlienSpecieUncertainIfEstablishedBefore1800;
                exAssessment.IsRegionallyAlien = newAssesment.IsRegionallyAlien;

                var comparisonResult = comparer.Compare(orgCopy, exAssessment);
                if (comparisonResult.AreEqual == false)
                {
                   real.Doc = JsonSerializer.Serialize<FA4>(exAssessment); 
                }
                //else
                //{
                //     real.Doc = JsonSerializer.Serialize<FA4>(exAssessment); 
                //}
                
                //               _database.Assessments.Add(dbAssessment);
                count++;

                if (count > batchsize)
                {
                    _database.SaveChanges();
                    count = 0;
                }
            }

            _database.SaveChanges();
        }
    }
}
