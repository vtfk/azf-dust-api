# azf-dust-api

All calls needs an active Azure AD Token

## `/report`

Calls executes in parallel. When a call has retrieved it's data it will be saved to a MongoDB. Then there will be tests executed on the data retrieved.

When all calls are finished, tests across all retrieved data will be executed.

```json
{
  "systems": [
    "aad",
    "ad",
    "feide",
    "sds",
    "sync",
    "vis",
    "visma",
    "equitrac",
    "vigoot",
    "vigolaerling
  ],
  "user": {
    "userPrincipalName": "bjarne.betjent@vtfk.no", // can also be "displayName", "samAccountName" or "employeeNumber"
    "expectedType": "employee|student",
    ...userProps
  }
}
```

## `/search?q=searchString&top=5`

Search for cached users in db

**q** : What to search for

**top** *(optional)* : Search limit

## `/system/{system}`

Call individual systems without updating db

### `/system/ad`

Get OnPremises Active Directory user account

#### displayName (properties is optional)
```json
{
  "displayName": "Bjarne Betjent",
  "domain": "login|skole",
  "properties": [
    "title",
    "memberOf",
    "employeeNumber"
  ]
}
```

#### userPrincipalName (properties is optional)
```json
{
  "userPrincipalName": "bjarne.betjent@vtfk.no",
  "domain": "login|skole",
  "properties": [
    "title",
    "memberOf",
    "employeeNumber"
  ]
}
```

#### empoloyeeNumber (properties is optional)
```json
{
  "employeeNumber": "01010101011",
  "domain": "login|skole",
  "properties": [
    "title",
    "memberOf",
    "employeeNumber"
  ]
}
```

#### samAccountName (properties is optional)
```json
{
  "samAccountName": "bja0101",
  "domain": "login|skole",
  "properties": [
    "title",
    "memberOf",
    "employeeNumber"
  ]
}
```

### `/system/visma`

Get Visma HRM user account

#### givenName and surName
```json
{
  "givenName": "Bjarne",
  "surName": "Betjent"
}
```

#### employeeNumber
```json
{
  "employeeNumber": "01010101011"
}
```

### `/system/feide`

Get OnPremises FEIDE user account

#### displayName
```json
{
  "displayName": "Bjarne Betjent"
}
```

#### userPrincipalName
```json
{
  "userPrincipalName": "bjarne.betjent@vtfk.no"
}
```

#### empoloyeeNumber
```json
{
  "employeeNumber": "01010101011"
}
```

#### samAccountName
```json
{
  "samAccountName": "bja0101"
}
```

### `/system/sds`

Get person object(s) and membership(s) for user account

#### samAccountName
```json
{
  "samAccountName": "bja0101",
  "type": "Student|Teacher"
}
```

#### userPrincipalName
```json
{
  "userPrincipalName": "bjarne.betjent@vtfk.no",
  "type": "Student|Teacher"
}
```

### `/system/vis`

Get user info from school source system. Will also get user info from [PIFU](https://github.com/vtfk/azf-pifu-api) to match data together

#### employeeNumber
```json
{
  "employeeNumber": "01010101011"
}
```

### `/system/sync`

Get info about last synchronization timestamps

### `/system/aad`

Get Azure Active Directory user account + authentication methods

#### userPrincipalName
```json
{
  "userPrincipalName": "bjarne.betjent@vtfk.no"
}
```

### `/system/equitrac`

Get info for user from Equitrac.

If account were locked, it will be unlocked and info returned will reflect this

#### samAccountName
```json
{
  "samAccountName": "bja0101"
}
```

### `/system/vigoot`

Get user info from VIGO OT

#### employeeNumber and title
```json
{
  "employeeNumber": "01010101011",
  "title": "Elev OT"
}
```

### `/system/vigolaerling`

Get user info from VIGO Opplæring (Lærling)

#### employeeNumber and title
```json
{
  "employeeNumber": "01010101011",
  "title": "Lærling"
}
```

## Local development

1. Create a `local.settings.json`
    ```json
    {
      "IsEncrypted": false,
      "Values": {
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "AzureWebJobsStorage": "UseDevelopmentStorage=true",
        "AD_AUTO_USERS": "OU=AUTO USERS",
        "AD_AUTO_DISABLED_USERS": "OU=AUTO DISABLED USERS",
        "CLIENT_ID": "0000000-0000-0000-0000-000000000000",
        "CLIENT_SECRET": "ljngbølnbljkdafsbløjkadbhpiuaergpiuearwhgpuiøo",
        "DEFAULT_CALLER": "noen.andre@vtfk.no",
        "DEMO": false,
        "DEMO_SKIP_DB": false,
        "DEMO_USER": "noen.andre@vtfk.no",
        "DUST_JWT_SECRET": "Very very secret secret",
        "FEIDE_MFA_AAD": "urn:mace:feide.no:auth:method:azuread",
        "FEIDE_MFA_GA": "urn:mace:feide.no:auth:method:ga",
        "FEIDE_MFA_SMS": "urn:mace:feide.no:auth:method:sms",
        "FEIDE_PRINCIPAL_NAME": "@vtfk.no",
        "FEIDE_ORGANIZATION_DN": "O=Vestfold og Telemark fylkeskommune,DC=vtfk,DC=no",
        "FINT_API_URL": "https://fint.dev/api",
        "FINT_BETA": false,
        "FINT_JWT_SECRET": "Very very secret secret",
        "FINT_TIMEOUT": 10000,
        "GRAPH_USER_PROPERTIES": "accountEnabled,assignedLicenses,birthday,businessPhones,companyName,createdDateTime,deletedDateTime,department,displayName,givenName,jobTitle,lastPasswordChangeDateTime,mail,mobilePhone,onPremisesDistinguishedName,onPremisesExtensionAttributes,onPremisesLastSyncDateTime,onPremisesProvisioningErrors,onPremisesSamAccountName,onPremisesSyncEnabled,proxyAddresses,signInSessionsValidFromDateTime,surname,userPrincipalName",
        "MONGODB_CONNECTION": "mongodb+srv://<user>:<password>@cluster0.jlu5j.azure.mongodb.net?retryWrites=true&w=majority",
        "MONGODB_COLLECTION": "collection",
        "MONGODB_COLLECTION_SDS": "sds-collection",
        "MONGODB_COLLECTION_USERS": "user-collection",
        "MONGODB_NAME": "db",
        "MONGODB_NAME_SDS": "sds-db",
        "PAPERTRAIL_HOST": "https://logs.collector.solarwinds.com/v1/log",
        "PAPERTRAIL_TOKEN": "secret token",
        "PAPERTRAIL_DISABLE_LOGGING": true,
        "PIFU_URL": "https://pifu.dev/api",
        "PIFU_JWT_SECRET": "Very very secret secret",
        "RETRY_WAIT": 3000,
        "SCRIPT_SERVICE_URL": "https://localhost/dust/invoke",
        "SOURCE_DATA_SYSTEMS": "ad,vis,visma",
        "STATUS_ENDPOINT": "report",
        "STATUS_URL": "http://localhost:7071/api",
        "USER_SEARCH_LIMIT": 10,
        "NODE_ENV": "production"
      },
      "Host": {
        "CORS": "*"
      }
    }
    ```
1. Run `npm i`
1. Create a new Azure Function in [Azure portal](https://portal.azure.com)
1. Copy `AzureWebJobsStorage` setting from *Configuration* and update `local.settings.json`
    - **When debugging function locally, Azure Function should not be running. This to avoid collision between who will process the requests put in StorageAccount**
1. Create a new `Enterprise application`
    1. Copy `CLIENT_ID` and update `local.settings.json`
    1. Copy `CLIENT_SECRET` and update `local.settings.json`
1. Create a database in Mongo and update `local.settings.json`
1. func start
