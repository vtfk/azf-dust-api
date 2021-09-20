const { test, success, error, warn, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isWithinTimeRange = require('../../lib/helpers/is-within-timerange')
const getActiveSourceData = require('../../lib/helpers/get-active-source-data')
const getAadGroups = require('../../lib/get-aad-groups')
const getSdsGroups = require('../../lib/get-sds-groups')
// const licenses = require('../data/licenses.json')

const aadSyncInMinutes = 30
const aadSyncInSeconds = aadSyncInMinutes * 60
let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('aad-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent && !allData) return waitForData()
    else if (!dataPresent && allData && !allData.ad) return warn({ message: 'Data mangler grunnet ingen data i AD', solution: user.expectedType === 'employee' ? 'Rettes i Visma HRM' : 'Rettes i Visma InSchool' })
    else if (!dataPresent && allData && allData.ad) return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Sjekk at bruker ligger i \'AUTO USERS\' OU\'en' })
    return success('Har data')
  }),
  test('aad-02', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i Azure AD', () => {
    if (!dataPresent) return noData()
    if (!allData) return noData()
    if (user.expectedType === 'employee' && !allData.visma) return error({ message: 'Mangler data i Visma HRM', raw: { user, visma: allData.visma } })
    if (user.expectedType === 'student' && !allData.vis) return error({ message: 'Mangler data i Visma InSchool', raw: { user, vis: allData.vis } })

    const data = {
      accountEnabled: systemData.accountEnabled
    }

    if (user.expectedType === 'employee') {
      data.visma = getActiveSourceData(allData.visma, user)
      if (systemData.accountEnabled && data.visma.active) return success({ message: 'Kontoen er aktivert', raw: data })
      else if (!systemData.accountEnabled && data.visma.active) return warn({ message: 'Kontoen er deaktivert. Ansatt må aktivere sin konto', raw: data, solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
      else if (!systemData.accountEnabled && !data.visma.active) return warn({ message: 'Kontoen er deaktivert', raw: data })
    } else {
      data.vis = getActiveSourceData(allData.vis, user)
      if (systemData.accountEnabled && data.vis.student.active) return success({ message: 'Kontoen er aktivert', raw: data })
      else if (!systemData.accountEnabled && data.vis.student.active) return warn({ message: 'Kontoen er deaktivert. Eleven må aktivere sin konto', raw: data, solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
      else if (!systemData.accountEnabled && !data.vis.student.active) return warn({ message: 'Kontoen er deaktivert', raw: data })
    }
  }),
  test('aad-03', 'UPN er lik e-postadressen', 'Sjekker at UPN-et er lik e-postadressen i AD', () => {
    if (!dataPresent) return noData()
    const data = {
      accountEnabled: systemData.accountEnabled,
      mail: systemData.mail || null,
      userPrincipalName: systemData.userPrincipalName || null
    }
    if (!systemData.userPrincipalName) return error({ message: 'UPN mangler 🤭', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    if (!systemData.mail) {
      if (systemData.accountEnabled) return error({ message: 'E-postadresse mangler 🤭', raw: data })
      else return user.expectedType === 'employee' ? warn({ message: 'E-postadresse blir satt når konto er blitt aktivert', raw: data, solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` }) : warn({ message: 'E-postadresse blir satt når konto er blitt aktivert', raw: data, solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
    }
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase() ? success({ message: 'UPN er lik e-postadressen', raw: data }) : error({ message: 'UPN er ikke lik e-postadressen', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
  }),
  test('aad-04', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    if (!dataPresent) return noData()
    const data = {
      userPrincipalName: systemData.userPrincipalName || null
    }
    if (systemData.userPrincipalName.includes('.onmicrosoft.com')) return error({ message: 'UPN er ikke korrekt 🤭', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    if (user.expectedType === 'employee') return systemData.userPrincipalName.includes('@vtfk.no') ? success({ message: 'UPN er korrekt', raw: data }) : error({ message: 'UPN er ikke korrekt', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    else return systemData.userPrincipalName.includes('@skole.vtfk.no') ? success({ message: 'UPN er korrekt', raw: data }) : error({ message: 'UPN er ikke korrekt', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
  }),
  test('aad-05', 'Passord synkronisert til Azure AD', 'Sjekker at passordet er synkronisert til Azure AD innenfor 40 minutter', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error({ message: 'Mangler AD-data', raw: allData.ad })
    const pwdCheck = isWithinTimeRange(new Date(allData.ad.pwdLastSet), new Date(systemData.lastPasswordChangeDateTime), aadSyncInSeconds)
    const data = {
      aad: {
        lastPasswordChangeDateTime: systemData.lastPasswordChangeDateTime
      },
      ad: {
        pwdLastSet: allData.ad.pwdLastSet
      },
      seconds: pwdCheck.seconds
    }
    if (allData.ad.pwdLastSet === 0) return warn({ message: 'Passord vil synkroniseres når konto er blitt aktivert', raw: data })
    else if (pwdCheck.result) return success({ message: 'Passord synkronisert til Azure AD', raw: data })
    else return error({ message: 'Passord ikke synkronisert', raw: data })
  }),
  test('aad-06', 'Synkroniseres fra lokalt AD', 'Sjekker at synkronisering fra lokalt AD er aktivert', () => {
    if (!dataPresent) return noData()
    const data = {
      onPremisesSyncEnabled: systemData.onPremisesSyncEnabled || null
    }
    if (!hasData(systemData.onPremisesSyncEnabled)) return error({ message: 'onPremisesSyncEnabled mangler 🤭', raw: data })
    return systemData.onPremisesSyncEnabled ? success({ message: 'Synkronisering fra lokalt AD er aktivert', raw: data }) : warn({ message: 'Synkronisering fra lokalt AD er ikke aktivert. Dersom brukeren kun eksisterer i Azure AD er dette allikevel riktig', raw: data })
  }),
  test('aad-07', 'Ingen feil i synkroniseringen', 'Sjekker at det ikke er noen feil i synkroniseringen fra lokalt AD', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    const data = {
      aad: {
        onPremisesProvisioningErrors: systemData.onPremisesProvisioningErrors || null,
        displayName: systemData.displayName,
        userPrincipalName: systemData.userPrincipalName,
        onPremisesSamAccountName: systemData.onPremisesSamAccountName,
        mail: systemData.mail,
        onPremisesLastSyncDateTime: systemData.onPremisesLastSyncDateTime
      }
    }
    if (hasData(allData.ad)) {
      data.ad = {
        displayName: allData.ad.displayName,
        userPrincipalName: allData.ad.userPrincipalName,
        samAccountName: allData.ad.samAccountName,
        mail: allData.ad.mail,
        whenChanged: allData.ad.whenChanged
      }
    }
    if (hasData(systemData.onPremisesProvisioningErrors)) return error({ message: 'Synkroniseringsproblemer funnet 🤭', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    if (data.ad) {
      const isLastChanged = isWithinTimeRange(new Date(data.ad.whenChanged), new Date(data.aad.onPremisesLastSyncDateTime), aadSyncInSeconds)
      if (data.aad.displayName !== data.ad.displayName) return (isLastChanged.seconds > 0 && isLastChanged.seconds < aadSyncInSeconds) || (isLastChanged.seconds < 0 && isLastChanged.seconds > -aadSyncInSeconds) ? warn({ message: 'Forskjellig visningsnavn i Azure og AD. Synkronisering utføres snart', raw: data, solution: 'Synkronisering utføres snart' }) : error({ message: 'Forskjellig visningsnavn i Azure og AD 🤭', raw: data, solution: 'Synkronisering utføres snart' })
      if (data.aad.userPrincipalName !== data.ad.userPrincipalName) return (isLastChanged.seconds > 0 && isLastChanged.seconds < aadSyncInSeconds) || (isLastChanged.seconds < 0 && isLastChanged.seconds > -aadSyncInSeconds) ? warn({ message: 'Forskjellig UPN i Azure og AD. Synkronisering utføres snart', raw: data, solution: 'Synkronisering utføres snart' }) : error({ message: 'Forskjellig UPN i Azure og AD 🤭', raw: data, solution: 'Synkronisering utføres snart' })
      if (data.aad.onPremisesSamAccountName !== data.ad.samAccountName) return (isLastChanged.seconds > 0 && isLastChanged.seconds < aadSyncInSeconds) || (isLastChanged.seconds < 0 && isLastChanged.seconds > -aadSyncInSeconds) ? warn({ message: 'Forskjellig brukernavn i Azure og AD. Synkronisering utføres snart', raw: data, solution: 'Synkronisering utføres snart' }) : error({ message: 'Forskjellig brukernavn i Azure og AD 🤭', raw: data, solution: 'Synkronisering utføres snart' })
      if (data.aad.mail !== data.ad.mail && hasData(data.ad.mail)) return (isLastChanged.seconds > 0 && isLastChanged.seconds < aadSyncInSeconds) || (isLastChanged.seconds < 0 && isLastChanged.seconds > -aadSyncInSeconds) ? warn({ message: 'Forskjellig primær e-postadresse i Azure og AD. Synkronisering utføres snart', raw: data, solution: 'Synkronisering utføres snart' }) : error({ message: 'Forskjellig primær e-postadresse i Azure og AD 🤭', raw: data, solution: 'Synkronisering utføres snart' })
      if (data.aad.mail !== data.ad.mail && !hasData(data.ad.mail)) return noData()
    }

    return success({ message: 'Ingen synkroniseringsproblemer funnet', raw: data })
  }),
  test('aad-08', 'Har riktig lisens(er)', 'Sjekker at riktig lisens(er) er aktivert', () => {
    if (!dataPresent) return noData()
    if (!hasData(systemData.assignedLicenses)) {
      const data = {
        accountEnabled: systemData.accountEnabled,
        assignedLicenses: systemData.assignedLicenses
      }
      if (systemData.accountEnabled) return error({ message: 'Har ingen Azure AD-lisenser 🤭', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
      else return user.expectedType === 'employee' ? warn({ message: 'Azure AD-lisenser blir satt når konto er blitt aktivert', raw: data, solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` }) : warn({ message: 'Azure AD-lisenser blir satt når konto er blitt aktivert', raw: data, solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
    } else return success({ message: 'Har Azure AD-lisenser', raw: systemData.assignedLicenses })

    /* if (!hasData(user.departmentShort)) return warn({ message: 'Ikke nok informasjon tilstede for å utføre testen', raw: user })

    const expectedLicenseTable = licenses.filter(item => item.personType === user.expectedType)[0]
    if (!hasData(expectedLicenseTable)) return error({ message: `Feilet ved innhenting av lisenstabell for '${user.expectedType}' 🤭`, raw: expectedLicenseTable })

    let department
    if (user.expectedType === 'employee') {
      department = expectedLicenseTable.departments.filter(item => item.department.filter(dep => user.departmentShort.includes(dep)).length > 0)
      if (!hasData(department)) return error({ message: `Feilet ved innhenting av lisenstabell for '${user.departmentShort}' 🤭`, raw: expectedLicenseTable })
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

    return hasData(data.missingLicenses) ? error({ message: `Mangler ${data.missingLicenses.length} lisens(er)`, raw: data }) : success({ message: 'Lisenser er riktig', raw: data }) */
  }),
  test('aad-09', 'Har satt opp MFA', 'Sjekker at MFA er satt opp', () => {
    if (!dataPresent) return noData()
    const data = {
      authenticationMethods: systemData.authenticationMethods
    }
    if (!hasData(systemData.authenticationMethods)) {
      return user.expectedType === 'employee' ? error({ message: 'MFA er ikke satt opp 🤭', raw: data, solution: 'Bruker må selv sette opp MFA via aka.ms/mfasetup' }) : warn('MFA er ikke satt opp, blir snart påkrevd for elever')
    } else return success({ message: `${systemData.authenticationMethods.length} MFA-metode${systemData.authenticationMethods.length > 1 ? 'r' : ''} er satt opp`, raw: data })
  }),
  test('aad-10', 'Har skrevet feil passord', 'Sjekker om bruker har skrevet feil passord idag', () => {
    if (!dataPresent) return noData()
    const data = {
      userSignInErrors: systemData.userSignInErrors
    }
    return hasData(systemData.userSignInErrors) ? error({ message: `Har skrevet feil passord ${systemData.userSignInErrors.length} gang${systemData.userSignInErrors.length > 1 ? 'er' : ''} idag 🤦‍♂️`, raw: data, solution: 'Bruker må ta av boksehanskene 🥊' }) : success({ message: 'Ingen klumsing med passord idag', raw: data })
  }),
  test('aad-11', 'Ikke for mange SDS-grupper', 'Sjekker at bruker ikke har medlemskap i avsluttede SDS-grupper', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!allData.sds) return noData('Mangler SDS data')
    if (user.expectedType !== 'student') return noData()

    const sdsGroups = getSdsGroups(allData.sds)
    const aadSdsGroups = getAadGroups(systemData.transitiveMemberOf).filter(group => group.mailNickname.startsWith('Section_') && !sdsGroups.includes(group.mailNickname.replace('Section_', ''))).map(group => group.mailNickname.replace('Section_', ''))

    return hasData(aadSdsGroups) ? error({ message: `Bruker har ${aadSdsGroups.length} medlemskap som burde vært avsluttet`, raw: aadSdsGroups, solution: 'Rettes i Visma InSchool' }) : noData()
  }),
  test('aad-12', 'AD- og AzureAD-attributtene er like', 'Sjekker at attributtene i AD og AzureAD er like', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!allData.ad) return noData('Mangler AD-data')

    const data = {
      aad: {
        accountEnabled: systemData.accountEnabled,
        onPremisesLastSyncDateTime: systemData.onPremisesLastSyncDateTime
      },
      ad: {
        enabled: allData.ad.enabled,
        whenChanged: allData.ad.whenChanged
      }
    }

    if (systemData.accountEnabled !== allData.ad.enabled) {
      data.isInsideSyncWindow = isWithinTimeRange(new Date(), new Date(data.ad.whenChanged), aadSyncInSeconds)
      if (!data.isInsideSyncWindow.result) return error({ message: `AzureAD-kontoen er fremdeles ${systemData.accountEnabled ? '' : 'in'}aktiv`, raw: data, solution: 'Synkronisering utføres snart' })
      else return warn({ message: `AzureAD-kontoen vil bli ${allData.ad.enabled ? '' : 'de'}aktivert ved neste synkronisering (innenfor ${aadSyncInMinutes} minutter)`, raw: data, solution: 'Synkronisering utføres snart' })
    } else return noData()
  })
])
