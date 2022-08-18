# Fremmedartsbase SwissKnife

Tool for batchtasks, import, export and similar stuff.

dotnet run:

```
Toolkit for Alien species db

Usage: SwissKnife [command] [options]

Options:
  -?|-h|--help  Show help information.

Commands:
  createjson    Run tasks for creating static json data files
  maintenance   Run tasks for maintaining database
  newDb         Interact with new sql database instance
  oldDb         Interact with old 2018 RavenDb instance

Run 'SwissKnife [command] -?|-h|--help' for more information about a command.
```


Info / statistics from old db
```

```

```
dotnet run -- olddb info --url http://localhost:8080 --db fab3 --fs fab3fs
Livsmedium:
Found 1 item of Livsmedium
Koder:
Found 1 item of Koder
KodeGrupper:
Found 1 item of KodeGrupper
MigrationPathwayCode:
Found 1 item of MigrationPathwayCode
RedlistedNaturetypeGroup:
Found 1 item of RedlistedNaturetypeGroup
Fab2018:
Found 3204 item of Fab2018
Fab2018Files:
Found 2537 item of Fab2018Files
```


Dump content from 2018 Database into folder for data exchange in json format:
```
dotnet run -- olddb dump --url http://localhost:8080 --db fab3 --fs fab3fs --outputfolder ./Dump
Dumping content of old db to folder:C:\Users\sah\Source\Repos\Artsdatabanken\Fremmedartsbase2023\SwissKnife\Dump
Dumped 1 items to file Codes.json
Dumped 1 items to file Livsmedium.json
Dumped 1 items to file KodeGrupper.json
Dumped 1 items to file MigrationPathwayCode.json
Dumped 1 items to file RedlistedNaturetypeGroups.json
Dumped 3204 items to file Fa3.json
done...
```

Import content from 2018 Dump into new database:
```
dotnet run -- newdb import --connectionstring "Server=localhost;Database=FAB20233;Integrated Security=true;MultipleActiveResultSets=true" --inputfolder ./Dump
```

Do taxonomy wash
```
dotnet run -- maintenance taxonomywash --connectionstring "Server=localhost;Database=FAB2023;Integrated Security=true;MultipleActiveResultSets=true"
```


Fill empty database and import two new files:
```
dotnet run -- newdb import --connectionstring "Server=localhost;Database=FAB2023;Integrated Security=true;MultipleActiveResultSets=true" --inputfolder ./Dump

dotnet run -- maintenance importnames --connectionstring "Server=localhost;Database=FAB2023;Integrated Security=true;MultipleActiveResultSets=true" --speciesgroup "Alger" --csvfile ./Importfiler/Alger.txt
dotnet run -- maintenance importnames --connectionstring "Server=localhost;Database=FAB2023;Integrated Security=true;MultipleActiveResultSets=true" --speciesgroup "Terrestriske invertebrater" --csvfile ./Importfiler/TerrestriskeInvertebrater.txt


```


## Maintenance
```
dotnet run -- maintenance --help

Run tasks for maintaining database

Usage: SwissKnife maintenance [command] [options]

Options:
  --help          Show help information.

Commands:
  importnames     Import and create assessments from names
  patchmigration  Patch migrated assessments from original json dump
  taxonomywash    Check and update taxonomy on assessments


dotnet run -- maintenance patchmigration --connectionstring "Server=localhost;Database=fab4;Integrated Security=true;MultipleActiveResultSets=true" --inputfolder ./Dump

dotnet run -- maintenance nighttasks --connectionstring "Server=localhost;Database=fab4;Integrated Security=true;MultipleActiveResultSets=true"
```


### import av horisontscannende karplanter
```
dotnet run -- maintenance importhsdata --connectionstring "Server=localhost;Database=fab4;Integrated Security=true;MultipleActiveResultSets=true" --csvfile ./Importfiler/Karplanter_til_Horisontskanning_20220107_til_FAB.csv
dotnet run -- maintenance taxonomywashdirect --connectionstring "Server=localhost;Database=fab4;Integrated Security=true;MultipleActiveResultSets=true" --speciesgroup "Fugler"
```

### Overføre vurderinger fra horisontscanning til full vurdering
```
dotnet run -- maintenance transferfromhs --connectionstring "Server=localhost;Database=fab4;Integrated Security=true;MultipleActiveResultSets=true"
```