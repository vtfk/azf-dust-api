const { test, success, error, warn, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isWithinTimeRange = require('../../lib/helpers/is-within-timerange')
const getActiveSourceData = require('../../lib/helpers/get-active-source-data')
const getAadGroups = require('../../lib/get-aad-groups')
const getSdsGroups = require('../../lib/get-sds-groups')
// const licenses = require('../data/licenses.json')

const aadSyncInSeconds = 40 * 60
let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('aad-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent && !allData) return waitForData()
    else if (!dataPresent && allData && !allData.ad) return warn('Data mangler grunnet ingen data i AD')
    else if (!dataPresent && allData && allData.ad) return error('Mangler data 😬', systemData)
    return dataPresent ? success('Har data') : success('Bruker har ikke data i dette systemet')
  }),
  test('aad-02', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i Azure AD', () => {
    if (!dataPresent) return noData()
    const data = {
      accountEnabled: systemData.accountEnabled
    }

    if (user.expectedType === 'employee') {
      if (allData.visma) {
        data.visma = getActiveSourceData(allData.visma, user)
        if (systemData.accountEnabled && data.visma.active) return success('Kontoen er aktivert', data)
        else if (systemData.accountEnabled && !data.visma.active) return error('Kontoen er aktivert selvom ansatt har sluttet', data)
        else if (!systemData.accountEnabled && data.visma.active) return warn('Kontoen er deaktivert. Ansatt må aktivere sin konto', data)
        else if (!systemData.accountEnabled && !data.visma.active) return warn('Kontoen er deaktivert', data)
      }
    } else {
      if (allData.vis) {
        data.vis = getActiveSourceData(allData.vis, user)
        if (systemData.accountEnabled && data.vis.active) return success('Kontoen er aktivert', data)
        else if (systemData.accountEnabled && !data.vis.active) return error('Kontoen er aktivert selvom elev har sluttet', data)
        else if (!systemData.accountEnabled && data.vis.active) return warn('Kontoen er deaktivert. Eleven må aktivere sin konto', data)
        else if (!systemData.accountEnabled && !data.vis.active) return warn('Kontoen er deaktivert', data)
      }
    }

    if (!allData.visma && !allData.vis) return systemData.accountEnabled ? success('Kontoen er aktivert', data) : error('Kontoen er deaktivert', data)
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
    if (hasData(systemData.onPremisesProvisioningErrors)) return error('Synkroniseringsproblemer funnet 🤭', data)
    if (data.ad) {
      const isLastChanged = isWithinTimeRange(new Date(data.ad.whenChanged), new Date(data.aad.onPremisesLastSyncDateTime), aadSyncInSeconds)
      if (data.aad.displayName !== data.ad.displayName) return (isLastChanged.seconds > 0 && isLastChanged.seconds < aadSyncInSeconds) || (isLastChanged.seconds < 0 && isLastChanged.seconds > -aadSyncInSeconds) ? warn('Forskjellig visningsnavn i Azure og AD. Synkronisering utføres snart', data) : error('Forskjellig visningsnavn i Azure og AD 🤭', data)
      if (data.aad.userPrincipalName !== data.ad.userPrincipalName) return (isLastChanged.seconds > 0 && isLastChanged.seconds < aadSyncInSeconds) || (isLastChanged.seconds < 0 && isLastChanged.seconds > -aadSyncInSeconds) ? warn('Forskjellig UPN i Azure og AD. Synkronisering utføres snart', data) : error('Forskjellig UPN i Azure og AD 🤭', data)
      if (data.aad.onPremisesSamAccountName !== data.ad.samAccountName) return (isLastChanged.seconds > 0 && isLastChanged.seconds < aadSyncInSeconds) || (isLastChanged.seconds < 0 && isLastChanged.seconds > -aadSyncInSeconds) ? warn('Forskjellig brukernavn i Azure og AD. Synkronisering utføres snart', data) : error('Forskjellig brukernavn i Azure og AD 🤭', data)
      if (data.aad.mail !== data.ad.mail) return (isLastChanged.seconds > 0 && isLastChanged.seconds < aadSyncInSeconds) || (isLastChanged.seconds < 0 && isLastChanged.seconds > -aadSyncInSeconds) ? warn('Forskjellig primær e-postadresse i Azure og AD. Synkronisering utføres snart', data) : error('Forskjellig primær e-postadresse i Azure og AD 🤭', data)
    }

    return success('Ingen synkroniseringsproblemer funnet', data)
  }),
  test('aad-08', 'Har riktig lisens(er)', 'Sjekker at riktig lisens(er) er aktivert', () => {
    if (!dataPresent) return noData()
    return !hasData(systemData.assignedLicenses) ? error('Har ingen Azure AD-lisenser 🤭', systemData.assignedLicenses) : success('Har Azure AD-lisenser', systemData.assignedLicenses)

    /* if (!hasData(user.departmentShort)) return warn('Ikke nok informasjon tilstede for å utføre testen', user)

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

    return hasData(data.missingLicenses) ? error(`Mangler ${data.missingLicenses.length} lisens(er)`, data) : success('Lisenser er riktig', data) */
  }),
  test('aad-09', 'Har satt opp MFA', 'Sjekker at MFA er satt opp', () => {
    if (!dataPresent) return noData()
    const data = {
      authenticationMethods: systemData.authenticationMethods
    }
    if (!hasData(systemData.authenticationMethods)) {
      return user.expectedType === 'employee' ? error('MFA er ikke satt opp 🤭', data) : warn('MFA er ikke satt opp, blir snart påkrevd for elever')
    } else return success(`${systemData.authenticationMethods.length} MFA-metode${systemData.authenticationMethods.length > 1 ? 'r' : ''} er satt opp`, data)
  }),
  test('aad-10', 'Har skrevet feil passord', 'Sjekker om bruker har skrevet feil passord idag', () => {
    if (!dataPresent) return noData()
    const data = {
      userSignInErrors: systemData.userSignInErrors
    }
    return hasData(systemData.userSignInErrors) ? error(`Har skrevet feil passord ${systemData.userSignInErrors.length} gang${systemData.userSignInErrors.length > 1 ? 'er' : ''} idag 🤦‍♂️`, data) : success('Ingen klumsing med passord idag', data)
  }),
  test('aad-11', 'Ikke for mange SDS-grupper', 'Sjekker at bruker ikke har medlemskap i avsluttede SDS-grupper', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!allData.sds) return noData('Mangler SDS data', allData.sds)
    if (user.expectedType !== 'student') return noData()

    const sdsGroups = getSdsGroups(allData.sds)
    const aadSdsGroups = getAadGroups(systemData.transitiveMemberOf).filter(group => group.mailNickname.startsWith('Section_') && !sdsGroups.includes(group.mailNickname.replace('Section_', ''))).map(group => group.mailNickname.replace('Section_', ''))

    return hasData(aadSdsGroups) ? error(`Bruker er medlem av ${aadSdsGroups.length} team${aadSdsGroups.length > 1 ? 's' : ''} som burde vært avsluttet`, aadSdsGroups) : noData()
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
      if (!data.isInsideSyncWindow.result) return error(`AzureAD-kontoen er fremdeles ${systemData.accountEnabled ? '' : 'in'}aktiv`, data)
      else return warn(`AzureAD-kontoen vil bli ${allData.ad.enabled ? '' : 'de'}aktivert ved neste synkronisering (innenfor ${aadSyncInSeconds / 60} minutter)`, data)
    } else return noData()
  })
])
