const { test, success, error, warn, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const getActiveSourceData = require('../../lib/helpers/get-active-source-data')
const { SYSTEMS: { AD: { OU_AUTO_USERS, OU_AUTO_DISABLED_USERS } } } = require('../../config')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('ad-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    return dataPresent ? success('Har data') : error({ message: 'Mangler data 😬', solution: user.expectedType === 'employee' ? 'Rettes i Visma HRM' : 'Rettes i Visma InSchool' })
  }),
  test('ad-02', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i AD', () => {
    if (!dataPresent) return noData()
    if (!allData) return noData()
    if (user.expectedType === 'employee' && !allData.visma) return error({ message: 'Mangler data i Visma HRM', raw: { user, visma: allData.visma }, solution: 'Rettes i Visma HRM' })
    if (user.expectedType === 'student' && !allData.vis) return error({ message: 'Mangler data i Visma InSchool', raw: { user, vis: allData.vis }, solution: 'Rettes i Visma InSchool' })

    const data = {
      enabled: systemData.enabled
    }

    if (user.expectedType === 'employee') {
      data.visma = getActiveSourceData(allData.visma, user)
      if (systemData.enabled && data.visma.active) return success({ message: 'Kontoen er aktivert', raw: data })
      else if (systemData.enabled && !data.visma.active) return error({ message: 'Kontoen er aktivert selvom ansatt har sluttet', raw: data, solution: 'Rettes i Visma HRM' })
      else if (!systemData.enabled && data.visma.active) return warn({ message: 'Kontoen er deaktivert. Ansatt må aktivere sin konto', raw: data, solution: 'Ansatt må aktivere sin konto via minkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD' })
      else if (!systemData.enabled && !data.visma.active) return warn({ message: 'Kontoen er deaktivert', raw: data, solution: 'Rettes i Visma HRM' })
    } else {
      data.vis = getActiveSourceData(allData.vis, user)
      if (systemData.enabled && data.vis.student.active) return success({ message: 'Kontoen er aktivert', raw: data })
      else if (systemData.enabled && !data.vis.student.active) return error({ message: 'Kontoen er aktivert selvom elev har sluttet', raw: data, solution: 'Rettes i Visma InSchool' })
      else if (!systemData.enabled && data.vis.student.active) return warn({ message: 'Kontoen er deaktivert. Eleven må aktivere sin konto', raw: data, solution: 'Eleven må aktivere sin konto via minelevkonto.vtfk.no eller servicedesk kan gjøre det direkte i AD' })
      else if (!systemData.enabled && !data.vis.student.active) return warn({ message: 'Kontoen er deaktivert', raw: data, solution: 'Rettes i Visma InSchool' })
    }
  }),
  test('ad-03', 'Hvilken OU', 'Sjekker hvilken OU bruker ligger i', () => {
    if (!dataPresent) return noData()

    const data = {
      distinguishedName: systemData.distinguishedName
    }

    if (systemData.distinguishedName.toLowerCase().includes(OU_AUTO_USERS.toLowerCase())) return success({ message: `Bruker ligger i OU'en ${OU_AUTO_USERS.replace('OU=', '')}`, raw: data })
    else if (systemData.distinguishedName.toLowerCase().includes(OU_AUTO_DISABLED_USERS.toLowerCase())) return warn({ message: `Bruker ligger i OU'en ${OU_AUTO_DISABLED_USERS.replace('OU=', '')}`, raw: data, solution: user.expectedType === 'employee' ? 'Rettes i Visma HRM' : 'Rettes i Visma InSchool' })
  }),
  test('ad-04', 'Kontoen er ulåst', 'Sjekker at kontoen ikke er sperret for pålogging i AD', () => {
    if (!dataPresent) return noData()
    const data = {
      lockedOut: systemData.lockedOut
    }
    if (!systemData.lockedOut) return success({ message: 'Kontoen er ikke sperret for pålogging', raw: data })
    return error({ message: 'Kontoen er sperret for pålogging', raw: data, solution: 'Servicedesk må åpne brukerkontoen for pålogging i AD. Dette gjøres i Properties på brukerobjektet under fanen Account' })
  }),
  test('ad-05', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    if (!dataPresent) return noData()
    if (!systemData.userPrincipalName) return error({ message: 'UPN mangler 🤭', raw: systemData })
    const data = {
      userPrincipalName: systemData.userPrincipalName
    }
    if (user.expectedType === 'employee') return systemData.userPrincipalName.includes('@vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt', raw: data, solution: 'Sak meldes til arbeidsgruppe identitet' })
    else return systemData.userPrincipalName.includes('@skole.vtfk.no') ? success({ message: 'UPN (brukernavn til Microsoft 365) er korrekt', raw: data }) : error({ message: 'UPN (brukernavn til Microsoft 365) er ikke korrekt', raw: data, solution: 'Sak meldes til arbeidsgruppe identitet' })
  }),
  test('ad-06', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    if (!systemData.employeeNumber) return error({ message: 'Fødselsnummer mangler 🤭', raw: systemData })
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
      else return error({ message: 'Felt for lisens mangler 🤭', raw: systemData, solution: 'Meld sak til arbeidsgruppe identitet' })
    }
  }),
  test('ad-08', 'Har extensionAttribute4', 'Sjekker om bruker har extensionAttribute4', () => {
    if (!dataPresent) return noData()
    if (!systemData.extensionAttribute4) return noData()

    const data = {
      extensionAttribute4: systemData.extensionAttribute4.split(',').map(ext => ext.trim())
    }

    return warn({ message: `Er medlem av ${data.extensionAttribute4.length} personalrom- og ${data.extensionAttribute4.length === 0 || data.extensionAttribute4.length > 1 ? 'mailinglister' : 'mailingliste'} ekstra`, solution: 'extensionAttribute4 fører til medlemskap i personalrom- og mailinglister. Dersom dette ikke er ønskelig fjernes dette fra brukeren i AD', raw: data })
  })
])
