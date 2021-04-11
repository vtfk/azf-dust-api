const { test, success, error, warn, noData } = require('../../lib/test')
const { SYSTEMS } = require('../../config')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('ad-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    return dataPresent ? success('Har data') : error('Mangler data 😬') // TODO: MÅ sjekkes om bruker skal ha AD-objekt via PIFU eller Visma
  }),
  test('ad-02', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i AD', () => {
    if (!dataPresent) return noData()
    const data = {
      enabled: systemData.enabled
    }
    if (systemData.enabled) return success('Kontoen er aktivert', data)
    return error('Kontoen er deaktivert', data)
  }),
  test('ad-03', 'Kontoen er ulåst', 'Sjekker at kontoen ikke er sperret for pålogging i AD', () => {
    if (!dataPresent) return noData()
    const data = {
      lockedOut: systemData.lockedOut
    }
    if (!systemData.lockedOut) return success('Kontoen er ikke sperret for pålogging', data)
    return error('Kontoen er sperret for pålogging', data)
  }),
  test('ad-04', 'UPN er lik e-postadressen', 'Sjekker at UPN-et er lik e-postadressen i AD', () => {
    if (!dataPresent) return noData()
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', systemData)
    const data = {
      mail: systemData.mail,
      userPrincipalName: systemData.userPrincipalName
    }
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase() ? success('UPN er lik e-postadressen', data) : error('UPN er ikke lik e-postadressen', data)
  }),
  test('ad-05', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    if (!dataPresent) return noData()
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', systemData)
    const data = {
      userPrincipalName: systemData.userPrincipalName
    }
    if (user.expectedType === 'employee') return systemData.userPrincipalName.includes('@vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
    else return systemData.userPrincipalName.includes('@skole.vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
  }),
  test('ad-06', 'OU er korrekt', 'Sjekker at bruker ligger i riktig OU', () => {
    if (!dataPresent) return noData()
    const data = {
      distinguishedName: systemData.distinguishedName
    }
    if (user.expectedType === 'employee') {
      if (systemData.enabled) return systemData.distinguishedName.includes(SYSTEMS.AD.EMPLOYEE_ENABLED_OU) ? success('OU er korrekt', data) : error('OU er ikke korrekt', { ...data, expectedOU: SYSTEMS.AD.EMPLOYEE_ENABLED_OU })
      else return systemData.distinguishedName.includes(SYSTEMS.AD.EMPLOYEE_DISABLED_OU) ? success('OU er korrekt', data) : error('OU er ikke korrekt', { ...data, expectedOU: SYSTEMS.AD.EMPLOYEE_DISABLED_OU })
    } else {
      if (systemData.enabled) return systemData.distinguishedName.includes(SYSTEMS.AD.STUDENT_ENABLED_OU) ? success('OU er korrekt', data) : error('OU er ikke korrekt', { ...data, expectedOU: SYSTEMS.AD.STUDENT_ENABLED_OU })
      else return systemData.distinguishedName.includes(SYSTEMS.AD.STUDENT_DISABLED_OU) ? success('OU er korrekt', data) : error('OU er ikke korrekt', { ...data, expectedOU: SYSTEMS.AD.STUDENT_DISABLED_OU })
    }
  }),
  test('ad-07', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    if (!systemData.employeeNumber) return error('Fødselsnummer mangler 🤭', systemData)
    const data = {
      employeeNumber: systemData.employeeNumber,
      fnr: isValidFnr(systemData.employeeNumber)
    }
    return data.fnr.valid ? success(`Har gyldig ${data.fnr.type}`, data) : error(data.fnr.error, data)
  }),
  test('ad-08', 'extensionAttribute6 er satt', 'Sjekker at extensionAttribute6 er satt', () => {
    if (!dataPresent) return noData()
    const data = {
      extensionAttribute6: systemData.extensionAttribute6
    }
    if (user.expectedType === 'employee') return hasData(systemData.extensionAttribute6) ? success('extensionAttribute6 er satt', data) : error('extensionAttribute6 mangler 🤭', data)
    else return hasData(systemData.extensionAttribute6) ? warn('extensionAttribute6 er satt på en elev. Elever trenger ikke denne', data) : success('extensionAttribute6 er ikke satt, men siden dette er en elev er det helt normalt', systemData)
  }),
  test('ad-09', 'Har kun èn primær e-postadresse', 'Sjekker at brukeren har kun èn primær e-postadresse', () => {
    if (!dataPresent) return noData()
    const data = {
      proxyAddresses: systemData.proxyAddresses,
      primary: systemData.proxyAddresses.filter(address => address.startsWith('SMTP:'))
    }
    if (user.expectedType === 'employee') {
      if (data.primary.length === 1) return success('Har kun 1 primær e-postadresse', data)
      else return error(`Har ${data.primary.length} primær e-postadresser`, data)
    } else {
      if (data.primary.length === 0) return success('Har ingen primær e-postadresse, men siden dette er en elev er dette korrekt. Mail-attributtet vil være gjeldende', { ...data, mail: systemData.mail })
      else if (data.primary.length === 1) return success('Har 1 primær e-postadresse, dette er også korrekt for en elev', data)
      else return error(`Har ${data.primary.length} primær e-postadresser`, data)
    }
  })
])
