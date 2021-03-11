Bygge api og dytte ut:
PS C:\Users\stein\source\repos\Artsdatabanken\Rodliste2019> 
docker build --tag artsdatabanken/rl2019api:latest -f "Prod.Api/Dockerfile" .
docker push artsdatabanken/rl2019api:latest

rem: Installere RavenDB .net core client: (Packet manager console) Install-Package RavenDB.Client -Version 4.1.1
