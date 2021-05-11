#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80
RUN sed -i 's/DEFAULT@SECLEVEL=2/DEFAULT@SECLEVEL=1/g' /etc/ssl/openssl.cnf
RUN sed -i 's/DEFAULT@SECLEVEL=2/DEFAULT@SECLEVEL=1/g' /usr/lib/ssl/openssl.cnf
ENV ConnectionStrings__Artsnavnebase2ConnectionString="Data Source = host.docker.internal; Initial Catalog = fab2023; Persist Security Info = True; User ID = fabbase; Password = notapassword; Connection Timeout = 150;"
ENV AuthAuthority="https://demo.identityserver.io"

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["Prod.Api/Prod.Api.csproj", "Prod.Api/"]
COPY ["Prod.Domain/Prod.Domain.csproj", "Prod.Domain/"]
COPY ["Prod.Data.EFCore/Prod.Data.EFCore.csproj", "Prod.Data.EFCore/"]
RUN dotnet restore "Prod.Api/Prod.Api.csproj"
COPY . .
WORKDIR "/src/Prod.Api"
RUN dotnet build "Prod.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Prod.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
#COPY ["sandbox/angular-test-artsnavnebase/dist/angular-test-artsnavnebase/", "Frontend/"]
ENV ASPNETCORE_URLS="http://+:3001"
RUN groupadd -r --gid 1007 dockerrunner && useradd -r -g dockerrunner dockerrunner
USER dockerrunner
EXPOSE 3001
ENTRYPOINT ["dotnet", "Prod.Api.dll"]