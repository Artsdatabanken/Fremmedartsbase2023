# Fremmedartsbase SwissKnife

Tool for batchtasks, import, export and similar stuff.

dotnet run:

```
Usage: SwissKnife [command] [options]

Options:
  -?|-h|--help  Show help information.

Commands:
  newDb         Interact with old 2018 RavenDb instance
  oldDb         Interact with old 2018 RavenDb instance

Run 'SwissKnife [command] -?|-h|--help' for more information about a command.
```


Info / statistics from old db
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
