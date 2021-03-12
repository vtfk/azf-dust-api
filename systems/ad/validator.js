const { test, success, error, noData } = require('../../lib/test')

const isPwdLastSet = (pwdOne, pwdTwo) => {
  // should be last set between 0 and 15 seconds
  const diff = 15
  const pwdLastDiff = (pwdTwo - pwdOne) / 1000
  return {
    result: (pwdLastDiff > 0 && pwdLastDiff <= diff),
    seconds: pwdLastDiff
  }
}

module.exports = (systemData, user, allData = false) => ([
  test('ad-01', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i AD', () => {
    const data = {
      enabled: systemData.enabled
    }
    if (systemData.enabled) return success('Kontoen er aktivert', data)
    return error('Kontoen er deaktivert', data)
  }),
  test('ad-02', 'Kontoen er ulåst', 'Sjekker at kontoen ikke er sperret for pålogging i AD', () => {
    const data = {
      lockedOut: systemData.lockedOut
    }
    if (!systemData.lockedOut) return success('Kontoen er ikke sperret for pålogging', data)
    return error('Kontoen er sperret for pålogging', data)
  }),
  test('ad-03', 'UPN er lik e-postadressen', 'Sjekker at UPN-et er lik e-postadressen i AD', () => {
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', systemData)
    const data = {
      mail: systemData.mail,
      userPrincipalName: systemData.userPrincipalName
    }
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase() ? success('UPN er lik e-postadressen', data) : error('UPN er ikke lik e-postadressen', data)
  }),
  test('ad-04', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', systemData)
    const data = {
      userPrincipalName: systemData.userPrincipalName
    }
    if (user.expectedType === 'employee') return systemData.userPrincipalName.includes('@vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
    else return systemData.userPrincipalName.includes('@skole.vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
  }),
  test('ad-05', 'OU er korrekt', 'Sjekker at bruker ligger i riktig OU', () => {
    const data = {
      distinguishedName: systemData.distinguishedName
    }
    if (user.expectedType === 'employee') {
      if (systemData.enabled) return systemData.distinguishedName.includes('OU=AUTO USERS,OU=USERS,OU=VTFK,DC=login,DC=top,DC=no') ? success('OU er korrekt', data) : error('OU er ikke korrekt', data)
      else return systemData.distinguishedName.includes('OU=AUTO DISABLED USER,OU=USERS,OU=VTFK,DC=login,DC=top,DC=no') ? success('OU er korrekt', data) : error('OU er ikke korrekt', data)
    } else {
      if (systemData.enabled) return systemData.distinguishedName.includes('OU=AUTO USERS,OU=USERS,OU=VTFK,DC=skole,DC=top,DC=no') ? success('OU er korrekt', data) : error('OU er ikke korrekt', data)
      else return systemData.distinguishedName.includes('OU=AUTO DISABLED USER,OU=USERS,OU=VTFK,DC=skole,DC=top,DC=no') ? success('OU er korrekt', data) : error('OU er ikke korrekt', data)
    }
  }),
  test('ad-05', 'Fødselsnummer er korrekt lengde', 'Sjekker at fødselsnummeret er 11 tegn', () => {
    if (!systemData.employeeNumber) return error('Fødselsnummer mangler 🤭', systemData)
    const data = {
      employeeNumber: systemData.employeeNumber
    }
    if (systemData.employeeNumber.length === 11) return success('Fødselsnummer er korrekt lengde', data)
    else return error('Fødselsnummer er ikke korrekt lengde', data)
  }),
  test('ad-06', 'extensionAttribute6 er satt', 'Sjekker at extensionAttribute6 er satt', () => {
    const data = {
      extensionAttribute6: systemData.extensionAttribute6
    }
    if (systemData.extensionAttribute6) return success('extensionAttribute6 er satt', data)
    else return error('extensionAttribute6 mangler 🤭', data)
  }),
  test('ad-07', 'Har kun èn primær e-postadresse', 'Sjekker at brukeren har kun èn primær e-postadresse', () => {
    const data = {
      proxyAddresses: systemData.proxyAddresses,
      primary: systemData.proxyAddresses.filter(address => address.startsWith('SMTP:'))
    }
    if (user.expectedType === 'employee') {
      if (data.primary.length === 1) return success('Har kun 1 primær e-postadresse', data)
      else return error(`Har ${data.primary.length} primær e-postadresser`, data)
    } else {
      if (data.primary.length === 0) return success('Har ingen primær e-postadresse, men siden dette er en elev er dette korrekt', data)
      else if (data.primary.length === 1) return success('Har 1 primær e-postadresse, dette er også korrekt for en elev', data)
      else return error(`Har ${data.primary.length} primær e-postadresser`, data)
    }
  }),
  test('ad-08', 'Passord synkronisert til FEIDE', 'Sjekker at passordet er synkronisert til FEIDE innenfor 5 minutter', () => {
    if (!allData) return noData('Venter på data...')
    if (!allData.feide) return error('Mangler feide-data', allData)

    const pwdAd = new Date(systemData.pwdLastSet)
    const pwdFeide = new Date(allData.feide.passwordLastSet)
    const isPwdOk = isPwdLastSet(pwdAd, pwdFeide)
    const data = {
      ad: {
        pwdLastSet: systemData.pwdLastSet
      },
      feide: {
        passwordLastSet: allData.feide.passwordLastSet
      },
      seconds: isPwdOk.seconds
    }
    if (isPwdOk.result) return success('Passord synkronisert til FEIDE', data)
    else return error('Passord ikke synkronisert til FEIDE', data)
  })
])
