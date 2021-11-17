using System.ComponentModel.DataAnnotations;
using System.Globalization;
using McMaster.Extensions.CommandLineUtils;
using SwissKnife.Database;

namespace SwissKnife
{
    [Command(Name = "SwissKnife", Description = "Toolkit for Alien species db")]
    [Subcommand(typeof(OldDb), typeof(NewDb), typeof(Maintenance))]
    internal class Program
    {
        public static int Main(string[] args)
        {
            var culture = new CultureInfo("nb-NO");
            CultureInfo.DefaultThreadCurrentCulture = culture;
            CultureInfo.DefaultThreadCurrentUICulture = culture;

            return CommandLineApplication.Execute<Program>(args);
        }

        private int OnExecute(CommandLineApplication app, IConsole console)
        {
            console.WriteLine("You must specify at a command.");
            app.ShowHelp();
            return 1;
        }

        [Command("maintenance", Description = "Run tasks for maintaining database")]
        [Subcommand(typeof(TaxonomyWash), typeof(ImportNames))]
        [HelpOption("--help")]
        internal class Maintenance {
            private int OnExecute(IConsole console)
            {
                console.Error.WriteLine("You must specify an action. See --help for more details.");
                return 1;
            }

            internal class MaintananceBase
            {
                [Option("--connectionstring", Description = "connectionstring to database to establish and load data into")]
                [Required]
                public string ConnectionString { get; }

            }

            [Command("taxonomywash", Description = "Check and update taxonomy on assessments")]
            internal class TaxonomyWash : MaintananceBase
            {
                private void OnExecute(IConsole console)
                {
                    Database.MaintenanceService.RunTaxonomyWash(new Prod.Data.EFCore.SqlServerProdDbContext(ConnectionString));
                }
            }

            [Command("importnames", Description = "Import and create assessments from names")]
            internal class ImportNames : MaintananceBase
            {
                [Option("--speciesgroup", Description = "SpeciesGroup to put assessments in")]
                [Required]
                public string SpeciesGroup { get; }

                [Option("--csvfile", Description = "CvsFile with path")]
                [Required]
                public string InputFolder { get; }
                private void OnExecute(IConsole console)
                {
                    Database.MaintenanceService.RunImportNewAssessments(new Prod.Data.EFCore.SqlServerProdDbContext(ConnectionString), SpeciesGroup, InputFolder);
                }
            }
        }

        [Command("oldDb", Description = "Interact with old 2018 RavenDb instance")]
        [Subcommand(typeof(Info), typeof(Dump))]
        [HelpOption("--help")]
        internal class OldDb
        {
            private int OnExecute(IConsole console)
            {
                console.Error.WriteLine("You must specify an action. See --help for more details.");
                return 1;
            }

            internal class OldDbBase
            {
                [Option("--url", Description = "Url to RavenDb Instance")]
                [Required]
                public string RavenDbUrl { get; }

                [Option("--db", Description = "Fab2018 db instance")]
                [Required]
                public string Fab2018Db { get; }

                [Option("--fs", Description = "Fab2018 fs instance")]
                public string Fab2018Dfs { get; }
            }

            [Command("info", Description = "show some statistics from db")]
            internal class Info : OldDbBase
            {
                [Option("--verbose", Description = "verbose show content")]
                public bool Verbose { get; }

                private void OnExecute(IConsole console)
                {
                    var oldDbService = new Fab2018.Fab2018Service(RavenDbUrl, Fab2018Db, Fab2018Dfs);
                    oldDbService.Info(console, Verbose);
                }
            }

            [Command("dump", Description = "dump content from db to json files",
                ExtendedHelpText =
                    "Sample : olddb dump --url http://localhost:8080 --db fab3 --fs fab3fs --outputfolder ../../../dump")]
            internal class Dump : OldDbBase
            {
                [Option("--outputfolder", Description = "folder to dump output json files in")]
                [Required]
                public string OutputFolder { get; }

                private void OnExecute(IConsole console)
                {
                    var oldDbService = new Fab2018.Fab2018Service(RavenDbUrl, Fab2018Db, Fab2018Dfs);
                    oldDbService.Dump(console, OutputFolder);
                }
            }
        }

        [Command("newDb", Description = "Interact with old 2018 RavenDb instance")]
        [Subcommand(typeof(Import))]
        [HelpOption("--help")]
        internal class NewDb
        {
            private int OnExecute(IConsole console)
            {
                console.Error.WriteLine("You must specify an action. See --help for more details.");
                return 1;
            }
            [Command("import", Description = "import from json files",
                ExtendedHelpText =
                    "Sample : newDb import --connectionstring 'constring'  --inputfolder ../../../dump")]
            internal class Import
            {
                [Option("--connectionstring", Description = "connectionstring to database to establish and load data into")]
                [Required]
                public string ConnectionString { get; }

                [Option("--inputfolder", Description = "folder to read json file source and files from")]
                [Required]
                public string InputFolder { get; }

                private void OnExecute(IConsole console)
                {
                    var maintenance = new Database.ImportDataService(ConnectionString);
                    maintenance.Import(console, InputFolder);
                    Database.MaintenanceService.RunTaxonomyWash(new Prod.Data.EFCore.SqlServerProdDbContext(ConnectionString), true);
                }
            }
        }

        [Command("createjson", Description = "Run tasks for creating static json data files")]
        [Subcommand(typeof(TruedeOgSjeldneNaturtyper))]
        [HelpOption("--help")]
        internal class CreateJSON
        {
            private int OnExecute(IConsole console)
            {
                console.Error.WriteLine("You must specify an action. See --help for more details.");
                return 1;
            }

            internal class TruedeOgSjeldneNaturtyper
            {
                [Option("--truedeogsjeldnenaturtyper", Description = "Generate JSON file for truete og sjeldne naturtyper 2018")]
                [Required]
                public string outputFilename { get; }
                private void OnExecute(IConsole console)
                {
                    const string outputdefaultfilename = "../../Prod.web/src/TrueteOgSjeldneNaturtyper2018.json";
                    const string ifn = "../Importfiler/TrueteOgSjeldneNaturtyper2018.txt";
                    string ofn = string.IsNullOrEmpty(outputFilename) ? outputdefaultfilename : outputFilename;
                    Convert2JSONService.ConvertTruedeOgSjeldneNaturtyper2JSON(ifn, ofn);
                }
            }
        }
    }
}