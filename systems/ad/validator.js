const { test, success, error, noData } = require('../../lib/test')

module.exports = (systemData, metadata, allData = false) => ([
  test('ad-01', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i AD', () => {
    if (systemData.enabled) return success('Kontoen er aktivert', { enabled: systemData.enabled })
    return error('Kontoen er deaktivert', { enabled: systemData.enabled })
  }),
  test('ad-02', 'Kontoen er ulåst', 'Sjekker at kontoen ikke er sperret for pålogging i AD', () => {
    if (!systemData.lockedOut) return success('Kontoen er ikke sperret for pålogging', { lockedOut: systemData.lockedOut })
    return error('Kontoen er sperret for pålogging', { lockedOut: systemData.lockedOut })
  }),
  test('ad-03', 'UPN er lik e-postadressen', 'Sjekker at UPN-et er lik e-postadressen i AD', () => {
    if (!systemData.userPrincipalName) return error('No UPN', systemData)
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase()
  }),
  test('ad-04', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    if (!systemData.userPrincipalName) return error('No UPN', systemData)

    if (!allData) return noData('Venter på data...')
    if (metadata.expectedType === 'employee') {
      return systemData.userPrincipalName.includes('@vtfk.no')
    } else {
      return systemData.userPrincipalName.includes('@skole.vtfk.no')
    }
  })
])
