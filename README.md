# dust-api

All calls needs an active Azure AD Token

## `/systems/ad`

Get OnPremises Active Directory user account

### displayName (properties is optional)
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

### userPrincipalName (properties is optional)
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

### empoloyeeNumber (properties is optional)
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

### samAccountName (properties is optional)
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

## `/systems/visma`

Get Visma HRM user account

### firstName and lastName
```json
{
	"firstName": "Bjarne",
	"lastName": "Betjent"
}
```

### employeeNumber
```json
{
	"employeeNumber": "01010101011"
}
```

## `/systems/feide`

Get OnPremises FEIDE user account

### samAccountName
```json
{
	"samAccountName": "bja0101"
}
```

## `/systems/sds`

Get person object(s) and membership(s) for user account

### samAccountName
```json
{
	"samAccountName": "bja0101",
	"type": "Student|Teacher"
}
```

### userPrincipalName
```json
{
	"userPrincipalName": "bjarne.betjent@vtfk.no",
	"type": "Student|Teacher"
}
```

## `/systems/pifu`

Get raw info for user

### employeeNumber
```json
{
	"employeeNumber": "01010101011"
}
```

## `/systems/aad`

Get Azure Active Directory user account

### userPrincipalName
```json
{
	"query": "users",
	"userPrincipalName": "bjarne.betjent@vtfk.no"
}
```
