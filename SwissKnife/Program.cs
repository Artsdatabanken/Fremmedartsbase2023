using System.ComponentModel.DataAnnotations;
using McMaster.Extensions.CommandLineUtils;

namespace SwissKnife
{
    [Command(Name = "SwissKnife", Description = "Toolkit for Alien species db")]
    [Subcommand(typeof(OldDb), typeof(NewDb))]
    internal class Program
    {
        public static int Main(string[] args)
        {
            return CommandLineApplication.Execute<Program>(args);
        }

        private int OnExecute(CommandLineApplication app, IConsole console)
        {
            console.WriteLine("You must specify at a command.");
            app.ShowHelp();
            return 1;
        }

        [Command("oldDb", Description = "Interact with old 2018 RavenDb instance")]
        [Subcommand(typeof(Info), typeof(Dump))]
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
                    var oldDbService = new Fab2018.Fab2018(RavenDbUrl, Fab2018Db, Fab2018Dfs);
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
                    var oldDbService = new Fab2018.Fab2018(RavenDbUrl, Fab2018Db, Fab2018Dfs);
                    oldDbService.Dump(console, OutputFolder);
                }
            }
        }

        [Command("newDb", Description = "Interact with old 2018 RavenDb instance")]
        [Subcommand(typeof(Import))]
        internal class NewDb
        {
            private int OnExecute(IConsole console)
            {
                console.Error.WriteLine("You must specify an action. See --help for more details.");
                return 1;
            }
            [Command("import", Description = "import from json files",
                ExtendedHelpText =
                    "Sample : olddb import --connectionstring 'constring'  --inputfolder ../../../dump")]
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
                    var maintenance = new Database.Maintenance(ConnectionString);
                    maintenance.Import(console, InputFolder);
                }
            }
        }
    }
}