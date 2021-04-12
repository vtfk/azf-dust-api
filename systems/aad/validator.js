const { test, success, error, warn, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isPwdLastSet = require('../../lib/helpers/is-pwd-within-timerange')
const getActiveSourceData = require('../../lib/helpers/get-active-source-data')
const licenses = require('../data/licenses.json')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('aad-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent && !allData) return waitForData()
    else if (!dataPresent && allData && !allData.ad) return success('Data mangler grunnet ingen data i AD')
    else if (!dataPresent && allData && allData.ad) return error('Mangler data 😬', systemData)
    return dataPresent ? success('Har data') : success('Bruker har ikke data i dette systemet')
  }),
  test('aad-02', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i Azure AD', () => {
    if (!dataPresent) return noData()
    const data = {
      accountEnabled: systemData.accountEnabled
    }

    if (user.expectedType === 'employee') {
      if (allData.visma) data.visma = getActiveSourceData(allData.visma, user)
    } else {
      if (allData.pifu) data.pifu = getActiveSourceData(allData.pifu, user)
    }

    return systemData.accountEnabled ? success('Kontoen er aktivert', data) : error('Kontoen er deaktivert', data)
  }),
  test('aad-03', 'UPN er lik e-postadressen', 'Sjekker at UPN-et er lik e-postadressen i AD', () => {
    if (!dataPresent) return noData()
    const data = {
      mail: systemData.mail || null,
      userPrincipalName: systemData.userPrincipalName || null
    }
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', data)
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase() ? success('UPN er lik e-postadressen', data) : error('UPN er ikke lik e-postadressen', data)
  }),
  test('aad-04', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    if (!dataPresent) return noData()
    const data = {
      userPrincipalName: systemData.userPrincipalName || null
    }
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', data)
    if (user.expectedType === 'employee') return systemData.userPrincipalName.includes('@vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
    else return systemData.userPrincipalName.includes('@skole.vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
  }),
  test('aad-05', 'Passord synkronisert til Azure AD', 'Sjekker at passordet er synkronisert til Azure AD innenfor 40 minutter', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error('Mangler AD-data', allData)
    const pwdCheck = isPwdLastSet(new Date(allData.ad.pwdLastSet), new Date(systemData.lastPasswordChangeDateTime), 40*60)
    const data = {
      aad: {
        lastPasswordChangeDateTime: systemData.lastPasswordChangeDateTime
      },
      ad: {
        pwdLastSet: allData.ad.pwdLastSet
      },
      seconds: pwdCheck.seconds
    }
    if (pwdCheck.result) return success('Passord synkronisert til Azure AD', data)
    else return error('Passord ikke synkronisert', data)
  }),
  test('aad-06', 'Synkroniseres fra lokalt AD', 'Sjekker at synkronisering fra lokalt AD er aktivert', () => {
    if (!dataPresent) return noData()
    const data = {
      onPremisesSyncEnabled: systemData.onPremisesSyncEnabled || null
    }
    if (!hasData(systemData.onPremisesSyncEnabled)) return error('onPremisesSyncEnabled mangler 🤭', data)
    return systemData.onPremisesSyncEnabled ? success('Synkronisering fra lokalt AD er aktivert', data) : warn('Synkronisering fra lokalt AD er ikke aktivert. Dersom brukeren kun eksisterer i Azure AD er dette allikevel riktig', data)
  }),
  test('aad-07', 'Ingen feil i synkroniseringen', 'Sjekker at det ikke er noen feil i synkroniseringen fra lokalt AD', () => {
    if (!dataPresent) return noData()
    const data = {
      onPremisesProvisioningErrors: systemData.onPremisesProvisioningErrors || null
    }
    return hasData(systemData.onPremisesProvisioningErrors) ? error('Synkroniseringsproblemer funnet 🤭', data) : success('Ingen synkroniseringsproblemer funnet', data)
  }),
  test('aad-08', 'Har riktig lisens(er)', 'Sjekker at riktig lisens(er) er aktivert', () => {
    if (!dataPresent) return noData()
    if (!hasData(systemData.assignedLicenses)) return error('Har ingen Azure AD lisenser 🤭', systemData.assignedLicenses)
    if (!hasData(user.departmentShort)) return warn('Ikke nok informasjon tilstede for å utføre testen', user)

    const expectedLicenseTable = licenses.filter(item => item.personType === user.expectedType)[0]
    if (!hasData(expectedLicenseTable)) return error(`Feilet ved innhenting av lisenstabell for '${user.expectedType}' 🤭`, expectedLicenseTable)

    let department
    if (user.expectedType === 'employee') {
      department = expectedLicenseTable.departments.filter(item => item.department.filter(dep => user.departmentShort.includes(dep)).length > 0)
      if (!hasData(department)) return error(`Feilet ved innhenting av lisenstabell for '${user.departmentShort}' 🤭`, expectedLicenseTable)
      department = department[0]
    } else {
      department = expectedLicenseTable.departments[0]
    }
    const departmentLicenses = department.licenses

    const data = {
      licenseDepartment: department.department,
      assignedLicenses: systemData.assignedLicenses,
      expectedLicenses: departmentLicenses,
      missingLicenses: []
    }

    departmentLicenses.forEach(license => {
      const assigned = systemData.assignedLicenses.filter(assignedLicense => assignedLicense.skuId === license.sku)
      if (!hasData(assigned)) data.missingLicenses.push(license)
    })

    return hasData(data.missingLicenses) ? error(`Mangler ${data.missingLicenses.length} lisens(er)`, data) : success('Lisenser er riktig', data)
  }),
  test('aad-09', 'Har satt opp MFA', 'Sjekker at MFA er satt opp', () => {
    if (!dataPresent) return noData()
    const data = {
      authenticationMethods: systemData.authenticationMethods
    }
    if (!hasData(systemData.authenticationMethods)) {
      return user.expectedType === 'employee' ? error('MFA er ikke satt opp 🤭', data) : success('MFA er ikke satt opp, og heller ikke påkrevd for elever')
    } else return success(`${systemData.authenticationMethods.length} MFA-metode${systemData.authenticationMethods.length > 1 ? 'r' : ''} er satt opp`, data)
  })
])
