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
            var mapper = Fab3Mapper.CreateMappingFromOldToNew();
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
                    dbAssessment.ScientificNameId = newAssesment.EvaluatedScientificNameId.Value;
                    dbAssessment.ChangedAt = oldAssessment.SistOppdatert;
                }
                else
                {
                    dbAssessment.LastUpdatedByUserId = users[oldAssessment.SistOppdatertAv].Id;
                    dbAssessment.LastUpdatedAt = oldAssessment.SistOppdatert;
                    dbAssessment.ScientificNameId = newAssesment.EvaluatedScientificNameId.Value;
                    dbAssessment.ChangedAt = oldAssessment.SistOppdatert;
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
            jsonSerializerOptions.Converters.Add(new ImportDataService.BoolJsonConverter());
            jsonSerializerOptions.Converters.Add(new ImportDataService.BoolNullableJsonConverter());

            var comparer = new KellermanSoftware.CompareNetObjects.CompareLogic(new ComparisonConfig()
            {
                IgnoreUnknownObjectTypes = true,
                TreatStringEmptyAndNullTheSame = true
            });
            
            var existing = _database.Assessments.ToDictionary(x => x.Id, x => JsonSerializer.Deserialize<FA4>(x.Doc, jsonSerializerOptions));
            
            // mapping
            var mapper = Fab3Mapper.CreateMappingFromOldToNew();
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

                // Disse feltene er de som faktisk patches.....
                Debug.Assert(exAssessment != null, nameof(exAssessment) + " != null");
                exAssessment.SpreadHistory = newAssesment.SpreadHistory;

                exAssessment.RegionalPresenceKnown = newAssesment.RegionalPresenceKnown;
                exAssessment.RegionalPresenceAssumed = newAssesment.RegionalPresenceAssumed;
                exAssessment.RegionalPresencePotential = newAssesment.RegionalPresencePotential;
                exAssessment.Fylkesforekomster = newAssesment.Fylkesforekomster;

                //map fix

                exAssessment.RiskAssessment.AOOknown = newAssesment.RiskAssessment.AOOknown;
                exAssessment.RiskAssessment.AOOknown1 = newAssesment.RiskAssessment.AOOknown1;
                exAssessment.RiskAssessment.AOOknown2 = newAssesment.RiskAssessment.AOOknown2;
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
                exAssessment.ProductionSpecies = exAssessment.ProductionSpecies is true ? true : newAssesment.ProductionSpecies;
                exAssessment.AlienSpecieUncertainIfEstablishedBefore1800 = newAssesment.AlienSpecieUncertainIfEstablishedBefore1800;
                exAssessment.IsRegionallyAlien = newAssesment.IsRegionallyAlien;
                exAssessment.IsAlienSpecies = newAssesment.IsAlienSpecies;
                exAssessment.ConnectedToAnother = newAssesment.ConnectedToAnother;

                exAssessment.RiskAssessment.SpeciesSpeciesInteractions = newAssesment.RiskAssessment.SpeciesSpeciesInteractions;
                exAssessment.RiskAssessment.SpeciesNaturetypeInteractions = newAssesment.RiskAssessment.SpeciesNaturetypeInteractions;
                exAssessment.RiskAssessment.HostParasiteInformations = newAssesment.RiskAssessment.HostParasiteInformations;
                exAssessment.RiskAssessment.GeneticTransferDocumented = newAssesment.RiskAssessment.GeneticTransferDocumented;

                exAssessment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes = newAssesment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;

                exAssessment.RiskAssessment.YearFirstIndoors = newAssesment.RiskAssessment.YearFirstIndoors;
                exAssessment.RiskAssessment.YearFirstIndoorsInsecure = newAssesment.RiskAssessment.YearFirstIndoorsInsecure;
                exAssessment.RiskAssessment.YearFirstReproductionIndoors = newAssesment.RiskAssessment.YearFirstReproductionIndoors;
                exAssessment.RiskAssessment.YearFirstReproductionIndoorsInsecure = newAssesment.RiskAssessment.YearFirstReproductionIndoorsInsecure;
                exAssessment.RiskAssessment.YearFirstProductionOutdoors = newAssesment.RiskAssessment.YearFirstProductionOutdoors;
                exAssessment.RiskAssessment.YearFirstProductionOutdoorsInsecure = newAssesment.RiskAssessment.YearFirstProductionOutdoorsInsecure;
                exAssessment.RiskAssessment.YearFirstReproductionOutdoors = newAssesment.RiskAssessment.YearFirstReproductionOutdoors;
                exAssessment.RiskAssessment.YearFirstReproductionOutdoorsInsecure = newAssesment.RiskAssessment.YearFirstReproductionOutdoorsInsecure;
                exAssessment.RiskAssessment.YearFirstEstablishmentProductionArea = newAssesment.RiskAssessment.YearFirstEstablishmentProductionArea;
                exAssessment.RiskAssessment.YearFirstEstablishmentProductionAreaInsecure = newAssesment.RiskAssessment.YearFirstEstablishmentProductionAreaInsecure;
                exAssessment.RiskAssessment.YearFirstNature = newAssesment.RiskAssessment.YearFirstNature;
                exAssessment.RiskAssessment.YearFirstNatureInsecure = newAssesment.RiskAssessment.YearFirstNatureInsecure;
                exAssessment.RiskAssessment.YearFirstReproductionNature = newAssesment.RiskAssessment.YearFirstReproductionNature;
                exAssessment.RiskAssessment.YearFirstReproductionNatureInsecure = newAssesment.RiskAssessment.YearFirstReproductionNatureInsecure;
                exAssessment.RiskAssessment.YearFirstEstablishedNature = newAssesment.RiskAssessment.YearFirstEstablishedNature;
                exAssessment.RiskAssessment.YearFirstEstablishedNatureInsecure = newAssesment.RiskAssessment.YearFirstEstablishedNatureInsecure;

                //if (exAssessment.ExpertGroup != newAssesment.ExpertGroup)
                //{
                //    if (exAssessment.HorizonDoScanning)
                //    {
                        
                //    }
                //}
                exAssessment.ExpertGroup = newAssesment.ExpertGroup;

                if (exAssessment.ExpertGroup == "Sopper")
                {
                    if (exAssessment.TaxonHierarcy.ToLowerInvariant().StartsWith("chromista"))
                    {

                        exAssessment.ExpertGroup = "Kromister";
                    }
                }

                if (newAssesment.IsDeleted && !exAssessment.IsDeleted)
                {
                    exAssessment.IsDeleted = true;
                }

                exAssessment.AssesmentVectors = newAssesment.AssesmentVectors;
                
                exAssessment.ImpactedNatureTypes = newAssesment.ImpactedNatureTypes;
                exAssessment.ImpactedNatureTypesFrom2018 = newAssesment.ImpactedNatureTypesFrom2018;
                exAssessment.Habitats = newAssesment.Habitats;

                var comparisonResult = comparer.Compare(orgCopy, exAssessment);
                if (real.ScientificNameId != exAssessment.EvaluatedScientificNameId)
                {
                    real.ScientificNameId = exAssessment.EvaluatedScientificNameId.Value;
                }
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
