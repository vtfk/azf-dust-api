const { test, success, error, warn, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const { isApprentice, isOT, isEmployee, isStudent } = require('../../lib/helpers/is-type')
const getActiveSourceData = require('../../lib/helpers/get-active-source-data')
const { SYSTEMS: { AD: { OU_AUTO_USERS, OU_AUTO_DISABLED_USERS } } } = require('../../config')
const systemNames = require('../../lib/data/systems.json')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('ad-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (dataPresent) return success('Har data')
    else {
      if (user.expectedType === 'employee') return error({ message: 'Mangler data 😬', solution: `Rettes i ${systemNames.visma}` })
      else if (isStudent(user)) return error({ message: 'Mangler data 😬', solution: `Rettes i ${systemNames.vis}` })
      else if (isApprentice(user)) return error({ message: 'Mangler data 😬', solution: `Rettes i ${systemNames.vigolaerling}` })
      else if (isOT(user)) return error({ message: 'Mangler data 😬', solution: `Rettes i ${systemNames.vigoot}` })
    }
  }),
  test('ad-02', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i AD', () => {
    if (!dataPresent) return noData()
    if (!allData) return noData()
    if (user.expectedType === 'employee' && !allData.visma) return error({ message: `Mangler data i ${systemNames.visma}`, raw: { user }, solution: `Rettes i ${systemNames.visma}` })
    if (user.expectedType === 'student') {
      if (isStudent(user) && !allData.vis) return error({ message: `Mangler data i ${systemNames.vis}`, raw: { user }, solution: `Rettes i ${systemNames.vis}` })
      if (isApprentice(user) && !allData.vigolaerling) return error({ message: `Mangler data i ${systemNames.vigolaerling}`, raw: { user }, solution: `Rettes i ${systemNames.vigolaerling}` })
      if (isOT(user) && !allData.vigoot) return error({ message: `Mangler data i ${systemNames.vigoot}`, raw: { user }, solution: `Rettes i ${systemNames.vigoot}` })
    }

    const data = {
      enabled: systemData.enabled
    }

    if (user.expectedType === 'employee') {
      data.visma = getActiveSourceData(allData.visma, user)
      if (systemData.enabled && data.visma.active) return success({ message: 'Kontoen er aktivert', raw: data })
      else if (systemData.enabled && !data.visma.active) return error({ message: 'Kontoen er aktivert selvom ansatt har sluttet', raw: data, solution: `Rettes i ${systemNames.visma}` })
      else if (!systemData.enabled && data.visma.active) return warn({ message: 'Kontoen er deaktivert. Ansatt må aktivere sin konto', raw: data, solution: `Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}` })
      else if (!systemData.enabled && !data.visma.active) return warn({ message: 'Kontoen er deaktivert', raw: data, solution: `Rettes i ${systemNames.visma}` })
    } else {
      if (isApprentice(user)) return systemData.enabled ? success({ message: 'Kontoen er aktivert', raw: data }) : warn({ message: 'Kontoen er deaktivert', raw: data, solution: `Bruker må aktivere sin konto via minlarlingkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}` })
      if (isOT(user)) return systemData.enabled ? success({ message: 'Kontoen er aktivert', raw: data }) : warn({ message: 'Kontoen er deaktivert', raw: data, solution: `Bruker må aktivere sin konto via min-ot-konto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}` })

      data.vis = getActiveSourceData(allData.vis, user)
      if (systemData.enabled && data.vis.student.active) return success({ message: 'Kontoen er aktivert', raw: data })
      else if (systemData.enabled && !data.vis.student.active) return error({ message: 'Kontoen er aktivert selvom elev har sluttet', raw: data, solution: `Rettes i ${systemNames.vis}` })
      else if (!systemData.enabled && data.vis.student.active) return warn({ message: 'Kontoen er deaktivert. Eleven må aktivere sin konto', raw: data, solution: `Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i ${systemNames.ad}` })
      else if (!systemData.enabled && !data.vis.student.active) return warn({ message: 'Kontoen er deaktivert', raw: data, solution: `Rettes i ${systemNames.vis}` })
    }
  }),
  test('ad-03', 'Hvilken OU', 'Sjekker hvilken OU bruker ligger i', () => {
    if (!dataPresent) return noData()

    const data = {
      distinguishedName: systemData.distinguishedName
    }

    if (systemData.distinguishedName.toLowerCase().includes(OU_AUTO_USERS.toLowerCase())) return success({ message: `Bruker ligger i OU'en ${OU_AUTO_USERS.replace('OU=', '')}`, raw: data })
    else if (systemData.distinguishedName.toLowerCase().includes(OU_AUTO_DISABLED_USERS.toLowerCase())) {
      if (user.expectedType === 'employee') return warn({ message: `Bruker ligger i OU'en ${OU_AUTO_DISABLED_USERS.replace('OU=', '')}`, raw: data, solution: `Rettes i ${systemNames.visma}` })
      else {
        if (isStudent(user)) return warn({ message: `Bruker ligger i OU'en ${OU_AUTO_DISABLED_USERS.replace('OU=', '')}`, raw: data, solution: `Rettes i ${systemNames.vis}` })
        if (isApprentice(user)) return warn({ message: `Bruker ligger i OU'en ${OU_AUTO_DISABLED_USERS.replace('OU=', '')}`, raw: data, solution: `Rettes i ${systemNames.vigolaerling}` })
        if (isOT(user)) return warn({ message: `Bruker ligger i OU'en ${OU_AUTO_DISABLED_USERS.replace('OU=', '')}`, raw: data, solution: `Rettes i ${systemNames.vigoot}` })
      }
    }
  }),
  test('ad-04', 'Kontoen er ulåst', 'Sjekker at kontoen ikke er sperret for pålogging i AD', () => {
    if (!dataPresent) return noData()
    const data = {
      lockedOut: systemData.lockedOut
    }
    if (!systemData.lockedOut) return success({ message: 'Kontoen er ikke sperret for pålogging', raw: data })
    return error({ message: 'Kontoen er sperret for pålogging', raw: data, solution: `Servicedesk må åpne brukerkontoen for pålogging i ${systemNames.ad}. Dette gjøres i Properties på brukerobjektet under fanen Account` })
  }),
  test('ad-05', 'UPN er korrekt', 'Sjekker at UPN er korrekt for ansatte, elever, lærlinger og OT-ungdom', () => {
    if (!dataPresent) return noData()
    if (!systemData.userPrincipalName) return error({ message: 'UPN mangler 😬', raw: systemData })
    const data = {
      userPrincipalName: systemData.userPrincipalName
    }
    if (user.expectedType === 'employee') return isEmployee(systemData) ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt for ansatt', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt', raw: data, solution: 'Sak meldes til arbeidsgruppe identitet' })
    else {
      if (isStudent(user)) return data.userPrincipalName.endsWith('@skole.vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt for elev', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt', raw: data, solution: 'Sak meldes til arbeidsgruppe identitet' })
      if (isApprentice(user)) return data.userPrincipalName.endsWith('@skole.vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt for lærlinger', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt', raw: data, solution: 'Sak meldes til arbeidsgruppe identitet' })
      if (isOT(user)) return data.userPrincipalName.endsWith('@ot.vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt for OT-ungdom', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt', raw: data, solution: 'Sak meldes til arbeidsgruppe identitet' })
    }
  }),
  test('ad-06', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    if (!systemData.employeeNumber) return error({ message: 'Fødselsnummer mangler 😬', raw: systemData })
    const data = {
      employeeNumber: systemData.employeeNumber,
      fnr: isValidFnr(systemData.employeeNumber)
    }
    return data.fnr.valid ? success({ message: `Har gyldig ${data.fnr.type}`, raw: data }) : error({ message: data.fnr.error, raw: data })
  }),
  test('ad-07', 'Har state satt for ansatt', 'Sjekker at state er satt på ansatt', () => {
    if (!dataPresent) return noData()
    if (user.expectedType === 'student') return noData()
    if (user.expectedType === 'employee') {
      if (hasData(systemData.state)) return success({ message: 'Felt for lisens er fylt ut', raw: { state: systemData.state } })
      else return error({ message: 'Felt for lisens mangler 😬', raw: systemData, solution: 'Meld sak til arbeidsgruppe identitet' })
    }
  }),
  test('ad-08', 'Har extensionAttribute4', 'Sjekker om bruker har extensionAttribute4', () => {
    if (!dataPresent) return noData()
    if (!systemData.extensionAttribute4) return noData()

    const data = {
      extensionAttribute4: systemData.extensionAttribute4.split(',').map(ext => ext.trim())
    }

    return warn({ message: `Er medlem av ${data.extensionAttribute4.length} personalrom- og ${data.extensionAttribute4.length === 0 || data.extensionAttribute4.length > 1 ? 'mailinglister' : 'mailingliste'} ekstra`, solution: `extensionAttribute4 fører til medlemskap i personalrom- og mailinglister. Dersom dette ikke er ønskelig fjernes dette fra brukeren i ${systemNames.ad}`, raw: data })
  }),
  test('ad-09', 'Sjekker direktemedlemskap', 'Brukers direkte gruppemedlemskap', () => {
    if (!dataPresent) return noData()
    if (!hasData(systemData.memberOf)) return error({ message: `Er ikke medlem av noen ${systemNames.ad}-grupper 🤔` })

    const groups = systemData.memberOf.map(member => member.replace('CN=', '').split(',')[0]).sort()

    return success({ message: `Er direkte medlem av ${groups.length} ${systemNames.ad}-gruppe${groups.length === 0 || groups.length > 1 ? 'r' : ''}`, raw: groups })
  })
])
