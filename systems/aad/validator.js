const { test, success, error, warn, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isWithinTimeRange = require('../../lib/helpers/is-within-timerange')
const getActiveSourceData = require('../../lib/helpers/get-active-source-data')
// const getSdsGroups = require('../../lib/get-sds-groups')
const licenses = require('../data/licenses.json')

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
    if (!systemData.userPrincipalName) return error({ message: 'UPN (brukernavn til Microsoft 365) mangler 🤭', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    if (!systemData.mail) {
      if (systemData.accountEnabled) return error({ message: 'E-postadresse mangler 🤭', raw: data })
      else return user.expectedType === 'employee' ? warn({ message: 'E-postadresse blir satt når konto er blitt aktivert', raw: data, solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` }) : warn({ message: 'E-postadresse blir satt når konto er blitt aktivert', raw: data, solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
    }
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase() ? success({ message: 'UPN (brukernavn til Microsoft 365) er lik e-postadressen', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke lik e-postadressen', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
  }),
  test('aad-04', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    if (!dataPresent) return noData()
    const data = {
      userPrincipalName: systemData.userPrincipalName || null
    }
    if (systemData.userPrincipalName.includes('.onmicrosoft.com')) return error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt 🤭', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    if (user.expectedType === 'employee') return systemData.userPrincipalName.includes('@vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    else return systemData.userPrincipalName.includes('@skole.vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
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
  test('aad-06', 'Har riktig lisens(er)', 'Sjekker at riktig lisens(er) er aktivert', () => {
    if (!dataPresent) return noData()
    if (!hasData(systemData.assignedLicenses)) {
      if (systemData.accountEnabled) return error({ message: 'Har ingen Microsoft 365-lisenser 🤭', solution: 'Meld sak til arbeidsgruppe identitet' })
      else return user.expectedType === 'employee' ? warn({ message: 'Microsoft 365-lisenser blir satt når konto er blitt aktivert', solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` }) : warn({ message: 'AMicrosoft 365-lisenser blir satt når konto er blitt aktivert', solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
    } else {
      const data = systemData.assignedLicenses.map(license => {
        const lic = licenses.find(lic => lic.skuId === license.skuId)
        if (lic) return lic
        else return { skuId: license.skuId }
      })
      return success({ message: 'Har Microsoft 365-lisenser', raw: data })
    }
  }),
  test('aad-07', 'Har satt opp MFA', 'Sjekker at MFA er satt opp', () => {
    if (!dataPresent) return noData()
    const data = {
      authenticationMethods: systemData.authenticationMethods
    }
    if (!hasData(systemData.authenticationMethods)) {
      return user.expectedType === 'employee' ? error({ message: 'MFA (tofaktor) er ikke satt opp 🤭', raw: data, solution: 'Bruker må selv sette opp MFA (tofaktor) via aka.ms/mfasetup' }) : warn('MFA (tofaktor) er ikke satt opp, blir snart påkrevd for elever')
    } else return success({ message: `${systemData.authenticationMethods.length} MFA-metode${systemData.authenticationMethods.length > 1 ? 'r' : ''} (tofaktor) er satt opp`, raw: data })
  }),
  test('aad-08', 'Har skrevet feil passord', 'Sjekker om bruker har skrevet feil passord idag', () => {
    if (!dataPresent) return noData()
    const data = {
      userSignInErrors: systemData.userSignInErrors
    }
    return hasData(systemData.userSignInErrors) ? error({ message: `Har skrevet feil passord ${systemData.userSignInErrors.length} gang${systemData.userSignInErrors.length > 1 ? 'er' : ''} idag 🤦‍♂️`, raw: data, solution: 'Bruker må ta av boksehanskene 🥊' }) : success({ message: 'Ingen klumsing med passord idag', raw: data })
  }),
  /* test('aad-09', 'Ikke for mange SDS-grupper', 'Sjekker at bruker ikke har medlemskap i avsluttede SDS-grupper', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!allData.sds) return noData('Mangler SDS data')
    if (user.expectedType !== 'student') return noData()

    const sdsGroups = getSdsGroups(allData.sds)
    const aadSdsGroups = systemData.transitiveMemberOf.filter(group => !sdsGroups.includes(group.mailNickname.replace('Section_', ''))).map(group => group.mailNickname.replace('Section_', ''))

    return hasData(aadSdsGroups) ? warn({ message: 'Bruker har flere medlemskap enn det som er registrert i Visma InSchool', raw: aadSdsGroups, solution: 'Bruker kan selv melde seg ut av Team. Utmelding kan også gjøres av IT via Azure AD / Teams Admin Center' }) : noData()
  }), */
  test('aad-09', 'AD- og AzureAD-attributtene er like', 'Sjekker at attributtene i AD og AzureAD er like', () => {
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
