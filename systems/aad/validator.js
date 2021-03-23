const { test, success, error } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isPwdLastSet = require('../../lib/helpers/is-pwd-within-timerange')

module.exports = (systemData, user, allData = false) => ([
  test('aad-01', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i Azure AD', () => {
    const data = {
      accountEnabled: systemData.accountEnabled
    }
    if (systemData.accountEnabled) return success('Kontoen er aktivert', data)
    return error('Kontoen er deaktivert', data)
  }),
  test('aad-02', 'UPN er lik e-postadressen', 'Sjekker at UPN-et er lik e-postadressen i AD', () => {
    const data = {
      mail: systemData.mail || null,
      userPrincipalName: systemData.userPrincipalName || null
    }
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', data)
    return systemData.userPrincipalName.toLowerCase() === systemData.mail.toLowerCase() ? success('UPN er lik e-postadressen', data) : error('UPN er ikke lik e-postadressen', data)
  }),
  test('aad-03', 'UPN er korrekt', 'Sjekker at UPN er @vtfk.no for ansatte, og @skole.vtfk.no for elever', () => {
    const data = {
      userPrincipalName: systemData.userPrincipalName || null
    }
    if (!systemData.userPrincipalName) return error('UPN mangler 🤭', data)
    if (user.expectedType === 'employee') return systemData.userPrincipalName.includes('@vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
    else return systemData.userPrincipalName.includes('@skole.vtfk.no') ? success('UPN er korrekt', data) : error('UPN er ikke korrekt', data)
  }),
  test('aad-04', 'Passord synkronisert til Azure AD', 'Sjekker at passordet er synkronisert til Azure AD innenfor 15 sekunder', () => {
    if (!allData) return noData('Venter på data...')
    if (!hasData(allData.ad)) return error('Mangler AD-data', allData)
    const pwdCheck = isPwdLastSet(new Date(allData.ad.pwdLastSet), new Date(systemData.lastPasswordChangeDateTime))
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
  })
])
