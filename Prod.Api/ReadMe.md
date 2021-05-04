# Prod.APi




## Configuration - local

run inside project folder prod api
```
dotnet user-secrets init
```

set database connection string
```
dotnet user-secrets set "FabDatabase" "Server=localhost;Database=FAB2023;Integrated Security=true;MultipleActiveResultSets=true"
```

set AuthAuthority
```
dotnet user-secrets set "AuthAuthority" "https://demo.identityserver.io"
```

