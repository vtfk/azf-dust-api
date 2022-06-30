const { test, success, error, warn, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isWithinTimeRange = require('../../lib/helpers/is-within-timerange')
const getActiveSourceData = require('../../lib/helpers/get-active-source-data')
const { isApprentice, isOT, isEmployee, isStudent } = require('../../lib/helpers/is-type')
// const getSdsGroups = require('../../lib/get-sds-groups')
const licenses = require('../data/licenses.json')
const systemNames = require('../../lib/data/systems.json')

const aadSyncInMinutes = 30
const aadSyncInSeconds = aadSyncInMinutes * 60
let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('aad-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent && !allData) return waitForData()
    else if (!dataPresent && allData && !allData.ad) return warn({ message: `Data mangler grunnet ingen data i ${systemNames.ad}`, solution: user.expectedType === 'employee' ? `Rettes i ${systemNames.visma}` : `Rettes i ${systemNames.vis} dersom dette er en elev. Rettes i ${systemNames.vigolaerling} dersom dette er en lærling. Rettes i ${systemNames.vigoot} dersom dette er en OT-ungdom` })
    else if (!dataPresent && allData && allData.ad) return error({ message: 'Mangler data 😬', raw: systemData, solution: `Sjekk at bruker ligger i 'AUTO USERS' OU'en. Dersom brukeren er nylig opprettet i ${systemNames.ad}, vent ${aadSyncInMinutes} minutter og prøv et nytt søk` })
    return success('Har data')
  }),
  test('aad-02', 'Kontoen er aktivert', `Sjekker at kontoen er aktivert i ${systemNames.aad}`, () => {
    if (!dataPresent) return noData()
    if (!allData) return noData()
    if (user.expectedType === 'employee' && !allData.visma) return error({ message: `Mangler data i ${systemNames.visma}`, raw: { user }, solution: `Rettes i ${systemNames.visma}` })
    if (user.expectedType === 'student') {
      if (isStudent(user) && !allData.vis) return error({ message: `Mangler data i ${systemNames.vis}`, raw: { user }, solution: `Rettes i ${systemNames.vis}` })
      if (isApprentice(user) && !allData.vigolaerling) return error({ message: `Mangler data i ${systemNames.vigolaerling}`, raw: { user }, solution: `Rettes i ${systemNames.vigolaerling}` })
      if (isOT(user) && !allData.vigoot) return error({ message: `Mangler data i ${systemNames.vigoot}`, raw: { user }, solution: `Rettes i ${systemNames.vigoot}` })
    }

    const data = {
      accountEnabled: systemData.accountEnabled
    }

    if (user.expectedType === 'employee') {
      data.visma = getActiveSourceData(allData.visma, user)
      if (systemData.accountEnabled && data.visma.active) return success({ message: 'Kontoen er aktivert', raw: data })
      else if (!systemData.accountEnabled && data.visma.active) return warn({ message: 'Kontoen er deaktivert. Ansatt må aktivere sin konto', raw: data, solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
      else if (!systemData.accountEnabled && !data.visma.active) return warn({ message: 'Kontoen er deaktivert', raw: data })
    } else {
      if (isApprentice(user)) return systemData.accountEnabled ? success({ message: 'Kontoen er aktivert', raw: data }) : warn({ message: 'Kontoen er deaktivert', raw: data, solution: `Bruker må aktivere sin konto via minlarlingkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
      if (isOT(user)) return systemData.accountEnabled ? success({ message: 'Kontoen er aktivert', raw: data }) : warn({ message: 'Kontoen er deaktivert', raw: data, solution: `Bruker må aktivere sin konto via min-ot-konto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })

      data.vis = getActiveSourceData(allData.vis, user)
      if (systemData.accountEnabled && data.vis.student.active) return success({ message: 'Kontoen er aktivert', raw: data })
      else if (!systemData.accountEnabled && data.vis.student.active) return warn({ message: 'Kontoen er deaktivert. Eleven må aktivere sin konto', raw: data, solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
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
    if (!systemData.userPrincipalName) return error({ message: 'UPN (brukernavn til Microsoft 365) mangler 😬', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    if (!systemData.mail) {
      if (systemData.accountEnabled) return error({ message: 'E-postadresse mangler 😬', raw: data })
      else {
        if (user.expectedType === 'employee') return warn({ message: 'E-postadresse blir satt når konto er blitt aktivert', raw: data, solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
        else if (isStudent(user)) return warn({ message: 'E-postadresse blir satt når konto er blitt aktivert', raw: data, solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
        else if (isApprentice(user)) return warn({ message: 'E-postadresse blir satt når konto er blitt aktivert', raw: data, solution: `Bruker må aktivere sin konto via minlarlingkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
        else if (isOT(user)) return warn({ message: 'E-postadresse blir satt når konto er blitt aktivert', raw: data, solution: `Bruker må aktivere sin konto via min-ot-konto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
      }
    }
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase() ? success({ message: 'UPN (brukernavn til Microsoft 365) er lik e-postadressen', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke lik e-postadressen', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
  }),
  test('aad-04', 'UPN er korrekt', 'Sjekker at UPN er korrekt for ansatte, elever, lærlinger og OT-ungdom', () => {
    if (!dataPresent) return noData()
    const data = {
      userPrincipalName: systemData.userPrincipalName || null
    }
    if (systemData.userPrincipalName.includes('.onmicrosoft.com')) return error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt 😬', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    if (user.expectedType === 'employee') return isEmployee(systemData) ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt for ansatt', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt for ansatt', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    else {
      if (isStudent(user)) return systemData.userPrincipalName.includes('skole.vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt for elev', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt for elev', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
      if (isApprentice(user)) return systemData.userPrincipalName.includes('skole.vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt for lærling', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt for lærling', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
      if (isOT(user)) return systemData.userPrincipalName.includes('ot.vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt for OT-ungdom', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt for OT-ungdom', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
    }
  }),
  test('aad-05', 'Passord synkronisert til Azure AD', 'Sjekker at passordet er synkronisert til Azure AD innenfor 40 minutter', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error({ message: `Mangler ${systemNames.ad}-data`, raw: allData.ad })
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
    else if (pwdCheck.result) return success({ message: `Passord synkronisert til ${systemNames.aad}`, raw: data })
    else return error({ message: 'Passord ikke synkronisert', raw: data })
  }),
  test('aad-06', 'Har riktig lisens(er)', 'Sjekker at riktig lisens(er) er aktivert', () => {
    if (!dataPresent) return noData()
    if (!hasData(systemData.assignedLicenses)) {
      if (systemData.accountEnabled) return error({ message: 'Har ingen Microsoft 365-lisenser 😬', solution: 'Meld sak til arbeidsgruppe identitet' })
      else {
        if (user.expectedType === 'employee') return warn({ message: 'Microsoft 365-lisenser blir satt når konto er blitt aktivert', solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
        else if (isStudent(user)) return warn({ message: 'Microsoft 365-lisenser blir satt når konto er blitt aktivert', solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
        else if (isApprentice(user)) return warn({ message: 'Microsoft 365-lisenser blir satt når konto er blitt aktivert', solution: `Bruker må aktivere sin konto via minlarlingkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
        else if (isOT(user)) return warn({ message: 'Microsoft 365-lisenser blir satt når konto er blitt aktivert', solution: `Bruker må aktivere sin konto via min-ot-konto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}. Deretter vent til Azure AD Syncen har kjørt, dette kan ta inntil ${aadSyncInMinutes} minutter` })
      }
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
    if (!hasData(systemData.authenticationMethods)) return error({ message: 'MFA (tofaktor) er ikke satt opp 😬', raw: data, solution: 'Bruker må selv sette opp MFA (tofaktor) via aka.ms/mfasetup' })
    else return success({ message: `${systemData.authenticationMethods.length} MFA-metode${systemData.authenticationMethods.length > 1 ? 'r' : ''} (tofaktor) er satt opp`, raw: data })
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
    if (!allData.sds) return noData(`Mangler ${systemNames.sds} data`)
    if (user.expectedType !== 'student') return noData()

    const sdsGroups = getSdsGroups(allData.sds)
    const aadSdsGroups = systemData.transitiveMemberOf.filter(group => !sdsGroups.includes(group.mailNickname.replace('Section_', ''))).map(group => group.mailNickname.replace('Section_', ''))

    return hasData(aadSdsGroups) ? warn({ message: `Bruker har flere medlemskap enn det som er registrert i ${systemNames.vis}`, raw: aadSdsGroups, solution: `Bruker kan selv melde seg ut av Team. Utmelding kan også gjøres av IT via ${systemNames.aad} / Teams Admin Center` }) : noData()
  }), */
  test('aad-09', 'AD- og AzureAD-attributtene er like', 'Sjekker at attributtene i AD og AzureAD er like', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!allData.ad) return noData(`Mangler ${systemNames.ad}-data`)

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
  }),
  test('aad-10', 'Sjekker medlemskap', 'Brukers gruppemedlemskap', () => {
    if (!dataPresent) return noData()
    if (!hasData(systemData.memberOf)) return error({ message: `Er ikke medlem av noen ${systemNames.aad} grupper 🤔` })

    return success({ message: `Er medlem av ${systemData.memberOf.length} ${systemNames.aad} gruppe${systemData.memberOf.length === 0 || systemData.memberOf.length > 1 ? 'r' : ''}`, raw: systemData.memberOf })
  })
])
