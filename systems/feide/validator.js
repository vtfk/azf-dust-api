const { test, success, warn, error, noData } = require('../../lib/test')
const { SYSTEMS } = require('../../config')
const isPwdLastSet = require('../../lib/helpers/is-pwd-within-timerange')

module.exports = (systemData, user, allData = false) => ([
  test('feide-01', 'Kontoen er aktivert', 'Sjekker at kontoen er aktivert i FEIDE', () => {
    const data = {
      enabled: systemData.enabled
    }
    if (systemData.enabled) return success('Kontoen er aktivert', data)
    return error('Kontoen er deaktivert', data)
  }),
  test('feide-02', 'Kontoen er ulåst', 'Sjekker at kontoen ikke er sperret for pålogging i FEIDE', () => {
    const data = {
      lockedOut: systemData.lockedOut
    }
    if (!systemData.lockedOut) return success('Kontoen er ikke sperret for pålogging', data)
    return error('Kontoen er sperret for pålogging', data)
  }),
  test('feide-03', 'Fødselsnummer er angitt', 'Sjekker at fødselsnummeret er angitt', () => {
    if (!systemData.norEduPersonNIN) return error('Fødselsnummer mangler 🤭', systemData)
    const data = {
      norEduPersonNIN: systemData.norEduPersonNIN
    }
    return success('Fødselsnummer er angitt', data)
  }),
  test('feide-04', 'Fødselsnummer er korrekt lengde', 'Sjekker at fødselsnummeret er 11 tegn', () => {
    if (!systemData.norEduPersonNIN) return error('Fødselsnummer mangler 🤭', systemData)
    const data = {
      norEduPersonNIN: systemData.norEduPersonNIN
    }
    if (systemData.norEduPersonNIN.length === 11) return success('Fødselsnummer er korrekt lengde', data)
    else return error('Fødselsnummer er ikke korrekt lengde', data)
  }),
  test('feide-05', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og FEIDE', () => {
    if (!allData) return noData('Venter på data...')
    if (!allData.ad) return error('Mangler AD-data', allData)

    const data = {
      feide: {
        norEduPersonNIN: systemData.norEduPersonNIN
      },
      ad: {
        employeeNumber: allData.ad.employeeNumber
      }
    }
    if (systemData.norEduPersonNIN === allData.ad.employeeNumber) return success('Fødselsnummer er likt i AD og FEIDE', data)
    else return error('Fødselsnummer er forskjellig i AD og FEIDE', data)
  }),
  ,
  test('feide-06', 'Passord synkronisert til FEIDE', 'Sjekker at passordet er synkronisert til FEIDE innenfor 5 minutter', () => {
    if (!allData) return noData('Venter på data...')
    if (!allData.ad) return error('Mangler AD-data', allData)

    const pwdAd = new Date(allData.ad.pwdLastSet)
    const pwdFeide = new Date(systemData.passwordLastSet)
    const isPwdOk = isPwdLastSet(pwdAd, pwdFeide)
    const data = {
      feide: {
        passwordLastSet: allData.feide.passwordLastSet
      },
      ad: {
        pwdLastSet: systemData.pwdLastSet
      },
      seconds: isPwdOk.seconds
    }
    if (isPwdOk.result) return success('Passord synkronisert til FEIDE', data)
    else return error('Passord ikke synkronisert til FEIDE', data)
  }),
  test('feide-07', 'Brukernavn er angitt', 'Sjekker at brukernavnet er angitt', () => {
    if (!systemData.name) return error('Brukernavn mangler 🤭', systemData)
    const data = {
      name: systemData.name
    }
    return success('Brukernavn er angitt', data)
  }),
  test('feide-08', 'Brukernavn er likt i AD', 'Sjekker at brukernavnet er likt i AD og FEIDE', () => {
    if (!allData) return noData('Venter på data...')
    if (!allData.ad) return error('Mangler AD-data', allData)

    if (!systemData.name) return error('Brukernavn mangler 🤭', systemData)
    const data = {
      feide: {
        name: systemData.name
      },
      ad: {
        samAccountName: allData.ad.samAccountName
      }
    }
    if (systemData.name === allData.ad.samAccountName) return success('Brukernavn er likt i AD og FEIDE', data)
    else return error('Brukernavn er forskjellig i AD og FEIDE', data)
  }),
  test('feide-09', 'UID er angitt', 'Sjekker at UID er angitt', () => {
    if (!systemData.uid) return error('UID mangler 🤭', systemData)
    const data = {
      uid: systemData.uid
    }
    if (systemData.uid.length === 1) return success('UID er angitt', data)
    else if (systemData.uid.length > 1) return error('UID skal bare inneholde ett brukernavn', data)
    else return error('UID er ikke angitt', data)
  }),
  test('feide-10', 'UID er likt brukernavn', 'Sjekker at UID er likt brukernavn', () => {
    if (!systemData.uid) return error('UID mangler 🤭', systemData)
    const data = {
      uid: systemData.uid,
      name: systemData.name
    }
    if (systemData.uid.length === 1 && systemData.uid[0] === systemData.name) return success('UID er likt brukernavn', data)
    else if (systemData.uid.length > 1) return error('UID skal bare inneholde ett brukernavn', data)
    else return error('UID er ikke angitt', data)
  }),
  test('feide-11', 'PrincipalName er satt', 'Sjekker at PrincipalName er satt', () => {
    if (!systemData.eduPersonPrincipalName) return error('PrincipalName mangler 🤭', systemData)
    const data = {
      eduPersonPrincipalName: systemData.eduPersonPrincipalName
    }
    return success('PrincipalName er satt', data)
  }),
  test('feide-12', `PrincipalName er lik "uid${SYSTEMS.FEIDE.PRINCIPAL_NAME}"`, `Sjekker at PrincipalName er lik "uid${SYSTEMS.FEIDE.PRINCIPAL_NAME}"`, () => {
    if (!systemData.eduPersonPrincipalName === `${systemData.name}${SYSTEMS.FEIDE.PRINCIPAL_NAME}`) return error('PrincipalName er feil 🤭', systemData)
    const data = {
      eduPersonPrincipalName: systemData.eduPersonPrincipalName
    }
    return success('PrincipalName er riktig', data)
  }),
  test('feide-13', 'E-postadresse er lik UPN', 'Sjekker at e-postadresse er lik UPN', () => {
    if (!allData) return noData('Venter på data...')
    if (!allData.ad) return error('Mangler AD-data', allData)

    const data = {
      feide: {
        mail: systemData.mail
      },
      ad: {
        userPrincipalName: allData.ad.userPrincipalName
      }
    }
    if (systemData.mail === allData.ad.userPrincipalName) return success('E-postadresse er lik UPN', data)
    else return error('E-postadresse er ikke lik UPN', data)
  }),
  test('feide-14', 'Har knyttning til en skole', 'Sjekker at det finnes knyttning til minst èn skole', () => {
    if (!systemData.eduPersonOrgUnitDN) return error('Knyttning til skole mangler 🤭', systemData)
    const data = {
      eduPersonOrgUnitDN: systemData.eduPersonOrgUnitDN
    }
    if (systemData.eduPersonOrgUnitDN.length > 0) return success('Knyttning til skole funnet', data)
    else return warn('Ingen knyttning til skole funnet. Dersom dette er en manuelt opprettet FEIDE-bruker eller en administrativ ansatt, er dette korrekt', data)
  }),
  test('feide-15', 'Har satt opp MFA', 'Sjekker at MFA er satt opp', () => {
    if (!systemData.norEduPersonAuthnMethod) return error('MFA mangler 🤭', systemData)
    const data = {
      norEduPersonAuthnMethod: systemData.norEduPersonAuthnMethod
    }
    if (systemData.norEduPersonAuthnMethod.length > 0) {
      const smsAuth = systemData.norEduPersonAuthnMethod.map(auth => auth.includes('urn:mace:feide.no:auth:method:sms'))
      const gaAuth = systemData.norEduPersonAuthnMethod.map(auth => auth.includes('urn:mace:feide.no:auth:method:ga'))
      if (smsAuth.length > 0 && gaAuth.length > 0) return success('MFA for SMS og Godkjenner/Authenticator app er satt opp', data)
      else if (smsAuth.length > 0 && gaAuth.length === 0) return success('MFA for SMS er satt opp', data)
      else if (smsAuth.length === 0 && gaAuth.length > 0) return success('MFA for Godkjenner/Authenticator app er satt opp', data)
      else return error('MFA for noe annet enn SMS og Godkjenner/Authenticator app er satt opp', data)
    } else return error('MFA er ikke satt opp', data)
  }),
  test('feide-16', 'Organisasjon er riktig', 'Sjekker at organisasjon er riktig', () => {
    if (!systemData.eduPersonOrgDN) return error('Organisasjon mangler 🤭', systemData)
    const data = {
      eduPersonOrgDN: systemData.eduPersonOrgDN,
      expectedOrgDN: SYSTEMS.FEIDE.ORGANIZATION_DN
    }
    if (systemData.eduPersonOrgDN === SYSTEMS.FEIDE.ORGANIZATION_DN) return success('Organisasjon er riktig', data)
    else return error('Organisasjon er ikke riktig', data)
  }),
  test('feide-17', 'Har riktig tilhørighet', 'Sjekker at det er satt riktig tilhørighet', () => {
    if (!systemData.eduPersonAffiliation) return error('Tilhørighet mangler 🤭', systemData)
    const data = {
      eduPersonAffiliation: systemData.eduPersonAffiliation
    }
    if (user.expectedType === 'employee') {
      if (systemData.eduPersonAffiliation.includes('member') && systemData.eduPersonAffiliation.includes(user.expectedType)) return success('Tilhørighet er riktig', data)
      else if (systemData.eduPersonAffiliation.includes('member') && systemData.eduPersonAffiliation.includes('student')) return warn('Tilhørighet er satt som en elev til tross for at dette er en ansatt', data)
      else return error('Tilhørighet er feil', data)
    } else {
      if (systemData.eduPersonAffiliation.includes('member') && systemData.eduPersonAffiliation.includes(user.expectedType)) return success('Tilhørighet er riktig', data)
      else if (systemData.eduPersonAffiliation.includes('member') && systemData.eduPersonAffiliation.includes('employee')) return warn('Tilhørighet er satt som en ansatt til tross for at dette er en elev', data)
      else return error('Tilhørighet er feil', data)
    }
  })
])

