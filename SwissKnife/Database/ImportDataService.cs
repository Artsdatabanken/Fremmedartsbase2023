using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using CsvHelper.Configuration;
using KellermanSoftware.CompareNetObjects;
using McMaster.Extensions.CommandLineUtils;
using Microsoft.EntityFrameworkCore;
using Prod.Data.EFCore;
using Prod.Domain;
using Prod.Domain.Legacy;
using SwissKnife.Database.CsvModels;

namespace SwissKnife.Database
{
    public partial class ImportDataService
    {
        private SqlServerProdDbContext _database;
        /// <summary>
        /// Kan settes for å delprosessere i noen tilfeller
        /// </summary>
        internal static int[] _disse = new[] { 1604 }; //2753, 1718, 1684, 2584, 444, 1784, 485, 1717 };
        private bool _dataBoreonemoralClearOceanic;
        internal static string[] _importantCategories = new[] { "HI", "LO", "NK", "PH", "SE" };
        internal static DateTime _magicemaildatedateTime = new DateTime(2022, 9, 23, 14, 8, 0);
        internal static readonly JsonSerializerOptions _jsonSerializerOptions = GetJsonSerializerOptions();
        private static TaksonService _taxonService = new TaksonService();

        public ImportDataService(string connectionString)
        {
            _database = new SqlServerProdDbContext(connectionString);
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
            var dummyDate = new DateTime(2018, 1, 1);
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
            var assessments = GetAssessments(inputFolder);
            foreach (var oldAssessment in assessments)
            {
                var newAssesment = ImportDataServiceHelper.TransformFromFa3ToFa4(oldAssessment, mapper);
                var dbAssessment = new Assessment
                    { Doc = JsonSerializer.Serialize(newAssesment, jsonSerializerOptions) };
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
                    var baseString =
                        $"Verdi fra 2018 ('{oldValue}') på '{fieldName}' ved estimeringsmetode '{subFieldName}' er satt til: {newValue}.";

                    string notTrillions(string newValue) => oldValue != "mer enn én billion år"
                        ? " Vennligst endre til estimert verdi."
                        : "";

                    return baseString + notTrillions(newValue);
                }

                Boolean valueHasChanged(string oldValue, double? newValue)
                {
                    if (double.TryParse(oldValue, out var test))
                    {
                        return false;
                    }

                    return oldValue != newValue.ToString();

                }

                dbAssessment.Comments = new List<AssessmentComment>();

                if (oldAssessment.RiskAssessment.SpreadRscriptEstimatedSpeciesLongevity != null &&
                    newAssesment.RiskAssessment.MedianLifetimeInput != null &&
                    valueHasChanged(oldAssessment.RiskAssessment.SpreadRscriptEstimatedSpeciesLongevity,
                        newAssesment.RiskAssessment.MedianLifetimeInput))
                {
                    dbAssessment.Comments.Add(new AssessmentComment()
                    {
                        Comment = assessmentCommentString("Median levetid", "Numerisk estimering på A-kriteriet",
                            oldAssessment.RiskAssessment.SpreadRscriptEstimatedSpeciesLongevity,
                            newAssesment.RiskAssessment.MedianLifetimeInput.ToString()),
                        CommentDate = DateTime.Now,
                        UserId = new Guid("00000000-0000-0000-0000-000000000001"),
                        ClosedById = new Guid("00000000-0000-0000-0000-000000000001"),
                        Type = CommentType.System
                    });
                }

                if (oldAssessment.RiskAssessment.SpreadYearlyIncreaseObservations != null &&
                    newAssesment.RiskAssessment.Occurrences1Best != null &&
                    valueHasChanged(oldAssessment.RiskAssessment.SpreadYearlyIncreaseObservations,
                        newAssesment.RiskAssessment.Occurrences1Best))
                {
                    dbAssessment.Comments.Add(new AssessmentComment()
                    {
                        Comment = assessmentCommentString("Gjennomsnittlig ekspansjonshastighet (m/år)",
                            "Datasett med tid- og stedfesta observasjoner på B-kriteriet",
                            oldAssessment.RiskAssessment.SpreadYearlyIncreaseObservations,
                            newAssesment.RiskAssessment.Occurrences1Best.ToString()),
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
            var array = _database.Assessments.Include(x => x.Attachments).ToArray();
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
                                    Date = (string.IsNullOrWhiteSpace(datasettFile.LastModified) ||
                                            datasettFile.LastModified.StartsWith("0001-01-01")
                                        ? dummydate
                                        : DateTimeOffset
                                            .FromUnixTimeMilliseconds(long.Parse(datasettFile.LastModified)).DateTime),
                                    Name = datasettFile.Filename,
                                    Description = string.IsNullOrWhiteSpace(datasettFile.Description)
                                        ? ""
                                        : datasettFile.Description,
                                    File = readAllBytes,
                                    UserId = users[doc.LastUpdatedBy].Id,
                                    Type = datasettFile.Filename.ToLowerInvariant().EndsWith("zip")
                                        ? "application/zip"
                                        : "application/csv"
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

        private static JsonNode? ParseJson(string filen)
        {
            return JsonNode.Parse(File.Exists("../../../.." + filen)
                ? File.ReadAllText("../../../.." + filen)
                : File.ReadAllText(".." + filen));
        }

        public void PatchImport(IConsole console, string inputFolder)
        {
            var comparer = new CompareLogic(new ComparisonConfig()
            {
                IgnoreUnknownObjectTypes = true,
                TreatStringEmptyAndNullTheSame = true
            });

            var theCsvConfiguration = new CsvConfiguration(new CultureInfo("nb-NO"))
            {
                Delimiter = ";",
                Encoding = Encoding.UTF8
            };

            var redlistByScientificNameDictionary =
                ImportDataServiceHelper.GetRedlistByScientificNameDictionary(inputFolder, theCsvConfiguration);

            var nin23 = ParseJson("/Prod.Web/src/Nin2_3.json");
            var dictNin23 = ImportDataServiceHelper.DrillDownNaturetypes23(nin23["Children"].AsArray())
                .ToDictionary(item => item.Item1.Substring(3), item => new Tuple<string, string>(item.Item2, item.Item3));

            var dictNin23H = ImportDataServiceHelper.DrillDownNaturetypes23H(nin23["Children"].AsArray())
                .ToDictionary(item => item.Item1.Substring(3), item => new Tuple<string, string, string>(item.Item2, item.Item3, item.Item4));

            //var nin = ParseJson("/Prod.Web/src/Nin2_3.json");
            var redlistNin = ParseJson("/Prod.Web/src/TrueteOgSjeldneNaturtyper2018.json");
            // key = "NA T12|124" altså med kode og value 
            var dict = new Dictionary<string, Tuple<string,string>>();
            //dict = DrillDown(nin2["Children"].AsArray()).ToDictionary(item => item.Item1.Substring(3), item => item.Item2);
            foreach (var item in
                     ImportDataServiceHelper.DrillDownRedlistedNaturetypes(redlistNin["Children"].AsArray()))
            {
                var key = item.Item1;
                if (!dict.ContainsKey(key)) dict.Add(key, new Tuple<string, string>(item.Item2, item.Item3));
            }

            var redlistedNaturetypes = dict
                .Select(x => x)
                .ToDictionary(x => x.Key.Split("|").Last(), y => y.Value);

            // hele koderøkla
            var codes = ParseJson("/Prod.Web/src/FA3CodesNB.json");
            var jsonNode = codes["Children"]["migrationPathways"].AsArray()[0]["Children"]["mp"].AsArray();
            var migrationPathway = ImportDataServiceHelper.DrillDownCodeList2(jsonNode); // jsonNode[0]["Children"]["mpimport"].AsArray();
            //var dictPath = ImportDataServiceHelper.DrillDownCodeList(migrationPathway)
            //    .ToDictionary(item => item.Item1, item => item);
            var bioklimPrevoisImport = ImportDataServiceHelper.GetBioClimDataFromFile(theCsvConfiguration, inputFolder,
                "soneseksjon_mean_current_karplanter_til_FAB.csv");
            var bioklimImport = ImportDataServiceHelper.GetBioClimDataFromFile(theCsvConfiguration, inputFolder,
                "soneseksjon_mean_current_karplanter_NoBug_til_FAB.csv");
            var bioklimImport2 = ImportDataServiceHelper.GetBioClimDataFromFile(theCsvConfiguration, inputFolder,
                "soneseksjon_mean_current_karplanter_AbsolutelyLast_til_FAB.csv");
            var misIdentifiedDataset =
                ImportDataServiceHelper.GetMisIdentifiedDataFromFile(theCsvConfiguration, inputFolder,
                    "MisAppliedData.csv");
            var RedList = dict.Select(x => x.Key.Split("|").First())
                .Union(dict.Select(x => "NA " + x.Key.Split("|").First())).ToArray();

            var assessmaents2012Connection =
                ImportDataServiceHelper.Get2012DataFromFile(theCsvConfiguration, inputFolder, "Fab2012koplinger.csv");

            var CrazySpecies = ImportDataServiceHelper.CrazySpeciesList();

            var existing = _database.Assessments.ToDictionary(x => x.Id,
                x => JsonSerializer.Deserialize<FA4>(x.Doc, _jsonSerializerOptions));
            var seen = new List<int>();
            // mapping
            var mapper = Fab3Mapper.CreateMappingFromOldToNew();
            var batchsize = 50;
            var count = 0;
            var assessments = GetAssessments(inputFolder);

            foreach (var assessment in assessments)
            {
                if (!string.IsNullOrWhiteSpace(assessment.RiskAssessment.SpreadYearlyIncreaseCalculatedExpansionSpeed))
                {

                }
            }

            //List<Tuple<string, string, string>> obsTekster = new List<Tuple<string, string, string>>();

            foreach (var oldAssessment in assessments)
            {
                var newAssesment = ImportDataServiceHelper.TransformFromFa3ToFa4(oldAssessment, mapper);
                var previd = newAssesment.PreviousAssessments
                    .Single(y => y.RevisionYear == 2018).AssessmentId;
                var theMatchingAssessment = existing.SingleOrDefault(x =>
                    x.Key != 7349 && x.Value.IsDeleted == false &&
                    x.Value.PreviousAssessments.Any(y => y.RevisionYear == 2018 && y.AssessmentId == previd));

                if (theMatchingAssessment.Value == null)
                {
                    continue;
                }

                var real = _database.Assessments.Single(x => x.Id == theMatchingAssessment.Key);
                seen.Add(theMatchingAssessment.Key);

                
                // todo: overfør manglende morro
                var exAssessment = JsonSerializer.Deserialize<FA4>(real.Doc, _jsonSerializerOptions);
                var orgCopy = JsonSerializer.Deserialize<FA4>(real.Doc, _jsonSerializerOptions);
                exAssessment.ExtensionData = null;
                exAssessment.RiskAssessment.ExtensionData = null;

                orgCopy.ExtensionData = null;
                orgCopy.RiskAssessment.ExtensionData = null;

                // Disse feltene er de som faktisk patches.....
                Debug.Assert(exAssessment != null, nameof(exAssessment) + " != null");

                if (false)
                {
                    ImportDataServiceHelper.TransferAndFixPropertiesOnAssessmentsFrom2018(exAssessment, newAssesment);
                    if (_disse.Contains(real.Id))
                    {
                        ImportDataServiceHelper.FixRedlistOnExistingAssessment(exAssessment,
                            redlistByScientificNameDictionary,
                            _taxonService);
                    }

                    ImportDataServiceHelper.TestForNaturetypeTrouble(console, exAssessment, RedList, dict, dictNin23);
                    ImportDataServiceHelper.FixSpeciesNatureTypeInteractionsWithLI(exAssessment, real.Id);
                    ImportDataServiceHelper.FixZones(bioklimImport, bioklimPrevoisImport, exAssessment, real);
                    ImportDataServiceHelper.FixReasonForChangeBasedOn2018(exAssessment, oldAssessment);
                    ImportDataServiceHelper.Fix2012Assessment(exAssessment, assessmaents2012Connection);
                }

                ImportDataServiceHelper.FixMainCategoryWhenMissing(exAssessment, migrationPathway);

                ImportDataServiceHelper.FixMisIdentified(exAssessment, misIdentifiedDataset, real);
                
                ImportDataServiceHelper.FixZonesOlavsArter(bioklimImport2, exAssessment, real);

                ImportDataServiceHelper.FixMissingNaturtypeName(exAssessment, dictNin23H, dict);

                ImportDataServiceHelper.FixCrazySpecies(exAssessment, CrazySpecies);

                ImportDataServiceHelper.FixMainNaturetype(console, exAssessment, RedList, redlistedNaturetypes, dictNin23H);

                var comparisonResult = comparer.Compare(orgCopy, exAssessment);
                if (real.ScientificNameId != exAssessment.EvaluatedScientificNameId)
                {
                    real.ScientificNameId = exAssessment.EvaluatedScientificNameId.Value;
                }

                if (comparisonResult.AreEqual == false)
                {
                    console.WriteLine(
                        $"Endring på doc {exAssessment.Id} {exAssessment.ExpertGroup} {exAssessment.EvaluatedScientificName} {comparisonResult.DifferencesString}");
                    real.Doc = JsonSerializer.Serialize<FA4>(exAssessment);
                }

                count++;

                if (count > batchsize)
                {
                    _database.SaveChanges();
                    count = 0;
                }
            }

            // fiks ting på vurderinger som er nye for 2023
            var notSeen = existing.Where(x => !seen.Contains(x.Key)).Select(y => y.Key).ToArray();
            foreach (var item in notSeen)
            {
                //continue;
                var real = _database.Assessments.Single(x => x.Id == item);

                // todo: overfør manglende morro
                var exAssessment = JsonSerializer.Deserialize<FA4>(real.Doc, _jsonSerializerOptions);
                var orgCopy = JsonSerializer.Deserialize<FA4>(real.Doc, _jsonSerializerOptions);

                exAssessment.ExtensionData = null;
                exAssessment.RiskAssessment.ExtensionData = null;

                orgCopy.ExtensionData = null;
                orgCopy.RiskAssessment.ExtensionData = null;

                Debug.Assert(exAssessment != null, nameof(exAssessment) + " != null");

                if (false)
                {
                    // tidligere fikser kjørt i drift
                    ImportDataServiceHelper.FixPropertiesOnNewAssessments(exAssessment);
                    ImportDataServiceHelper.FixRedlistOnExistingAssessment(exAssessment,
                        redlistByScientificNameDictionary, _taxonService);
                    ImportDataServiceHelper.TestForNaturetypeTrouble(console, exAssessment, RedList, dict, dictNin23);
                    ImportDataServiceHelper.FixZones(bioklimImport, bioklimPrevoisImport, exAssessment, real);
                }

                ImportDataServiceHelper.FixMainCategoryWhenMissing(exAssessment, migrationPathway);

                ImportDataServiceHelper.FixMisIdentified(exAssessment, misIdentifiedDataset, real);

                ImportDataServiceHelper.FixZonesOlavsArter(bioklimImport2, exAssessment, real);

                ImportDataServiceHelper.FixMissingNaturtypeName(exAssessment, dictNin23H, dict);

                ImportDataServiceHelper.FixCrazySpecies(exAssessment, CrazySpecies);

                var comparisonResult = comparer.Compare(orgCopy, exAssessment);
                if (real.ScientificNameId != exAssessment.EvaluatedScientificNameId)
                {
                    real.ScientificNameId = exAssessment.EvaluatedScientificNameId.Value;
                }

                if (comparisonResult.AreEqual == false)
                {
                    console.WriteLine(
                        $"Endring på doc {exAssessment.Id} {exAssessment.ExpertGroup} {exAssessment.EvaluatedScientificName} {comparisonResult.DifferencesString}");
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

        private static JsonSerializerOptions GetJsonSerializerOptions()
        {
            var jsonSerializerOptions = new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
            jsonSerializerOptions.Converters.Add(new BoolJsonConverter());
            jsonSerializerOptions.Converters.Add(new BoolNullableJsonConverter());
            return jsonSerializerOptions;
        }

        public void TransferData(IConsole console, string inputFolder)
        {
            var comparer = new CompareLogic(new ComparisonConfig()
            {
                IgnoreUnknownObjectTypes = true,
                TreatStringEmptyAndNullTheSame = true,
                //MaxDifferences = 50
            });

            var theCsvConfiguration = new CsvConfiguration(new CultureInfo("nb-NO"))
            {
                Delimiter = ";",
                Encoding = Encoding.UTF8
            };


            var TransferList = ImportDataServiceHelper.GetTransferDataList(inputFolder, theCsvConfiguration);
            var theseIds = TransferList.Where(x => x.ReadyToTransfer).Select(x => x.FromId)
                .Union(TransferList.Where(x => x.ReadyToTransfer).Select(x => x.ToId)).ToArray();
            var existing = _database.Assessments
                .Include(x => x.Attachments)
                .Where(x=> theseIds.Contains(x.Id))
                .ToDictionary(x => x.Id, x => x);


            foreach (var rad in TransferList.Where(x => x.ReadyToTransfer))
            {
                var fromAssessment = existing[rad.FromId];
                var from = JsonSerializer.Deserialize<FA4>(fromAssessment.Doc, _jsonSerializerOptions);
                var toAssessment = existing[rad.ToId];
                var to = JsonSerializer.Deserialize<FA4>(toAssessment.Doc, _jsonSerializerOptions);
                var orgCopy = JsonSerializer.Deserialize<FA4>(toAssessment.Doc, _jsonSerializerOptions);

                var conf = new TranferConfig
                {
                    Artsegenskaper = rad.TransferSpeciesCharacteristics,
                    Spredningsveier = rad.TransferPathways,
                    ArtsStatus = rad.TransferSpeciesStatus,
                };

                ImportDataServiceHelper.TransferAssessmentInfo(conf, from, to, fromAssessment, toAssessment);
                var comparisonResult = comparer.Compare(orgCopy, to);

                if (comparisonResult.AreEqual == false)
                {
                    console.WriteLine(
                        $"Endring på doc {to.Id} {to.ExpertGroup} {to.EvaluatedScientificName} {comparisonResult.DifferencesString}");
                    toAssessment.Doc = JsonSerializer.Serialize<FA4>(to);
                }

                _database.SaveChanges();
            }
        }

    }
}
