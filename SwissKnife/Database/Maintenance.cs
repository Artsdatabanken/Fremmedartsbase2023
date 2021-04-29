using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using McMaster.Extensions.CommandLineUtils;
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
            var jsonSerializerOptions = new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };
            _database.Database.EnsureCreated();
            var batchsize = 50;
            var count = 0;
            IEnumerable<Prod.Domain.Legacy.FA3Legacy> assessments = GetAssessments(inputFolder);
            foreach (var assessment in assessments)
            {
                var entity = new Assessment {Doc = JsonSerializer.Serialize(assessment, jsonSerializerOptions)};
                _database.Assessments.Add(entity);
                count++;
                if (count>batchsize)
                {
                    _database.SaveChanges();
                    count = 0;
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
    }
}
