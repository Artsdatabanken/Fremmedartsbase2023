# Prod.APi




## Configuration - local

Run inside project folder prod api
```
dotnet user-secrets init
```

Set database connection string - and authentication authority 
```
dotnet user-secrets set "FabDatabase" "Server=localhost;Database=FAB2023;Integrated Security=true;MultipleActiveResultSets=true"
dotnet user-secrets set "AuthAuthority" "https://demo.identityserver.io"
```

Set config for ReferenceApi
```
dotnet user-secrets set "ReferenceApiAuthAuthority" "https://demo.identityserver.io"
dotnet user-secrets set "ReferenceApiEndPoint" "https://referenceApiUrl.no/"
dotnet user-secrets set "ReferenceApiClientSecret" "test-secret"
dotnet user-secrets set "ReferenceApiScope" "api"
dotnet user-secrets set "ReferenceApiClientId" "redlistapi"
```
