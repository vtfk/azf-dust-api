const { test, success, warn, error, waitForData, noData } = require('../../lib/test')
const { SYSTEMS } = require('../../config')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const { getActiveMemberships } = require('../vis/validator')
const { isApprentice, isOT, isStudent, isTeacher } = require('../../lib/helpers/is-type')
const systemNames = require('../../lib/data/systems.json')

const repackEntitlements = data => data.filter(entitlement => entitlement.startsWith('urn:mace:feide.no:go:group:u:')).map(entitlement => entitlement.replace('urn:mace:feide.no:go:group:u:', '').split(':')[2].replace('%2F', '/').toLowerCase())
const repackMemberships = data => data.filter(membership => membership.navn.includes('/')).map(membership => membership.navn.toLowerCase())

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('feide-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent) {
      if (user.expectedType === 'student') {
        if (isStudent(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: `Rettes i ${systemNames.vis}` })
        if (isApprentice(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: `Rettes i ${systemNames.vigolaerling}` })
        if (isOT(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: `Rettes i ${systemNames.vigoot}` })
      } else if (isTeacher(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: `Rettes i ${systemNames.vis}` })
      else return success({ message: `Det er ikke forventet ${systemNames.feide}-konto på denne brukertypen`, solution: `Dersom det er behov for ${systemNames.feide}-konto, meld sak til arbeidsgruppe identitet` })
    } else return success('Har data')
  }),
  test('feide-02', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    const norEduPersonNIN = hasData(systemData.norEduPersonNIN) ? systemData.norEduPersonNIN : undefined
    const norEduPersonLIN = hasData(systemData.norEduPersonLIN) ? systemData.norEduPersonLIN : undefined
    const data = {
      norEduPersonNIN,
      norEduPersonLIN
    }

    if (!norEduPersonNIN && !norEduPersonLIN) return error({ message: 'Fødselsnummer mangler 😬', raw: data })
    else if (norEduPersonNIN) {
      data.fnr = isValidFnr(norEduPersonNIN)
    } else if (norEduPersonLIN) {
      /*
        https://docs.feide.no/reference/schema/info_go/go_attributter_ch05.html#noredupersonlin
        ID-number issued by the county municipalities described in fellesrutinene can be expressed as:
          norEduPersonLIN: <organization's feide-realm>:fin:<eleven-digit number>
      */
      if (Array.isArray(data.norEduPersonLIN) && data.norEduPersonLIN.length === 1) {
        const feidePrincipalName = SYSTEMS.FEIDE.PRINCIPAL_NAME.replace('@', '')
        data.norEduPersonLIN = data.norEduPersonLIN[0].replace(`${feidePrincipalName}:fin:`, '')
      }
      data.fnr = isValidFnr(data.norEduPersonLIN)
    }

    return data.fnr.valid ? success({ message: `Har gyldig ${data.fnr.type}`, raw: data }) : error({ message: data.fnr.error, raw: data })
  }),
  test('feide-03', 'Brukernavn er likt i AD', 'Sjekker at brukernavnet er likt i AD og FEIDE', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error(`Mangler ${systemNames.ad}-data`)

    if (!systemData.name) return error({ message: 'Brukernavn mangler 😬', raw: systemData })
    const data = {
      feide: {
        name: systemData.name
      },
      ad: {
        samAccountName: allData.ad.samAccountName
      }
    }
    if (systemData.name === allData.ad.samAccountName) return success({ message: `Brukernavn er likt i ${systemNames.ad} og ${systemNames.feide}`, raw: data })
    else return error({ message: `Brukernavn er forskjellig i ${systemNames.ad} og ${systemNames.feide}`, raw: data, solution: 'Meld sak til arbeidsgruppe identitet' })
  }),
  test('feide-04', 'Har knytning til en skole', 'Sjekker at det finnes knytning til minst èn skole', () => {
    if (!dataPresent) return noData()
    if (isApprentice(user) || isOT(user)) return noData()
    if (!allData) return waitForData()

    const data = {
      eduPersonOrgUnitDN: systemData.eduPersonOrgUnitDN || null
    }
    if (!hasData(systemData.eduPersonOrgUnitDN)) return hasData(allData.vis) ? warn({ message: 'Knytning til skole mangler 😬', raw: data, solution: `Dersom dette er en skoleansatt eller elev, må dette rettes i ${systemNames.vis}` }) : success({ message: `Ingen knytning til skole funnet. Dette er riktig da bruker ikke finnes i ${systemNames.vis}`, raw: data }) // TODO: Må sjekke at data faktisk kommer fra kildesystemet ViS
    return success({ message: 'Knytning til skole funnet', raw: data })
  }),
  test('feide-05', 'Har satt opp Feide2Faktor', 'Sjekker at Feide2Faktor er satt opp', () => {
    if (!dataPresent) return noData()
    if (isApprentice(user) || isOT(user)) return noData()

    const data = {
      norEduPersonAuthnMethod: systemData.norEduPersonAuthnMethod.map(auth => auth.split(' ')[0])
    }
    if (!hasData(systemData.norEduPersonAuthnMethod)) return user.expectedType === 'employee' ? error({ message: 'Feide2Faktor er ikke satt opp 😬', raw: data, solution: 'Sett opp Feide2Faktor i vigobas-portal.vtfk.no' }) : success('Feide2Faktor er ikke satt opp, og er heller ikke påkrevd for elever')

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
    if (isApprentice(user) || isOT(user)) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.vis)) return success({ message: `Ingen grupperettigheter funnet. Dette er riktig da bruker ikke finnes i ${systemNames.vis}`, raw: { feide: systemData, vis: allData.vis } })

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
    if (!hasData(systemData.eduPersonEntitlement)) return hasData(activeMemberships) ? error({ message: 'Grupperettigheter mangler 😬', raw: data, solution: `Rettes i ${systemNames.vis}` }) : success({ message: `Ingen grupperettigheter funnet. Dette er riktig da bruker ikke har noen grupper i ${systemNames.vis}`, raw: data })
    else {
      const missingEntitlements = repackedMemberships.filter(membership => !repackedEntitlements.includes(membership))
      if (hasData(missingEntitlements)) {
        data.missingEntitlements = missingEntitlements
        return error({ message: `Mangler ${missingEntitlements.length} grupperettighet${missingEntitlements.length > 1 ? 'er' : ''} 😬`, raw: data, solution: `Rettes i ${systemNames.vis}` })
      } else return success({ message: 'Grupperettigheter er riktig', raw: data })
    }
  }),
  test('feide-07', 'Har dobbel konto', 'Har elev- og ansattkonto', () => {
    if (!dataPresent) return noData()

    if (systemData.eduPersonAffiliation.includes('student') && systemData.eduPersonAffiliation.includes('employee')) return warn({ message: `Har både elev- og ansattkonto. ${systemNames.feide}-konto er registrert på elevkonto med rolle som både elev og ansatt`, raw: { eduPersonAffiliation: systemData.eduPersonAffiliation } })
    return noData()
  })
])
