const { test, success, warn, error, waitForData, noData } = require('../../lib/test')
const { SYSTEMS } = require('../../config')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const { getActiveMemberships } = require('../vis/validator')
const isTeacher = require('../../lib/helpers/is-teacher')

const repackEntitlements = data => data.filter(entitlement => entitlement.startsWith('urn:mace:feide.no:go:group:u:')).map(entitlement => entitlement.replace('urn:mace:feide.no:go:group:u:', '').split(':')[2].replace('%2F', '/').toLowerCase())
const repackMemberships = data => data.filter(membership => membership.navn.includes('/')).map(membership => membership.navn.toLowerCase())

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('feide-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent) {
      if (user.expectedType === 'student') return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i Visma InSchool' })
      else if (!user.company || !user.title) return warn('Mangler data. Dessverre er det ikke nok informasjon tilstede på brukerobjektet for å kontrollere om dette er korrekt')
      else if (isTeacher(user.company, user.title)) return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i Visma InSchool' })
      else return success({ message: 'Det er ikke forventet FEIDE-konto på denne brukertypen', solution: 'Dersom det er behov for FEIDE-konto må bruker registreres i Visma InSchool eller meld sak til arbeidsgruppe identitet' })
    } else return success('Har data')
  }),
  test('feide-02', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    const data = {
      norEduPersonNIN: systemData.norEduPersonNIN || null,
      fnr: isValidFnr(systemData.norEduPersonNIN)
    }
    if (!systemData.norEduPersonNIN) return error({ message: 'Fødselsnummer mangler 🤭', raw: data })
    return data.fnr.valid ? success({ message: `Har gyldig ${data.fnr.type}`, raw: data }) : error({ message: data.fnr.error, raw: data })
  }),
  test('feide-03', 'Brukernavn er likt i AD', 'Sjekker at brukernavnet er likt i AD og FEIDE', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error('Mangler AD-data')

    if (!systemData.name) return error({ message: 'Brukernavn mangler 🤭', raw: systemData })
    const data = {
      feide: {
        name: systemData.name
      },
      ad: {
        samAccountName: allData.ad.samAccountName
      }
    }
    if (systemData.name === allData.ad.samAccountName) return success({ message: 'Brukernavn er likt i AD og FEIDE', raw: data })
    else return error({ message: 'Brukernavn er forskjellig i AD og FEIDE', raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
  }),
  test('feide-04', 'Har knytning til en skole', 'Sjekker at det finnes knytning til minst èn skole', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()

    const data = {
      eduPersonOrgUnitDN: systemData.eduPersonOrgUnitDN || null
    }
    if (!hasData(systemData.eduPersonOrgUnitDN)) {
      return hasData(allData.vis) ? warn({ message: 'Knytning til skole mangler 🤭', raw: data, solution: 'Dersom dette er en skoleansatt, må dette rettes i Visma InSchool' }) : success({ message: 'Ingen knytning til skole funnet. Dette er riktig da bruker ikke finnes i ViS', raw: data }) // TODO: Må sjekke at data faktisk kommer fra kildesystemet ViS
    }
    return success({ message: 'Knytning til skole funnet', raw: data })
  }),
  test('feide-05', 'Har satt opp Feide2Faktor', 'Sjekker at Feide2Faktor er satt opp', () => {
    if (!dataPresent) return noData()
    const data = {
      norEduPersonAuthnMethod: systemData.norEduPersonAuthnMethod.map(auth => auth.split(' ')[0])
    }
    if (!hasData(systemData.norEduPersonAuthnMethod)) {
      return user.expectedType === 'employee' ? error({ message: 'Feide2Faktor er ikke satt opp 🤭', raw: data, solution: 'Sett opp Feide2Faktor i vigobas-portal.vtfk.no' }) : success('Feide2Faktor er ikke satt opp, og heller ikke påkrevd for elever')
    }
    const smsAuth = systemData.norEduPersonAuthnMethod.filter(auth => auth.includes(SYSTEMS.FEIDE.MFA_SMS))
    const gaAuth = systemData.norEduPersonAuthnMethod.filter(auth => auth.includes(SYSTEMS.FEIDE.MFA_GA))
    const aadAuth = systemData.norEduPersonAuthnMethod.filter(auth => auth.includes(SYSTEMS.FEIDE.MFA_AAD))
    if (hasData(smsAuth)) return success({ message: 'Feide2Faktor for SMS er satt opp', raw: data })
    else if (hasData(gaAuth)) return success({ message: 'Feide2Faktor for Godkjenner/Authenticator app er satt opp', raw: data })
    else if (hasData(aadAuth)) return success({ message: 'Azure MFA brukes som 2faktor', raw: data })
    else return warn({ message: 'Feide2Faktor for noe annet enn SMS, Godkjenner/Authenticator app eller Azure MFA er satt opp', raw: data, solution: 'Spør en voksen' })
  }),
  test('feide-06', 'Har grupperettigheter', 'Sjekker at det er satt grupperettigheter', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.vis)) return success({ message: 'Ingen grupperettigheter funnet. Dette er riktig da bruker ikke finnes i ViS', raw: allData.vis })

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
      return hasData(activeMemberships) ? error({ message: 'Grupperettigheter mangler 🤭', raw: data, solution: 'Rettes i Visma InSchool' }) : success({ message: 'Ingen grupperettigheter funnet. Dette er riktig da bruker ikke har noen grupper i ViS', raw: data })
    } else {
      const missingEntitlements = repackedMemberships.filter(membership => !repackedEntitlements.includes(membership))
      if (hasData(missingEntitlements)) {
        data.missingEntitlements = missingEntitlements
        return error({ message: `Mangler ${missingEntitlements.length} grupperettighet${missingEntitlements.length > 1 ? 'er' : ''} 🤭`, raw: data, solution: 'Rettes i Visma InSchool' })
      } else return success({ message: 'Grupperettigheter er riktig', raw: data })
    }
  }),
  test('feide-07', 'Har dobbel konto', 'Har elev- og ansattkonto', () => {
    if (!dataPresent) return noData()

    if (systemData.eduPersonAffiliation.includes('student') && systemData.eduPersonAffiliation.includes('employee')) return warn({ message: 'Har både elev- og ansattkonto. FEIDE-konto er registrert på elevkonto med doble roller', raw: { eduPersonAffiliation: systemData.eduPersonAffiliation } })
    return noData()
  })
])
