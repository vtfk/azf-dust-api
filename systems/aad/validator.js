const { test, success, error } = require('../../lib/test')

module.exports = (systemData, user, allData = false) => ([
  test('aad-01', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i Azure AD', () => {
    const data = {
      accountEnabled: systemData.accountEnabled
    }
    if (systemData.accountEnabled) return success('Kontoen er aktivert', data)
    return error('Kontoen er deaktivert', data)
  }),
  test('aad-02', 'UPN er lik e-postadressen', 'Sjekker at UPN-et er lik e-postadressen i AD', () => {
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', systemData)
    const data = {
      mail: systemData.mail,
      userPrincipalName: systemData.userPrincipalName
    }
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase() ? success('UPN er lik e-postadressen', data) : error('UPN er ikke lik e-postadressen', data)
  }),
  test('aad-03', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', systemData)
    const data = {
      userPrincipalName: systemData.userPrincipalName
    }
    if (user.expectedType === 'employee') return systemData.userPrincipalName.includes('@vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
    else return systemData.userPrincipalName.includes('@skole.vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
  })
])
