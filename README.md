# azf-dust-api

All calls needs an active Azure AD Token

## `/start`

Calls executes in parallel. When a call has retrieved it's data it will be saved to a MongoDB. Then there will be tests executed on the data retrieved.

When all calls are finished, tests across all retrieved data will be executed.

```json
{
  "systems": [
    "aad"
  ],
  "user": {
    "userPrincipalName": "bjarne.betjent@vtfk.no",
    "expectedType": "employee|student",
    ...userProps
  }
}
```

## `/system/{system}`

Call individual systems without updating db

### `/systems/ad`

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

### `/systems/visma`

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

### `/systems/feide`

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

### `/systems/sds`

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

### `/systems/pifu`

Get raw info for user

#### employeeNumber
```json
{
  "employeeNumber": "01010101011"
}
```

### `/systems/aad`

Get Azure Active Directory user account + authentication methods

#### userPrincipalName
```json
{
  "userPrincipalName": "bjarne.betjent@vtfk.no"
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
        "AD_EMPLOYEE_DISABLED_OU": "OU=DISABLED,OU=USERS,DC=vtfk,DC=no",
        "AD_EMPLOYEE_ENABLED_OU": "OU=USERS,DC=vtfk,DC=no",
        "AD_STUDENT_DISABLED_OU": "OU=DISABLED,OU=USERS,DC=vtfks,DC=no",
        "AD_STUDENT_ENABLED_OU": "OU=USERS,DC=vtfks,DC=no",
        "CLIENT_ID": "0000000-0000-0000-0000-000000000000",
        "CLIENT_SECRET": "ljngbølnbljkdafsbløjkadbhpiuaergpiuearwhgpuiøo",
        "DEFAULT_CALLER": "noen.andre@vtfk.no",
        "DEMO": false,
        "DEMO_SKIP_DB": false,
        "DEMO_USER": "noen.andre@vtfk.no",
        "DUST_JWT_SECRET": "Very very secret secret",
        "FEIDE_MFA_GA": "urn:mace:feide.no:auth:method:ga",
        "FEIDE_MFA_SMS": "urn:mace:feide.no:auth:method:sms",
        "FEIDE_PRINCIPAL_NAME": "@vtfk.no",
        "FEIDE_ORGANIZATION_DN": "O=Vestfold og Telemark fylkeskommune,DC=vtfk,DC=no",
        "GRAPH_USER_PROPERTIES": "accountEnabled,assignedLicenses,birthday,businessPhones,companyName,createdDateTime,deletedDateTime,department,displayName,givenName,jobTitle,lastPasswordChangeDateTime,mail,mobilePhone,onPremisesDistinguishedName,onPremisesExtensionAttributes,onPremisesLastSyncDateTime,onPremisesProvisioningErrors,onPremisesSamAccountName,onPremisesSyncEnabled,proxyAddresses,signInSessionsValidFromDateTime,surname,userPrincipalName",
        "MONGODB_CONNECTION": "mongodb+srv://<user>:<password>@cluster0.jlu5j.azure.mongodb.net?retryWrites=true&w=majority",
        "MONGODB_COLLECTION": "collection",
        "MONGODB_COLLECTION_USERS": "user-collection",
        "MONGODB_NAME": "db",
        "PAPERTRAIL_HOST": "papertrail-log-url",
        "PAPERTRAIL_PORT": 100,
        "PAPERTRAIL_HOSTNAME": "hostname",
        "PAPERTRAIL_DISABLE_LOGGING": true,
        "PIFU_MEMBERSHIP_EMPLOYEE_ROLETYPE": "02",
        "PIFU_MEMBERSHIP_STUDENT_ROLETYPE": "01",
        "PIFU_PERSON_EMPLOYEE_TYPE": "workforceID",
        "PIFU_PERSON_STUDENT_TYPE": "studentID",
        "RETRY_WAIT": 10000,
        "SCRIPT_SERVICE_URL": "https://localhost/dust/invoke",
        "SOURCE_DATA_SYSTEMS": "ad,pifu,visma",
        "STATUS_ENDPOINT": "status",
        "STATUS_URL": "http://localhost:7071/api",
        "VISMA_COMPANY_ID": "1",
        "VISMA_CATEGORIES": "O,SE,TK,X,XA,XB,FW",
        "NODE_ENV": "production"
      },
      "Host": {
        "CORS": "*"
      }
    }
    ```
1. Create a new Azure Function in [Azure portal](https://portal.azure.com)
1. Copy `AzureWebJobsStorage` setting from *Configuration* and update `local.settings.json`
    - **When debugging function locally, Azure Function should not be running. This to avoid collision between who will process the requests put in StorageAccount**
1. Create a new `Enterprise application`
    1. Copy `CLIENT_ID` and update `local.settings.json`
    1. Copy `CLIENT_SECRET` and update `local.settings.json`
1. Create a database in Mongo and update `local.settings.json`
1. npm i
1. func start
