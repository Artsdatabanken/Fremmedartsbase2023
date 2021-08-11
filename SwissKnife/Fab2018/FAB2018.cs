using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using McMaster.Extensions.CommandLineUtils;
using Prod.Domain;
using Prod.Domain.Legacy;
using Raven.Abstractions.FileSystem;
using Raven.Client;
using Raven.Client.Connection;
using Raven.Client.Document;
using Raven.Client.FileSystem;
using Code = Prod.Domain.Legacy.Code;
using KodeGrupper = Prod.Domain.Legacy.KodeGrupper;
using MigrationPathwayCode = Prod.Domain.MigrationPathwayCode;

namespace SwissKnife.Fab2018
{
    internal class Fab2018
    {
        private readonly IFilesStore _fileStore;
        private readonly IDocumentStore _store;

        public Fab2018(string ravenDbUrl, string fab2018Db, string fab2018Dfs)
        {
            _store = new DocumentStore
            {
                Url = ravenDbUrl,
                DefaultDatabase = fab2018Db
            }.Initialize();

            if (!string.IsNullOrWhiteSpace(fab2018Dfs))
                _fileStore = new FilesStore
                {
                    Url = ravenDbUrl,
                    DefaultFileSystem = fab2018Dfs
                }.Initialize();
        }


        public void Info(IConsole console, bool verbose)
        {
            InfoFor(console, verbose, "Livsmedium", GetLivsmedium());
            InfoFor(console, verbose, "Koder", GetCodes());
            InfoFor(console, verbose, "KodeGrupper", GetKodeGrupper());
            InfoFor(console, verbose, "MigrationPathwayCode", GetMigrationPathwayCode());
            InfoFor(console, verbose, "RedlistedNaturetypeGroup", GetRedlistedNaturetypeGroups());
            InfoFor(console, verbose, "Fab2018", GetFab2018());

            InfoForFiles(console, verbose, "Fab2018Files", GetFab2018Files());
            InfoFor(console, verbose, "Brukere", GetUsers());
        }

        private void InfoForFiles(IConsole console, bool verbose, string s, IEnumerable<FileHeader> all)
        {
            console.WriteLine(s + ":");

            var count = 0;
            foreach (var fileHeader in all)
            {
                count++;
                if (verbose) console.WriteLine(fileHeader.FullPath);
            }

            console.WriteLine($"Found {count} item of {s}");
            if (verbose)
                // extra line
                console.WriteLine("");
        }

        private static void InfoFor(IConsole console, bool verbose, string s, IEnumerable<object> all)
        {
            var jsonSerializerOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };
            console.WriteLine(s + ":");

            var count = 0;

            foreach (var item in all)
            {
                count++;
                if (verbose)
                    // dump json
                    console.WriteLine(JsonSerializer.Serialize(item, jsonSerializerOptions));
            }

            console.WriteLine($"Found {count} item of {s}");
            if (verbose)
                // extra line
                console.WriteLine("");
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
            console.WriteLine(DumpFiles(path, GetFab2018Files()));
            console.WriteLine(DumpToJsonFile(path, "Brukere.json", GetUsers()));
            console.WriteLine("done...");
        }

        private string DumpFiles(string path, IEnumerable<FileHeader> items)
        {
            var count = 0;
            var allItems = items.ToArray();
            foreach (var item in allItems)
            {
                count++;
                var dest = path + "\\Files\\" + item.FullPath.Replace("/", "\\");

                using (var sess = _fileStore.OpenAsyncSession())
                {
                    var file =
                        sess.DownloadAsync(item).Result;
                    Directory.CreateDirectory(path + "\\Files\\" + item.Directory.Replace("/", "\\"));
                    using (var fileStream = File.Create(dest))
                    {
                        //file.Seek(0, SeekOrigin.Begin);
                        file.CopyTo(fileStream);
                    }

                    //WriteToFile(file, dest);
                }
            }

            return $"Dumped {count} files";
        }

        public static void WriteToFile(Stream stream, string destinationFile, int bufferSize = 4096,
            FileMode mode = FileMode.OpenOrCreate, FileAccess access = FileAccess.ReadWrite,
            FileShare share = FileShare.ReadWrite)
        {
            using (var destinationFileStream = new FileStream(destinationFile, mode, access, share))
            {
                //while (stream.Position < stream.Length)
                //{
                destinationFileStream.WriteByte((byte) stream.ReadByte());
                destinationFileStream.Flush();
                //}
            }
        }

        /// <summary>
        ///     Copies the contents of input to output. Doesn't close either stream.
        /// </summary>
        public static void CopyStream(Stream input, Stream output)
        {
            var buffer = new byte[8 * 1024];
            int len;
            while ((len = input.Read(buffer, 0, buffer.Length)) > 0) output.Write(buffer, 0, len);
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
        private IEnumerable<Bruker> GetUsers()
        {
            using var session = _store.OpenSession();
            return session.Query<Bruker>().AsEnumerable();
        }

        private IEnumerable<Livsmedium> GetLivsmedium()
        {
            using var session = _store.OpenSession();
            return session.Query<Livsmedium>().AsEnumerable();
        }

        private IEnumerable<KodeGrupper> GetKodeGrupper()
        {
            using var session = _store.OpenSession();
            return session.Query<KodeGrupper>().ProjectFromIndexFieldsInto<KodeGrupper>().AsEnumerable();
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

        private IEnumerable<FileHeader> GetFab2018Files()
        {
            using var session = _fileStore.OpenAsyncSession();

            var enumerator = session.Commands.StreamQueryAsync("").Result;

            while (enumerator.MoveNextAsync().Result)
            {
                var document = enumerator.Current;
                if (document != null) yield return document;
            }
        }
    }
}