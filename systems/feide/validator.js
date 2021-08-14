const { test, success, warn, error, waitForData, noData } = require('../../lib/test')
const { SYSTEMS } = require('../../config')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const { getActiveMemberships } = require('../vis/validator')
const isTeacher = require('../../lib/helpers/is-teacher')
const isSchoolEmployee = require('../../lib/helpers/is-school-employee')

const repackEntitlements = data => data.filter(entitlement => entitlement.startsWith('urn:mace:feide.no:go:group:u:')).map(entitlement => entitlement.replace('urn:mace:feide.no:go:group:u:', '').split(':')[2].replace('%2F', '/').toLowerCase())
const repackMemberships = data => data.filter(membership => membership.navn.includes('/')).map(membership => membership.navn.toLowerCase())

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('feide-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent) {
      if (user.expectedType === 'student') return error('Mangler data 😬', systemData)
      else if (!user.company || !user.title) return warn('Mangler data. Dessverre er det ikke nok informasjon tilstede på brukerobjektet for å kontrollere om dette er korrekt')
      else if (isTeacher(user.company, user.title)) return error('Mangler data 😬', systemData)
      else if (isSchoolEmployee(user)) return warn('Data mangler til tross for skoletilhørighet 😬', systemData)
      else return success('Bruker har ikke data i dette systemet')
    } else return success('Har data')
  }),
  test('feide-02', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    const data = {
      norEduPersonNIN: systemData.norEduPersonNIN || null,
      fnr: isValidFnr(systemData.norEduPersonNIN)
    }
    if (!systemData.norEduPersonNIN) return error('Fødselsnummer mangler 🤭', data)
    return data.fnr.valid ? success(`Har gyldig ${data.fnr.type}`, data) : error(data.fnr.error, data)
  }),
  test('feide-03', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og FEIDE', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error('Mangler AD-data', allData)

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
  test('feide-04', 'Brukernavn er angitt', 'Sjekker at brukernavnet er angitt', () => {
    if (!dataPresent) return noData()
    const data = {
      name: systemData.name || null
    }
    if (!systemData.name) return error('Brukernavn mangler 🤭', data)
    return success('Brukernavn er angitt', data)
  }),
  test('feide-05', 'Brukernavn er likt i AD', 'Sjekker at brukernavnet er likt i AD og FEIDE', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error('Mangler AD-data', allData)

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
  test('feide-06', 'UID er angitt', 'Sjekker at UID er angitt', () => {
    if (!dataPresent) return noData()
    const data = {
      uid: systemData.uid || null
    }
    if (!hasData(systemData.uid)) return error('UID mangler 🤭', data)
    if (systemData.uid.length === 1) return success('UID er angitt', data)
    else if (systemData.uid.length > 1) return error('UID skal bare inneholde ett brukernavn', data)
    else return error('UID er ikke angitt', data)
  }),
  test('feide-07', 'UID er likt brukernavn', 'Sjekker at UID er likt brukernavn', () => {
    if (!dataPresent) return noData()
    const data = {
      uid: systemData.uid || null,
      name: systemData.name || null
    }
    if (!hasData(systemData.uid)) return error('UID mangler 🤭', data)
    if (systemData.uid.length === 1 && systemData.uid[0] === systemData.name) return success('UID er likt brukernavn', data)
    else if (systemData.uid.length > 1) return error('UID skal bare inneholde ett brukernavn', data)
    else return error('UID er ikke angitt', data)
  }),
  test('feide-08', 'PrincipalName er satt', 'Sjekker at PrincipalName er satt', () => {
    if (!dataPresent) return noData()
    const data = {
      eduPersonPrincipalName: systemData.eduPersonPrincipalName || null
    }
    if (!systemData.eduPersonPrincipalName) return error('PrincipalName mangler 🤭', data)
    return success('PrincipalName er satt', data)
  }),
  test('feide-09', `PrincipalName er lik 'uid${SYSTEMS.FEIDE.PRINCIPAL_NAME}'`, `Sjekker at PrincipalName er lik 'uid${SYSTEMS.FEIDE.PRINCIPAL_NAME}'`, () => {
    if (!dataPresent) return noData()
    const data = {
      eduPersonPrincipalName: systemData.eduPersonPrincipalName,
      expectedPersonPrincipalName: `${systemData.name}${SYSTEMS.FEIDE.PRINCIPAL_NAME}`
    }
    return systemData.eduPersonPrincipalName !== `${systemData.name}${SYSTEMS.FEIDE.PRINCIPAL_NAME}` ? error('PrincipalName er feil 🤭', data) : success('PrincipalName er riktig', data)
  }),
  test('feide-10', 'E-postadresse er lik UPN', 'Sjekker at e-postadresse er lik UPN', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error('Mangler AD-data', allData)

    const data = {
      feide: {
        mail: systemData.mail
      },
      ad: {
        userPrincipalName: allData.ad.userPrincipalName
      }
    }
    if (!systemData.mail) return warn('Kontoen må aktiveres før bruker får mailadresse', data)
    else if (systemData.mail === allData.ad.userPrincipalName) return success('E-postadresse er lik UPN', data)
    else return error('E-postadresse er ikke lik UPN', data)
  }),
  test('feide-11', 'Har knytning til en skole', 'Sjekker at det finnes knytning til minst èn skole', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()

    const data = {
      eduPersonOrgUnitDN: systemData.eduPersonOrgUnitDN || null
    }
    if (!hasData(systemData.eduPersonOrgUnitDN)) {
      return hasData(allData.vis) ? error('Knytning til skole mangler 🤭', data) : success('Ingen knytning til skole funnet. Dette er riktig da bruker ikke finnes i ViS', data)
    }
    return success('Knytning til skole funnet', data)
  }),
  test('feide-12', 'Har satt opp Feide2Faktor', 'Sjekker at Feide2Faktor er satt opp', () => {
    if (!dataPresent) return noData()
    const data = {
      norEduPersonAuthnMethod: systemData.norEduPersonAuthnMethod.map(auth => auth.split(' ')[0])
    }
    if (!hasData(systemData.norEduPersonAuthnMethod)) {
      return user.expectedType === 'employee' ? error('Feide2Faktor er ikke satt opp 🤭', data) : success('Feide2Faktor er ikke satt opp, og heller ikke påkrevd for elever')
    }
    const smsAuth = systemData.norEduPersonAuthnMethod.filter(auth => auth.includes(SYSTEMS.FEIDE.MFA_SMS))
    const gaAuth = systemData.norEduPersonAuthnMethod.filter(auth => auth.includes(SYSTEMS.FEIDE.MFA_GA))
    if (hasData(smsAuth) && hasData(gaAuth)) return success('Feide2Faktor for SMS og Godkjenner/Authenticator app er satt opp', data)
    else if (hasData(smsAuth) && !hasData(gaAuth)) return success('Feide2Faktor for SMS er satt opp', data)
    else if (!hasData(smsAuth) && hasData(gaAuth)) return success('Feide2Faktor for Godkjenner/Authenticator app er satt opp', data)
    else return warn('Feide2Faktor for noe annet enn SMS og Godkjenner/Authenticator app er satt opp', data)
  }),
  test('feide-13', 'Organisasjon er riktig', 'Sjekker at organisasjon er riktig', () => {
    if (!dataPresent) return noData()
    const data = {
      eduPersonOrgDN: systemData.eduPersonOrgDN || null,
      expectedOrgDN: SYSTEMS.FEIDE.ORGANIZATION_DN
    }
    if (!hasData(systemData.eduPersonOrgDN)) return error('Organisasjon mangler 🤭', data)
    return systemData.eduPersonOrgDN === SYSTEMS.FEIDE.ORGANIZATION_DN ? success('Organisasjon er riktig', data) : error('Organisasjon er ikke riktig', data)
  }),
  test('feide-14', 'Har riktig tilhørighet', 'Sjekker at det er satt riktig tilhørighet', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()

    const data = {
      eduPersonAffiliation: systemData.eduPersonAffiliation || null
    }
    if (!hasData(systemData.eduPersonAffiliation)) return error('Tilhørighet mangler 🤭', data)
    if (systemData.eduPersonAffiliation.includes('member') && systemData.eduPersonAffiliation.includes(user.expectedType)) return success('Tilhørighet er riktig', data)
    if (user.expectedType === 'employee') {
      return systemData.eduPersonAffiliation.includes('member') && systemData.eduPersonAffiliation.includes('student') ? warn('Tilhørighet er satt som en elev til tross for at dette er en ansatt', data) : error('Tilhørighet er feil', data)
    } else {
      return systemData.eduPersonAffiliation.includes('member') && systemData.eduPersonAffiliation.includes('employee') ? warn('Tilhørighet er satt som en ansatt til tross for at dette er en elev', data) : error('Tilhørighet er feil', data)
    }
  }),
  test('feide-15', 'Har grupperettigheter', 'Sjekker at det er satt grupperettigheter', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.vis)) return success('Ingen grupperettigheter funnet. Dette er riktig da bruker ikke finnes i ViS', allData.vis)

    const repackedEntitlements = repackEntitlements(systemData.eduPersonEntitlement)
    const activeMemberships = getActiveMemberships(allData.vis)
    const repackedMemberships = repackMemberships(activeMemberships)
    const data = {
      feide: {
        eduPersonEntitlement: systemData.eduPersonEntitlement || null
      },
      vis: {
        activeMemberships
      }
    }
    if (!hasData(systemData.eduPersonEntitlement)) {
      return hasData(activeMemberships) ? error('Grupperettigheter mangler 🤭', data) : success('Ingen grupperettigheter funnet. Dette er riktig da bruker ikke har noen grupper i ViS', data)
    } else {
      const missingEntitlements = repackedMemberships.filter(membership => !repackedEntitlements.includes(membership))
      if (hasData(missingEntitlements)) {
        data.missingEntitlements = missingEntitlements
        return error(`Mangler ${missingEntitlements.length} grupperettighet${missingEntitlements.length > 1 ? 'er' : ''} 🤭`, data)
      } else return success('Grupperettigheter er riktig', data)
    }
  })
])
