using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using McMaster.Extensions.CommandLineUtils;
using Prod.Domain;
using Prod.Domain.Legacy;
using Raven.Client;
using Raven.Client.Connection;
using Raven.Client.Document;
using MigrationPathwayCode = Prod.Domain.MigrationPathwayCode;

namespace SwissKnife.Fab2018
{
    internal class Fab2018
    {
        private readonly IDocumentStore _store;

        public Fab2018(string ravenDbUrl, string fab2018Db, string fab2018Dfs)
        {
            _store = new DocumentStore
            {
                Url = ravenDbUrl,
                DefaultDatabase = fab2018Db
            }.Initialize();
        }


        public void Info(IConsole console)
        {
            console.WriteLine("Livsmedium");
            var all = GetLivsmedium();
            foreach (var livsmedium in all) console.WriteLine(livsmedium.Id);

            console.WriteLine("Koder");

            var codes = GetCodes();
            foreach (var code in codes) console.WriteLine(code.Id);
        }

        public void Dump(IConsole console, string outputFolder)
        {
            var dir = Directory.CreateDirectory(outputFolder);
            var path = dir.FullName;

            console.WriteLine($"Dumping content of old db to folder:{path}");

            console.WriteLine(DumpToJsonFile(path, "Codes.json", GetCodes()));
            console.WriteLine(DumpToJsonFile(path, "Livsmedium.json", GetLivsmedium()));
            console.WriteLine(DumpToJsonFile(path, "KodeGrupper.json", GetKodeGrupper()));
            console.WriteLine(DumpToJsonFile(path, "MigrationPathwayCode.json", GetMigrationPathwayCode()));
            console.WriteLine(DumpToJsonFile(path, "RedlistedNaturetypeGroups.json", GetRedlistedNaturetypeGroups()));
            console.WriteLine(DumpToJsonFile(path, "Fa3.json", GetFab2018()));

            console.WriteLine("done...");
        }

        private static string DumpToJsonFile(string path, string file, IEnumerable<object> items)
        {
            var count = 0;
            var jsonSerializerOptions = new JsonSerializerOptions
            {
                //WriteIndented = true, 
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };
            using var writer = File.CreateText(path + "\\" + file);
            foreach (var item in items)
            {
                count++;
                writer.WriteLine(JsonSerializer.Serialize(item, jsonSerializerOptions));
            }

            return $"Dumped {count} items to file {file}";
        }

        private IEnumerable<Code> GetCodes()
        {
            using var session = _store.OpenSession();
            return session.Query<Code>().AsEnumerable();
        }

        private IEnumerable<Livsmedium> GetLivsmedium()
        {
            using var session = _store.OpenSession();
            return session.Query<Livsmedium>().AsEnumerable();
        }

        private IEnumerable<KodeGrupper> GetKodeGrupper()
        {
            using var session = _store.OpenSession();
            return session.Query<KodeGrupper>().AsEnumerable();
        }

        private IEnumerable<MigrationPathwayCode> GetMigrationPathwayCode()
        {
            using var session = _store.OpenSession();
            return session.Query<MigrationPathwayCode>().AsEnumerable();
        }

        private IEnumerable<RedlistedNaturetypeGroups> GetRedlistedNaturetypeGroups()
        {
            using var session = _store.OpenSession();
            var item = session.Load<RedlistedNaturetypeGroups>(
                "RedlistedNaturetypesNB"); // strange error in naming convention
            return new[] {item};
            //return session.Query<Prod.Domain.RedlistedNaturetypeGroups>().AsEnumerable();
        }

        private IEnumerable<FA3Legacy> GetFab2018()
        {
            using var session = _store.OpenSession();

            var enumerator = _store.DatabaseCommands.StreamDocs(null, "FA3/");

            var documentConvention = new DocumentConvention();
            while (enumerator.MoveNext())
            {
                var document = enumerator.Current;
                if (document != null)
                {
                    document.TryGetValue("@metadata", out var item2);
                    var fa3LegacyId = item2.Value<string>("@id");
                    if (fa3LegacyId.Contains("revision")) continue;
                    var fa3Legacy = document.Deserialize<FA3Legacy>(documentConvention);
                    fa3Legacy.Id = fa3LegacyId;
                    yield return fa3Legacy;
                }
            }
        }
    }
}