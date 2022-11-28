using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CsvHelper;
using CsvHelper.Configuration;
using KellermanSoftware.CompareNetObjects;
using McMaster.Extensions.CommandLineUtils;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.EntityFrameworkCore.Sqlite.Storage.Internal;
using Prod.Data.EFCore;
using Prod.Domain;
using Prod.Domain.Legacy;
using SwissKnife.Models;

namespace SwissKnife.Database
{
    public class ImportDataService
    {
        private SqlServerProdDbContext _database;
        private int[] _disse = new[] { 3068}; //2753, 1718, 1684, 2584, 444, 1784, 485, 1717 };
        private bool _dataBoreonemoralClearOceanic;
        private static string[] _importantCategories = new[] { "HI", "LO","NK", "PH","SE" };
        private static DateTime _magicemaildatedateTime = new DateTime(2022, 9, 23, 14, 8, 0);

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

        private static JsonNode? ParseJson(string filen)
        {
            return JsonNode.Parse(File.Exists("../../../.." + filen) ? File.ReadAllText("../../../.." + filen) : File.ReadAllText(".." + filen));
        }
        private static List<Tuple<string, string>> DrillDown(JsonArray array, string child = "Children")
        {
            var result = new List<Tuple<string, string>>();
            foreach (var node in array)
            {
                var value =  node["Value"].GetValue<string>() + "|" + node["Id"].GetValue<string>();
                result.Add(new Tuple<string, string>(value, node["Text"].GetValue<string>()));
                result.AddRange(DrillDown(node[child].AsArray(), child));
            }

            return result;
        }

        private static List<Tuple<string, string>> DrillDown2(JsonArray array, string id = "Id", string text = "Category", string child = "Children", string parentCategory = "")
        {
            var result = new List<Tuple<string, string>>();
            foreach (var node in array)
            {
                var idn = node[id].GetValue<string>();
                var category = node[text].GetValue<string>();
                if (parentCategory == "Hovedtype" && category == "Grunntype")
                {
                    result.Add(new Tuple<string, string>(idn, category));
                }
                if (parentCategory == "Hovedtype" && category == "Kartleggingsenhet")
                {
                    result.Add(new Tuple<string, string>(idn, category));
                }

                result.AddRange(DrillDown2(node[child].AsArray(), id, text, child, category));
            }

            return result;
        }
        private static List<Tuple<string, string, string>> DrillDown3(JsonArray array, string parentCategory = "")
        {
            var result = new List<Tuple<string, string, string>>();
            foreach (var node in array)
            {
                string category = string.Empty;
                if (node["Value"] != null)
                {
                    var code = node["Value"].GetValue<string>();
                    category = node["Text"].GetValue<string>();

                    result.Add(new Tuple<string, string, string>(code, category, parentCategory));
                }

                var jsonNode = node["Children"];
                if (jsonNode == null) continue;
                var jsonObject = jsonNode.AsObject().First();
                var jsonArray = jsonObject.Value.AsArray();
                result.AddRange(DrillDown3(jsonArray, category));
            }

            return result;
        }

        public void PatchImport(IConsole console, string inputFolder)
        {
            void FixZones(Dictionary<int, BioClimData> bioClimDatas, FA4 exAssessment, int realId)
            {
                bool ZonesHasValue(List<FA4.BioClimateZones> bioClimateZones, string sonen)
                {
                    var zone = bioClimateZones.First(x => x.ClimateZone == sonen);
                    return zone.ClearOceanic || zone.StrongOceanic || zone.TransferSection || zone.WeakOceanic ||
                           zone.WeakContinental;
                }

                void SetZones(List<FA4.BioClimateZones> bioClimateZones, string boreonemoral, bool clearOceanic,
                    bool strongOceanic, bool transferSection1,
                    bool weakOceanic1, bool? weakContinental)
                {
                    var zone = bioClimateZones.First(x => x.ClimateZone == boreonemoral);
                    zone.ClearOceanic = clearOceanic;
                    zone.StrongOceanic = strongOceanic;
                    zone.TransferSection = transferSection1;
                    zone.WeakOceanic = weakOceanic1;
                    if (weakContinental.HasValue)
                    {
                        zone.WeakContinental = weakContinental.Value;
                    }
                }

                {
                    if (bioClimDatas.ContainsKey(realId))
                    {
                        // men bare hvis alt er false
                        var data = bioClimDatas[realId];
                        if (!(ZonesHasValue(exAssessment.CurrentBioClimateZones, "boreonemoral")
                              || ZonesHasValue(exAssessment.CurrentBioClimateZones, "southBoreal")
                              || ZonesHasValue(exAssessment.CurrentBioClimateZones, "midBoreal")
                              || ZonesHasValue(exAssessment.CurrentBioClimateZones, "northBoreal")
                              || ZonesHasValue(exAssessment.CurrentBioClimateZones, "alpineZones"))
                           )
                        {
                            exAssessment.Id = realId;
                            SetZones(exAssessment.CurrentBioClimateZones, "boreonemoral", data.boreonemoral_clearOceanic,
                                data.boreonemoral_strongOceanic, data.boreonemoral_transferSection,
                                data.boreonemoral_weakOceanic, null);
                            SetZones(exAssessment.CurrentBioClimateZones, "southBoreal", data.southBoreal_clearOceanic,
                                data.southBoreal_strongOceanic, data.southBoreal_transferSection,
                                data.southBoreal_weakOceanic, null);
                            SetZones(exAssessment.CurrentBioClimateZones, "midBoreal", data.midBoreal_clearOceanic,
                                data.midBoreal_strongOceanic, data.midBoreal_transferSection, data.midBoreal_weakOceanic,
                                data.midBoreal_weakContinental);
                            SetZones(exAssessment.CurrentBioClimateZones, "northBoreal", data.northBoreal_clearOceanic,
                                data.northBoreal_strongOceanic, data.northBoreal_transferSection,
                                data.northBoreal_weakOceanic, data.northBoreal_weakContinental);
                            SetZones(exAssessment.CurrentBioClimateZones, "alpineZones", data.alpineZones_clearOceanic,
                                data.alpineZones_strongOceanic, data.alpineZones_transferSection,
                                data.alpineZones_weakOceanic, data.alpineZones_weakContinental);
                        }
                    }
                }
            }

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

            var theCsvConfiguration = new CsvConfiguration(new CultureInfo("nb-NO"))
            {
                Delimiter = ";",
                Encoding = Encoding.UTF8
            };
            var taxonService = new SwissKnife.Database.TaksonService();

            var datetime = DateTime.MinValue;
            var redlistByScientificName = GetRedlistByScientificNameDictoDictionary(inputFolder, theCsvConfiguration);

            var nin = ParseJson("/Prod.Web/src/Nin2_3.json");
            var dictNin = DrillDown2(nin["Children"].AsArray()).ToDictionary(item => item.Item1.Substring(3), item => item.Item2);

            //var nin = ParseJson("/Prod.Web/src/Nin2_3.json");
            var nin2 = ParseJson("/Prod.Web/src/TrueteOgSjeldneNaturtyper2018.json");
            // key = "NA T12|124" altså med kode og value 
            Dictionary<string, string> dict = new Dictionary<string, string>();
            //dict = DrillDown(nin2["Children"].AsArray()).ToDictionary(item => item.Item1.Substring(3), item => item.Item2);
            foreach (var item in DrillDown(nin2["Children"].AsArray()))
            {
                var key = item.Item1;
                if (!dict.ContainsKey(key)) dict.Add(key, item.Item2);
            }

            // hele koderøkla
            //var codes = ParseJson("/Prod.Web/src/FA3CodesNB.json");
            //var migrationPathway = codes["Children"]["migrationPathways"].AsArray()[0]["Children"]["mp"][0]["Children"]["mpimport"].AsArray();
            //var dictPath = DrillDown3(migrationPathway)
            //    .ToDictionary(item => item.Item1, item => item);

            var bioklimImport = GetBioClimDataFromFile(theCsvConfiguration, inputFolder);

            var RedList = dict.Select(x => x.Key.Split("|").First()).Union(dict.Select(x => "NA " + x.Key.Split("|").First())).ToArray();
            

            var existing = _database.Assessments.ToDictionary(x => x.Id, x => JsonSerializer.Deserialize<FA4>(x.Doc, jsonSerializerOptions));
            var seen = new List<int>();
            // mapping
            var mapper = Fab3Mapper.CreateMappingFromOldToNew();
            var batchsize = 50;
            var count = 0;
            IEnumerable<Prod.Domain.Legacy.FA3Legacy> assessments = GetAssessments(inputFolder);

            foreach (var assessment in assessments)
            {
                if (!string.IsNullOrWhiteSpace(assessment.RiskAssessment.SpreadYearlyIncreaseCalculatedExpansionSpeed))
                {
                    
                }
            }


            List<Tuple<string, string, string>> obsTekster = new List<Tuple<string, string, string>>();
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
                seen.Add(theMatchingAssessment.Key);

                // todo: overfør manglende morro
                var exAssessment = JsonSerializer.Deserialize<FA4>(real.Doc, jsonSerializerOptions);
                var orgCopy = JsonSerializer.Deserialize<FA4>(real.Doc, jsonSerializerOptions);
                exAssessment.ExtensionData = null;
                exAssessment.RiskAssessment.ExtensionData = null;

                orgCopy.ExtensionData = null;
                orgCopy.RiskAssessment.ExtensionData = null;

                // Disse feltene er de som faktisk patches.....
                Debug.Assert(exAssessment != null, nameof(exAssessment) + " != null");

                //TransferAndFixPropertiesOnAssessmentsFrom2018(exAssessment, newAssesment);
                //if (_disse.Contains(real.Id))
                //{
                //    // FixRedlistOnExistingAssessment(exAssessment, redlistByScientificName, taxonService);      
                //}
                //TestForNaturetypeTrouble(console, exAssessment, RedList, dict, dictNin);
                //FixSpeciesNatureTypeInteractionsWithLI(exAssessment, real.Id);

                //FixZones(bioklimImport, exAssessment, real.Id);
                FixReasonForChangeBasedOn2018(exAssessment, oldAssessment);

                var comparisonResult = comparer.Compare(orgCopy, exAssessment);
                if (real.ScientificNameId != exAssessment.EvaluatedScientificNameId)
                {
                    real.ScientificNameId = exAssessment.EvaluatedScientificNameId.Value;
                }

                if (comparisonResult.AreEqual == false)
                {
                    console.WriteLine($"Endring på doc {exAssessment.Id} {exAssessment.ExpertGroup} {exAssessment.EvaluatedScientificName} {comparisonResult.DifferencesString}");
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

            // fiks ting på vurderinger som er nye for 2023
            var notSeen = existing.Where(x => !seen.Contains(x.Key)).Select(y=>y.Key).ToArray();
            foreach (var item in notSeen)
            {
                var real = _database.Assessments.Single(x => x.Id == item);

                // todo: overfør manglende morro
                var exAssessment = JsonSerializer.Deserialize<FA4>(real.Doc, jsonSerializerOptions);
                var orgCopy = JsonSerializer.Deserialize<FA4>(real.Doc, jsonSerializerOptions);

                exAssessment.ExtensionData = null;
                exAssessment.RiskAssessment.ExtensionData = null;

                orgCopy.ExtensionData = null;
                orgCopy.RiskAssessment.ExtensionData = null;

                Debug.Assert(exAssessment != null, nameof(exAssessment) + " != null");

                //FixPropertiesOnNewAssessments(exAssessment);
                //FixRedlistOnExistingAssessment(exAssessment, redlistByScientificName, taxonService);
                //TestForNaturetypeTrouble(console, exAssessment, RedList, dict, dictNin);

                //FixZones(bioklimImport, exAssessment, real.Id);

                var comparisonResult = comparer.Compare(orgCopy, exAssessment);
                if (real.ScientificNameId != exAssessment.EvaluatedScientificNameId)
                {
                    real.ScientificNameId = exAssessment.EvaluatedScientificNameId.Value;
                }
                if (comparisonResult.AreEqual == false)
                {
                    console.WriteLine($"Endring på doc {exAssessment.Id} {exAssessment.ExpertGroup} {exAssessment.EvaluatedScientificName} {comparisonResult.DifferencesString}");
                    real.Doc = JsonSerializer.Serialize<FA4>(exAssessment);
                }

                count++;

                if (count > batchsize)
                {
                    _database.SaveChanges();
                    count = 0;
                }
            }

            _database.SaveChanges();

            //foreach (var tuple in obsTekster)
            //{
            //    console.WriteLine("OBS: " + tuple.Item1 + " " + tuple.Item2 + ":" + tuple.Item3);
            //}
        }

        private static void FixReasonForChangeBasedOn2018(FA4 exAssessment, FA3Legacy oldAssessment)
        {
            if (exAssessment.EvaluationStatus == "finished" &&
                exAssessment.LastUpdatedAt <= _magicemaildatedateTime)
            {
                if (oldAssessment.RiskAssessment.RedListUsedCriteria != null && (
                        (oldAssessment.RiskAssessment.RedListUsedCriteria.Contains("B") ||
                         oldAssessment.RiskAssessment.RedListUsedCriteria.Contains("D2"))
                        && !oldAssessment.RiskAssessment.RedListUsedCriteria.Contains("D1")))
                {
                    if (oldAssessment.RiskAssessment.ChosenSpreadMedanLifespan == "RedListCategoryLevel")
                    {
                        if (oldAssessment.AlienSpeciesCategory != "NotApplicable" &&
                            _importantCategories.Contains(oldAssessment.RiskAssessment.RiskLevelCode))
                        {
                            if (oldAssessment.RiskAssessment.RiskLevelCode != exAssessment.Category)
                            {
                                var oldValue = oldAssessment.RiskAssessment.Criteria.First(x => x.CriteriaLetter == "A").Value;
                                var newValue = exAssessment.RiskAssessment.Criteria.First(x => x.CriteriaLetter == "A").Value;
                                if ((oldAssessment.RiskAssessment.DecisiveCriteria.Contains("A")
                                     || oldAssessment.RiskAssessment.DecisiveCriteria == "1,1")
                                    && oldValue < newValue)
                                {
                                    if (exAssessment.ReasonForChangeOfCategory.Any(x => x == "changedCriteria"))
                                    {
                                        exAssessment.ReasonForChangeOfCategory.Remove("changedCriteria");
                                        if (exAssessment.ReasonForChangeOfCategory.All(
                                                x => x != "changedCriteriaInterpretation"))
                                        {
                                            exAssessment.ReasonForChangeOfCategory.Add(
                                                "changedCriteriaInterpretation");
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        private Dictionary<int, BioClimData> GetBioClimDataFromFile(CsvConfiguration theCsvConfiguration,
            string inputFolder)
        {
            var result = new Dictionary<int, BioClimData>();
            using (var reader = new StreamReader(inputFolder + "\\..\\Importfiler\\soneseksjon_mean_current_karplanter_til_FAB.csv"))
            {
                using (var csv = new CsvReader(reader, theCsvConfiguration))
                {
                    var records = csv.GetRecords<BioClimData>();
                    result = records.ToDictionary(x => x.Id, y => y);
                }
            }
            return result;
        }

        private void FixSpeciesNatureTypeInteractionsWithLI(FA4 exAssessment, int realId)
        {
            if (!_disse.Contains(realId)) return;

            var sjekk = exAssessment.RiskAssessment.SpeciesNaturetypeInteractions.ToArray();
            foreach (var speciesNaturetypeInteraction in sjekk)
            {
                if (speciesNaturetypeInteraction.NiNCode.StartsWith("LI"))
                {
                    exAssessment.RiskAssessment.SpeciesNaturetypeInteractions.Remove(speciesNaturetypeInteraction);
                }
            }
        }

        private static void TestForNaturetypeTrouble(IConsole console, FA4 exAssessment, string[] RedList,
            Dictionary<string, string> dictionary, Dictionary<string, string> dictNin)
        {
            if (exAssessment.ImpactedNatureTypes.Any())
            {
                foreach (var impactedNatureType in exAssessment.ImpactedNatureTypes)
                {
                    var natureTypeArea = impactedNatureType.AffectedArea;


                    if (RedList.Contains(impactedNatureType.NiNCode) && exAssessment.EvaluationStatus == "finished" &&
                        natureTypeArea != "0")
                    {
                        console.WriteLine(
                            $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:" : string.Empty)} {exAssessment.ExpertGroup} {impactedNatureType.NiNCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                    }
                    //if (RedList.Contains(impactedNatureType.NiNCode)) // && exAssessment.EvaluationStatus == "finished") // && natureTypeArea != "0")
                    //{
                    //    if (exAssessment.ExpertGroup.ToLowerInvariant().Contains("svalbard"))
                    //    {
                    //        // svalbard
                    //        var newCode = dictionary.Where(x => x.Key.Split("|").First() == impactedNatureType.NiNCode)
                    //            .First().Key.Split("|").Last();
                    //        if (newCode == "75")
                    //        {
                    //            newCode = "124";
                    //        }
                    //        console.WriteLine(
                    //            $"{exAssessment.ExpertGroup} {impactedNatureType.NiNCode} -> {newCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                    //        impactedNatureType.NiNCode = newCode;
                    //    }
                    //    else
                    //    {
                    //        // annet
                    //        var newCode = dictionary.Where(x => x.Key.Split("|").First() == impactedNatureType.NiNCode)
                    //            .First().Key.Split("|").Last();
                    //        if (newCode == "124")
                    //        {
                    //            newCode = "75";
                    //        }
                    //        console.WriteLine(
                    //            $"{exAssessment.ExpertGroup} {impactedNatureType.NiNCode} -> {newCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                    //        impactedNatureType.NiNCode = newCode;
                    //    }

                    //    //console.WriteLine(
                    //    //    $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:": string.Empty)} {exAssessment.ExpertGroup} {impactedNatureType.NiNCode} {natureTypeArea} {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                    //}
                }

                var test = exAssessment.ImpactedNatureTypes.GroupBy(x => x.NiNCode)
                    .Select(x => new { NiNCode = x.Key, ImpactedNatureTypes = x.ToArray() });
                foreach (var group in test)
                {
                    if (dictNin.Any(x => "NA " + x.Key.Split("-").First() == group.NiNCode))
                    {
                        //console.WriteLine(
                        //    $"{(exAssessment.EvaluationStatus == "imported" ? "Ikkje påbegynt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                    }

                    if (group.ImpactedNatureTypes.Length > 1)
                    {
                        if (dictNin.Any(x=>"NA " + x.Key.Split("-").First() == group.NiNCode) )
                        {
                            console.WriteLine(
                                $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");

                        }
                        if (dictNin.Any(x => x.Key.Split("-").First() == group.NiNCode))
                        {
                            //console.WriteLine(
                            //    $"{(exAssessment.EvaluationStatus == "finished" ? "Ferdigstillt:" : string.Empty)} {group.NiNCode} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                        }

                        var test2 = group.ImpactedNatureTypes.Select(x => x.TimeHorizon).Distinct().ToArray();
                        if (test2.Length != group.ImpactedNatureTypes.Length && exAssessment.EvaluationStatus == "imported")
                        {

                            // hvis status = ''
                            //console.WriteLine(
                            //    $"{(exAssessment.EvaluationStatus == "imported" ? "Ikkje påbegynt:" : string.Empty)} {exAssessment.ExpertGroup}  {exAssessment.EvaluatedScientificName} {exAssessment.EvaluatedVernacularName}");
                            var naturtyper = group.ImpactedNatureTypes.ToArray();

                            var naturtyperLength = naturtyper.Length;
                            var removed = new List<FA4.ImpactedNatureType>();
                            for (var i = 0; i < naturtyperLength; i++)
                            {
                                var outer = naturtyper[i];
                                if (removed.Contains(outer)) continue;
                                
                                for (int j = i+1; j < naturtyperLength; j++)
                                {
                                    var inner = naturtyper[j];
                                    if (removed.Contains(inner)) continue;

                                    if (outer.NiNCode == inner.NiNCode &&
                                        outer.TimeHorizon == inner.TimeHorizon &&
                                        outer.ColonizedArea == inner.ColonizedArea &&
                                        outer.AffectedArea == inner.AffectedArea &&
                                        outer.StateChange.All(x=> inner.StateChange.Contains(x)) &&
                                        outer.Background.All(x => inner.Background.Contains(x))
                                        )
                                    {
                                        removed.Add(inner);
                                        exAssessment.ImpactedNatureTypes.Remove(inner);
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }

        private static Dictionary<int, Rodliste2021Rad[]> GetRedlistByScientificNameDictoDictionary(string inputFolder,
            CsvConfiguration theCsvConfiguration)
        {
            Dictionary<int, Rodliste2021Rad[]> redlistByScientificName;
            using (var reader = new StreamReader(inputFolder + "\\..\\Importfiler\\rødliste-2021.csv"))
            {
                using (var csv = new CsvReader(reader, theCsvConfiguration))
                {
                    var records = csv.GetRecords<Models.Rodliste2021Rad>();
                    redlistByScientificName = records.GroupBy(x => x.VitenskapeligId)
                        .ToDictionary(x => x.Key, y => y.OrderBy(x=>x.Region).ToArray());
                }
            }

            return redlistByScientificName;
        }

        private static void FixRedlistOnExistingAssessment(FA4? exAssessment,
            Dictionary<int, Rodliste2021Rad[]> redlistByScientificName, TaksonService taksonService)
        {
            //tryfixredlist
            foreach (var interaction in exAssessment.RiskAssessment.SpeciesSpeciesInteractions)
            {
                var currentSciId = interaction.ScientificNameId;
                if (redlistByScientificName.ContainsKey(currentSciId))
                {
                    var hit = GetRegionalRedlist(redlistByScientificName, currentSciId, exAssessment.ExpertGroup);

                    var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                    if (interaction.RedListCategory != interactionRedListCategory)
                    {
                        interaction.RedListCategory = interactionRedListCategory;
                    }
                }
                else
                {

                    var ti = taksonService.getTaxonInfo(currentSciId).GetAwaiter().GetResult();
                    if (ti != null)
                    {
                        if (redlistByScientificName.ContainsKey(ti.ValidScientificNameId))
                        {
                            var hit = GetRegionalRedlist(redlistByScientificName, ti.ValidScientificNameId, exAssessment.ExpertGroup);
                            var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                            if (interaction.RedListCategory != interactionRedListCategory)
                            {
                                interaction.RedListCategory = interactionRedListCategory;
                            }
                        }
                        else
                        {

                        }
                    }
                    else
                    {
                        //trøbbel
                    }

                }
            }
            foreach (var interaction in exAssessment.RiskAssessment.HostParasiteInformations)
            {
                var currentSciId = interaction.ScientificNameId;
                if (redlistByScientificName.ContainsKey(currentSciId))
                {
                    var hit = GetRegionalRedlist(redlistByScientificName, currentSciId, exAssessment.ExpertGroup);
                    var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                    if (interaction.RedListCategory != interactionRedListCategory)
                    {
                        interaction.RedListCategory = interactionRedListCategory;
                    }
                }
                else
                {

                    var ti = taksonService.getTaxonInfo(currentSciId).GetAwaiter().GetResult();
                    if (ti != null)
                    {
                        if (redlistByScientificName.ContainsKey(ti.ValidScientificNameId))
                        {
                            var hit = GetRegionalRedlist(redlistByScientificName, ti.ValidScientificNameId, exAssessment.ExpertGroup);
                            var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                            if (interaction.RedListCategory != interactionRedListCategory)
                            {
                                interaction.RedListCategory = interactionRedListCategory;
                            }
                        }
                        else
                        {

                        }
                    }
                    else
                    {
                        //trøbbel
                    }

                }
            }
            foreach (var interaction in exAssessment.RiskAssessment.GeneticTransferDocumented)
            {
                var currentSciId = interaction.ScientificNameId;
                if (redlistByScientificName.ContainsKey(currentSciId))
                {
                    var hit = GetRegionalRedlist(redlistByScientificName, currentSciId, exAssessment.ExpertGroup);
                    var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                    if (interaction.RedListCategory != interactionRedListCategory)
                    {
                        interaction.RedListCategory = interactionRedListCategory;
                    }
                }
                else
                {

                    var ti = taksonService.getTaxonInfo(currentSciId).GetAwaiter().GetResult();
                    if (ti != null)
                    {
                        if (redlistByScientificName.ContainsKey(ti.ValidScientificNameId))
                        {
                            var hit = GetRegionalRedlist(redlistByScientificName, ti.ValidScientificNameId, exAssessment.ExpertGroup);
                            var interactionRedListCategory = hit.Kategori.Substring(0, 2);
                            if (interaction.RedListCategory != interactionRedListCategory)
                            {
                                interaction.RedListCategory = interactionRedListCategory;
                            }
                        }
                        else
                        {

                        }
                    }
                    else
                    {
                        //trøbbel
                    }

                }
            }
        }

        private static Rodliste2021Rad GetRegionalRedlist(Dictionary<int, Rodliste2021Rad[]> redlistByScientificName,
            int currentSciId, string exAssessmentExpertGroup)
        {
            if (!redlistByScientificName.ContainsKey(currentSciId)) return null;
            var hits = redlistByScientificName[currentSciId];
            var svalbard = exAssessmentExpertGroup.ToLowerInvariant().Contains("svalbard");
            if (hits.Length == 0) return null;
            if (!svalbard && hits.Length == 1 && hits[0].Region == "Svalbard") return null;
            if (hits.Length == 1) return hits[0];
            var svalbardvurdering = hits.SingleOrDefault(x => x.Region == "Svalbard");
            var fastlandsvurdering = hits.SingleOrDefault(x => x.Region != "Svalbard");
            if (svalbard && svalbardvurdering != null) return svalbardvurdering;
            if (svalbard && svalbardvurdering == null) return fastlandsvurdering;
            if (!svalbard && fastlandsvurdering != null) return fastlandsvurdering;
            return fastlandsvurdering;
        }

        private static void FixPropertiesOnNewAssessments(FA4? exAssessment)
        {
            //exAssessment.ArtskartModel ??= new ArtskartModel();
            //exAssessment.ArtskartWaterModel ??= new ArtskartWaterModel();
            //exAssessment.ImpactedNatureTypesFrom2018 ??= new List<FA4.ImpactedNatureType>();

            //if (exAssessment.ExpertGroup == "Sopper")
            //{
            //    if (exAssessment.TaxonHierarcy.ToLowerInvariant().StartsWith("chromista"))
            //    {
            //        exAssessment.ExpertGroup = "Kromister";
            //    }
            //}

            //if (exAssessment.Fylkesforekomster.All(x => x.Fylke != "St"))
            //    exAssessment.Fylkesforekomster.Add(new Fylkesforekomst() { Fylke = "St" });
            //if (exAssessment.Fylkesforekomster.All(x => x.Fylke != "Nt"))
            //    exAssessment.Fylkesforekomster.Add(new Fylkesforekomst() { Fylke = "Nt" });

            //if (exAssessment.HorizonEcologicalEffect != null &&
            //    exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "yeswhilepresent" &&
            //    exAssessment.HorizonEcologicalEffect != "yesWhilePresent")
            //    exAssessment.HorizonEcologicalEffect = "yesWhilePresent";
            //if (exAssessment.HorizonEcologicalEffect != null &&
            //    exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "no" && exAssessment.HorizonEcologicalEffect != "no")
            //    exAssessment.HorizonEcologicalEffect = "no";
            //if (exAssessment.HorizonEcologicalEffect != null &&
            //    exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "yesaftergone" &&
            //    exAssessment.HorizonEcologicalEffect != "yesAfterGone")
            //    exAssessment.HorizonEcologicalEffect = "yesAfterGone";

            //if (exAssessment.HorizonScanResult == "scanned_fullAssessment")
            //{
            //    if (exAssessment.HorizonEstablismentPotential == "0")
            //    {
            //        exAssessment.RiskAssessment.Occurrences1Best = 0;
            //    }
            //    else if (exAssessment.HorizonEstablismentPotential == "1")
            //    {
            //        exAssessment.RiskAssessment.Occurrences1Best = 1;
            //    }
            //}

            //if (exAssessment.HorizonScanResult== "scanned_fullAssessment")
            //{
            //    exAssessment.IsAlienSpecies = true;
            //}

            //if (!string.IsNullOrWhiteSpace(exAssessment.IsAlien))
            //{
            //    console.WriteLine("denneisalien:" + exAssessment.ExpertGroup + ":" + exAssessment.EvaluatedScientificName);
            //}

            //if (exAssessment.IsAlienSpecies.HasValue && exAssessment.IsAlienSpecies.Value == false)
            //{
            //    exAssessment.IsAlien = exAssessment.AssesmentNotApplicableDescription;
            //    if (!string.IsNullOrWhiteSpace(exAssessment.IsAlien))
            //    {
            //        obsTekster.Add(new Tuple<string, string, string>(exAssessment.ExpertGroup,
            //            exAssessment.EvaluatedScientificName, "pot overskrev: " + exAssessment.IsAlien));
            //    }

            //}
        }

        private static void TransferAndFixPropertiesOnAssessmentsFrom2018(FA4? exAssessment, FA4 newAssesment)
        {
            //exAssessment.SpreadHistory = newAssesment.SpreadHistory;

            //exAssessment.RegionalPresenceKnown = newAssesment.RegionalPresenceKnown;
            //exAssessment.RegionalPresenceAssumed = newAssesment.RegionalPresenceAssumed;
            //exAssessment.RegionalPresencePotential = newAssesment.RegionalPresencePotential;
            //exAssessment.Fylkesforekomster = newAssesment.Fylkesforekomster;

            ////map fix

            //exAssessment.RiskAssessment.AOOknownInput = newAssesment.RiskAssessment.AOOknownInput;
            //exAssessment.RiskAssessment.AOOknown = newAssesment.RiskAssessment.AOOknown;
            //exAssessment.RiskAssessment.AOOknown1 = newAssesment.RiskAssessment.AOOknown1;
            //exAssessment.RiskAssessment.AOOknown2 = newAssesment.RiskAssessment.AOOknown2;
            //exAssessment.RiskAssessment.AOOtotalBestInput = newAssesment.RiskAssessment.AOOtotalBestInput;
            //exAssessment.RiskAssessment.AOOtotalBest = newAssesment.RiskAssessment.AOOtotalBest;
            //exAssessment.RiskAssessment.AOOtotalLowInput = newAssesment.RiskAssessment.AOOtotalLowInput;
            //exAssessment.RiskAssessment.AOOtotalLow = newAssesment.RiskAssessment.AOOtotalLow;
            //exAssessment.RiskAssessment.AOOtotalHighInput = newAssesment.RiskAssessment.AOOtotalHighInput;
            //exAssessment.RiskAssessment.AOOtotalHigh = newAssesment.RiskAssessment.AOOtotalHigh;
            //exAssessment.RiskAssessment.AOO50yrBestInput = newAssesment.RiskAssessment.AOO50yrBestInput;
            //exAssessment.RiskAssessment.AOO50yrBest = newAssesment.RiskAssessment.AOO50yrBest;
            //exAssessment.RiskAssessment.AOO50yrLowInput = newAssesment.RiskAssessment.AOO50yrLowInput;
            //exAssessment.RiskAssessment.AOO50yrLow = newAssesment.RiskAssessment.AOO50yrLow;
            //exAssessment.RiskAssessment.AOO50yrHighInput = newAssesment.RiskAssessment.AOO50yrHighInput;
            //exAssessment.RiskAssessment.AOO50yrHigh = newAssesment.RiskAssessment.AOO50yrHigh;
            //exAssessment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes =
            //    newAssesment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;


            //exAssessment.RiskAssessment.ChosenSpreadYearlyIncrease = newAssesment.RiskAssessment.ChosenSpreadYearlyIncrease;
            //exAssessment.RiskAssessment.ExpansionSpeedInput = newAssesment.RiskAssessment.ExpansionSpeedInput;
            //exAssessment.RiskAssessment.ExpansionUpperQInput = newAssesment.RiskAssessment.ExpansionUpperQInput;
            //exAssessment.RiskAssessment.ExpansionLowerQInput = newAssesment.RiskAssessment.ExpansionLowerQInput;

            //exAssessment.RiskAssessment.AOOdarkfigureBest = newAssesment.RiskAssessment.AOOdarkfigureBest;
            //exAssessment.RiskAssessment.AOOdarkfigureHigh = newAssesment.RiskAssessment.AOOdarkfigureHigh;
            //exAssessment.RiskAssessment.AOOdarkfigureLow = newAssesment.RiskAssessment.AOOdarkfigureLow;


            //exAssessment.IsAlienSpecies = newAssesment.IsAlienSpecies;
            //exAssessment.ConnectedToAnother = newAssesment.ConnectedToAnother;
            //exAssessment.ProductionSpecies = exAssessment.ProductionSpecies is true ? true : newAssesment.ProductionSpecies;
            //exAssessment.AlienSpecieUncertainIfEstablishedBefore1800 = newAssesment.AlienSpecieUncertainIfEstablishedBefore1800;
            //exAssessment.IsRegionallyAlien = newAssesment.IsRegionallyAlien;
            //exAssessment.IsAlienSpecies = newAssesment.IsAlienSpecies;
            //exAssessment.ConnectedToAnother = newAssesment.ConnectedToAnother;

            //exAssessment.RiskAssessment.SpeciesSpeciesInteractions = newAssesment.RiskAssessment.SpeciesSpeciesInteractions;
            //exAssessment.RiskAssessment.SpeciesNaturetypeInteractions =
            //    newAssesment.RiskAssessment.SpeciesNaturetypeInteractions;
            //exAssessment.RiskAssessment.SpeciesNaturetypeInteractions2018 =
            //    newAssesment.RiskAssessment.SpeciesNaturetypeInteractions2018;
            //exAssessment.RiskAssessment.HostParasiteInformations = newAssesment.RiskAssessment.HostParasiteInformations;
            //exAssessment.RiskAssessment.GeneticTransferDocumented = newAssesment.RiskAssessment.GeneticTransferDocumented;

            //exAssessment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes =
            //    newAssesment.RiskAssessment.SpreadHistoryDomesticAreaInStronglyChangedNatureTypes;

            //exAssessment.RiskAssessment.YearFirstIndoors = newAssesment.RiskAssessment.YearFirstIndoors;
            //exAssessment.RiskAssessment.YearFirstIndoorsInsecure = newAssesment.RiskAssessment.YearFirstIndoorsInsecure;
            //exAssessment.RiskAssessment.YearFirstReproductionIndoors = newAssesment.RiskAssessment.YearFirstReproductionIndoors;
            //exAssessment.RiskAssessment.YearFirstReproductionIndoorsInsecure =
            //    newAssesment.RiskAssessment.YearFirstReproductionIndoorsInsecure;
            //exAssessment.RiskAssessment.YearFirstProductionOutdoors = newAssesment.RiskAssessment.YearFirstProductionOutdoors;
            //exAssessment.RiskAssessment.YearFirstProductionOutdoorsInsecure =
            //    newAssesment.RiskAssessment.YearFirstProductionOutdoorsInsecure;
            //exAssessment.RiskAssessment.YearFirstReproductionOutdoors =
            //    newAssesment.RiskAssessment.YearFirstReproductionOutdoors;
            //exAssessment.RiskAssessment.YearFirstReproductionOutdoorsInsecure =
            //    newAssesment.RiskAssessment.YearFirstReproductionOutdoorsInsecure;
            //exAssessment.RiskAssessment.YearFirstEstablishmentProductionArea =
            //    newAssesment.RiskAssessment.YearFirstEstablishmentProductionArea;
            //exAssessment.RiskAssessment.YearFirstEstablishmentProductionAreaInsecure =
            //    newAssesment.RiskAssessment.YearFirstEstablishmentProductionAreaInsecure;
            //exAssessment.RiskAssessment.YearFirstNature = newAssesment.RiskAssessment.YearFirstNature;
            //exAssessment.RiskAssessment.YearFirstNatureInsecure = newAssesment.RiskAssessment.YearFirstNatureInsecure;
            //exAssessment.RiskAssessment.YearFirstReproductionNature = newAssesment.RiskAssessment.YearFirstReproductionNature;
            //exAssessment.RiskAssessment.YearFirstReproductionNatureInsecure =
            //    newAssesment.RiskAssessment.YearFirstReproductionNatureInsecure;
            //exAssessment.RiskAssessment.YearFirstEstablishedNature = newAssesment.RiskAssessment.YearFirstEstablishedNature;
            //exAssessment.RiskAssessment.YearFirstEstablishedNatureInsecure =
            //    newAssesment.RiskAssessment.YearFirstEstablishedNatureInsecure;

            //exAssessment.RiskAssessment.ExpansionUpperQInput = newAssesment.RiskAssessment.ExpansionUpperQInput;
            //exAssessment.RiskAssessment.ExpansionLowerQInput = newAssesment.RiskAssessment.ExpansionLowerQInput;
            //exAssessment.RiskAssessment.ExpansionSpeedInput = newAssesment.RiskAssessment.ExpansionSpeedInput;


            //exAssessment.RiskAssessment.ROAscore2018 = newAssesment.RiskAssessment.ROAscore2018;

            ////if (exAssessment.ExpertGroup != newAssesment.ExpertGroup)
            ////{
            ////    if (exAssessment.HorizonDoScanning)
            ////    {

            ////    }
            ////}
            //exAssessment.ExpertGroup = newAssesment.ExpertGroup;

            //if (exAssessment.ExpertGroup == "Sopper")
            //{
            //    if (exAssessment.TaxonHierarcy.ToLowerInvariant().StartsWith("chromista"))
            //    {
            //        exAssessment.ExpertGroup = "Kromister";
            //    }
            //}

            //if (newAssesment.IsDeleted && !exAssessment.IsDeleted)
            //{
            //    exAssessment.IsDeleted = true;
            //}


            //exAssessment.AssesmentVectors = newAssesment.AssesmentVectors;

            //exAssessment.ImpactedNatureTypes = newAssesment.ImpactedNatureTypes;
            //exAssessment.ImpactedNatureTypesFrom2018 = newAssesment.ImpactedNatureTypesFrom2018;
            //exAssessment.Habitats = newAssesment.Habitats;

            //exAssessment.ArtskartModel = newAssesment.ArtskartModel;
            //exAssessment.ArtskartWaterModel = newAssesment.ArtskartWaterModel;
            //if (exAssessment.Fylkesforekomster.All(x => x.Fylke != "St"))
            //    exAssessment.Fylkesforekomster.Add(new Fylkesforekomst() { Fylke = "St" });
            //if (exAssessment.Fylkesforekomster.All(x => x.Fylke != "Nt"))
            //    exAssessment.Fylkesforekomster.Add(new Fylkesforekomst() { Fylke = "Nt" });
            //exAssessment.RiskAssessment.Criteria = newAssesment.RiskAssessment.Criteria;

            //if (exAssessment.HorizonEcologicalEffect != null &&
            //    exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "yeswhilepresent" &&
            //    exAssessment.HorizonEcologicalEffect != "yesWhilePresent")
            //    exAssessment.HorizonEcologicalEffect = "yesWhilePresent";
            //if (exAssessment.HorizonEcologicalEffect != null &&
            //    exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "no" && exAssessment.HorizonEcologicalEffect != "no")
            //    exAssessment.HorizonEcologicalEffect = "no";
            //if (exAssessment.HorizonEcologicalEffect != null &&
            //    exAssessment.HorizonEcologicalEffect.ToLowerInvariant() == "yesaftergone" &&
            //    exAssessment.HorizonEcologicalEffect != "yesAfterGone")
            //    exAssessment.HorizonEcologicalEffect = "yesAfterGone";

            //exAssessment.RiskAssessment.Occurrences1Best = newAssesment.RiskAssessment.Occurrences1Best;
            //exAssessment.RiskAssessment.Occurrences1High = newAssesment.RiskAssessment.Occurrences1High;
            //exAssessment.RiskAssessment.Occurrences1Low = newAssesment.RiskAssessment.Occurrences1Low;

            //if (exAssessment.HorizonScanResult == "scanned_fullAssessment")
            //{
            //    if (exAssessment.HorizonEstablismentPotential == "0")
            //    {
            //        exAssessment.RiskAssessment.Occurrences1Best = 0;
            //    }
            //    else if (exAssessment.HorizonEstablismentPotential == "1")
            //    {
            //        exAssessment.RiskAssessment.Occurrences1Best = 1;
            //    }
            //}

            //exAssessment.AssesmentVectors = newAssesment.AssesmentVectors;
            //exAssessment.RiskAssessment.DemVariance = newAssesment.RiskAssessment.DemVariance;
            //exAssessment.RiskAssessment.EnvVariance = newAssesment.RiskAssessment.EnvVariance;

            // prod 16.02.2020
            //if (exAssessment.HorizonScanResult == "scanned_fullAssessment")
            //{
            //    exAssessment.IsAlienSpecies = true;
            //}

            //exAssessment.PreviousAssessments = newAssesment.PreviousAssessments;

            //exAssessment.IndoorProduktion = newAssesment.IndoorProduktion;
            //exAssessment.SpreadIntroductionFurtherInfo = newAssesment.SpreadIntroductionFurtherInfo;

            //exAssessment.RiskAssessment.SpeciesSpeciesInteractions = newAssesment.RiskAssessment.SpeciesSpeciesInteractions;
            //exAssessment.RiskAssessment.HostParasiteInformations = newAssesment.RiskAssessment.HostParasiteInformations;
            //exAssessment.RiskAssessment.GeneticTransferDocumented = newAssesment.RiskAssessment.GeneticTransferDocumented;
            //exAssessment.RiskAssessment.SpeciesNaturetypeInteractions = newAssesment.RiskAssessment.SpeciesNaturetypeInteractions;
            //exAssessment.RiskAssessment.SpeciesNaturetypeInteractions2018 = newAssesment.RiskAssessment.SpeciesNaturetypeInteractions2018;


            //if (!string.IsNullOrWhiteSpace(exAssessment.IsAlien))
            //{
            //    console.WriteLine("denneisalien:" + exAssessment.ExpertGroup + ":" + exAssessment.EvaluatedScientificName);
            //    obsTekster.Add(new Tuple<string, string, string>(exAssessment.ExpertGroup,
            //        exAssessment.EvaluatedScientificName, exAssessment.IsAlien));
            //}

            //var assesmentNotApplicableDescription = newAssesment.AssesmentNotApplicableDescription;
            //if (!string.IsNullOrWhiteSpace(exAssessment.AssesmentNotApplicableDescription) &&
            //    exAssessment.AssesmentNotApplicableDescription != newAssesment.AssesmentNotApplicableDescription)
            //{
            //    assesmentNotApplicableDescription = exAssessment.AssesmentNotApplicableDescription;
            //    obsTekster.Add(new Tuple<string, string, string>(exAssessment.ExpertGroup,
            //        exAssessment.EvaluatedScientificName, assesmentNotApplicableDescription));
            //}
            //else if (string.IsNullOrWhiteSpace(exAssessment.AssesmentNotApplicableDescription) && !string.IsNullOrWhiteSpace(newAssesment.AssesmentNotApplicableDescription))
            //{
            //    obsTekster.Add(new Tuple<string, string, string>(exAssessment.ExpertGroup,
            //        exAssessment.EvaluatedScientificName, assesmentNotApplicableDescription));
            //}

            //if (!string.IsNullOrWhiteSpace(assesmentNotApplicableDescription))
            //{

            //    if (newAssesment.AlienSpeciesCategory == "AlienSpecie" ||
            //        (newAssesment.AlienSpeciesCategory == "NotApplicable" &&
            //         newAssesment.NotApplicableCategory == "notAlienSpecie"))
            //    {
            //        exAssessment.IsAlien = newAssesment.AlienSpeciesCategory == "AlienSpecie"
            //            ? (string.IsNullOrWhiteSpace(newAssesment.AlienSpecieUncertainDescription)
            //                ? assesmentNotApplicableDescription
            //                : newAssesment.AlienSpecieUncertainDescription)
            //            : assesmentNotApplicableDescription;
            //    }
            //    else if ((newAssesment.AlienSpeciesCategory == "NotApplicable" &&
            //              newAssesment.NotApplicableCategory == "establishedBefore1800") ||
            //             (newAssesment.AlienSpeciesCategory == "NotApplicable" &&
            //              newAssesment.NotApplicableCategory == "NotPresentInRegion"))
            //    {
            //        exAssessment.UncertainityEstablishmentTimeDescription =
            //            assesmentNotApplicableDescription;
            //    }
            //    else if ((newAssesment.AlienSpeciesCategory == "NotApplicable" &&
            //              newAssesment.NotApplicableCategory == "traditionalProductionSpecie"))
            //    {
            //        exAssessment.ProductionSpeciesDescription = assesmentNotApplicableDescription;
            //    }
            //    else if ((newAssesment.AlienSpeciesCategory == "NotApplicable" &&
            //              newAssesment.NotApplicableCategory == "canNotEstablishWithin50years"))
            //    {
            //        if (exAssessment.Id == 1521
            //            || exAssessment.Id == 1850
            //            || exAssessment.Id == 2062
            //            || exAssessment.Id == 2271
            //            || exAssessment.Id == 2280
            //            || exAssessment.Id == 2442
            //            || exAssessment.Id == 2467)
            //        {
            //            exAssessment.UncertainityEstablishmentTimeDescription =
            //                assesmentNotApplicableDescription;
            //        }
            //        else
            //        {
            //            exAssessment.UncertainityStatusDescription = assesmentNotApplicableDescription;
            //        }
            //    }
            //    else if ((newAssesment.AlienSpeciesCategory == "NotApplicable" &&
            //              newAssesment.NotApplicableCategory == "taxonIsEvaluatedInHigherRank"))
            //    {
            //        exAssessment.ConnectedToAnotherTaxonDescription =
            //            assesmentNotApplicableDescription;
            //    }

            //}
        }
    }

    internal class BioClimData
    {
        public int Id { get; set; }
        public string Vitenskapelig_navn { get; set; }
        public bool boreonemoral_strongOceanic { get; set; }
        public bool boreonemoral_clearOceanic { get; set; }
        public bool boreonemoral_weakOceanic { get; set; }
        public bool boreonemoral_transferSection { get; set; }
        public bool southBoreal_strongOceanic { get; set; }
        public bool southBoreal_clearOceanic { get; set; }
        public bool southBoreal_weakOceanic { get; set; }
        public bool southBoreal_transferSection { get; set; }
        public bool southBoreal_weakContinental { get; set; }
        public bool midBoreal_strongOceanic { get; set; }
        public bool midBoreal_clearOceanic { get; set; }
        public bool midBoreal_weakOceanic { get; set; }
        public bool midBoreal_transferSection { get; set; }
        public bool midBoreal_weakContinental { get; set; }
        public bool northBoreal_strongOceanic { get; set; }
        public bool northBoreal_clearOceanic { get; set; }
        public bool northBoreal_weakOceanic { get; set; }
        public bool northBoreal_transferSection { get; set; }
        public bool northBoreal_weakContinental { get; set; }
        public bool alpineZones_strongOceanic { get; set; }
        public bool alpineZones_clearOceanic { get; set; }
        public bool alpineZones_weakOceanic { get; set; }
        public bool alpineZones_transferSection { get; set; }
        public bool alpineZones_weakContinental { get; set; }
    }
}
