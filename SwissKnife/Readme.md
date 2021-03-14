# Fremmedartsbase SwissKnife

Tool for batchtasks, import, export and similar stuff.

dotnet run:

```
Toolkit for Alien species db

Usage: SwissKnife [command] [options]

Options:
  -?|-h|--help  Show help information.

Commands:
  oldDb         Interact with old 2018 RavenDb instance

Run 'SwissKnife [command] -?|-h|--help' for more information about a command.
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
done...```
