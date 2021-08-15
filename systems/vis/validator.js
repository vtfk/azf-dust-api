const { test, success, warn, error, /* waitForData */ noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
// const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const isTeacher = require('../../lib/helpers/is-teacher')
const isSchoolEmployee = require('../../lib/helpers/is-school-employee')

const getMemberships = (data, expectedType) => {
  const membership = []

  if (expectedType === 'student' && data.person.elev !== null) {
    const relationships = data.person.elev.elevforhold || []
    relationships.forEach(relation => {
      if (relation.basisgruppe) membership.push(...relation.basisgruppe)
      if (relation.undervisningsgruppe) membership.push(...relation.undervisningsgruppe)
    })
  } else if (expectedType === 'employee' && data.person.personalressurs !== null) {
    const relationships = (data.person.personalressurs.arbeidsforhold && data.person.personalressurs.arbeidsforhold.filter(forhold => forhold.ansettelsesprosent > 0 && (forhold.gyldighetsperiode.slutt === null || (forhold.gyldighetsperiode.slutt !== null && new Date(forhold.gyldighetsperiode.slutt) > new Date()))).map(forhold => forhold.undervisningsforhold)) || []
    relationships.forEach(relation => {
      !!relation && relation.forEach(teachingRelation => {
        if (teachingRelation.basisgruppe) membership.push(...teachingRelation.basisgruppe)
        if (teachingRelation.undervisningsgruppe) membership.push(...teachingRelation.undervisningsgruppe)
      })
    })
  }

  return membership
}
const getActiveMemberships = (data, expectedType) => getMemberships(data, expectedType).filter(item => !!item.periode && !!item.periode.slutt && new Date(item.periode.slutt) > new Date()) // isTeachingGroup(item.sourcedid.id)
// const getExpiredMemberships = memberships => hasData(memberships) ? memberships.filter(item => !!item.periode && !!item.periode.slutt && new Date(item.periode.slutt) < new Date()) : []
const getActiveData = data => {
  const activeData = {
    employee: {
      active: false
    },
    student: {
      active: false
    }
  }
  if (data.person.personalressurs) {
    activeData.employee = Object.assign(activeData.employee, data.person.personalressurs)
    activeData.employee.active = data.person.personalressurs.ansettelsesperiode.slutt === null || new Date(data.person.personalressurs.ansettelsesperiode.slutt) > new Date()
  }
  if (data.person.elev) {
    activeData.student = Object.assign(activeData.student, data.person.elev)
    if (Array.isArray(data.person.elev.elevforhold) && data.person.elev.elevforhold.length > 1) {
      activeData.student.active = data.person.elev.elevforhold.filter(forhold => forhold.gyldighetsperiode.slutt === null || new Date(forhold.gyldighetsperiode.slutt) > new Date()).length > 0
    } else if (Array.isArray(data.person.elev.elevforhold) && data.person.elev.elevforhold.length === 1) {
      activeData.student.active = data.person.elev.elevforhold[0].gyldighetsperiode.slutt === null || new Date(data.person.elev.elevforhold[0].gyldighetsperiode.slutt) > new Date()
    }
  }
  return activeData
}

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('vis-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData) && !!systemData.person
    if (!dataPresent) {
      if (user.expectedType === 'student') return error('Mangler data 😬', systemData)
      else if (!user.company || !user.title) return warn('Mangler data. Dessverre er det ikke nok informasjon tilstede på brukerobjektet for å kontrollere om dette er korrekt')
      else if (isTeacher(user.company, user.title)) return error('Mangler data 😬', systemData)
      else if (isSchoolEmployee(user)) return warn('Data mangler til tross for skoletilhørighet 😬', systemData)
      else return success('Bruker har ikke data i dette systemet')
    } else return success('Har data')
  }),
  test('vis-02', 'Har kontaktlærer', 'Sjekker at bruker har kontaktlærer', () => {
    if (!dataPresent) return noData()
    else if (user.expectedType === 'employee' && !isTeacher(user.company, user.title)) return success('Bruker har ikke data i dette systemet')

    if (user.expectedType === 'student') {
      if (systemData.person.elev && systemData.person.elev.elevforhold && systemData.person.elev.elevforhold.length > 0) {
        const data = systemData.person.elev.elevforhold.map(elevforhold => ({ skole: elevforhold.skole.navn, kontaktlærere: elevforhold.kontaktlarergruppe.map(kontaktlærer => ({ klasse: kontaktlærer.navn, lærere: kontaktlærer.undervisningsforhold.map(undervisningsforhold => ({ fornavn: undervisningsforhold.skoleressurs.person.navn.fornavn, etternavn: undervisningsforhold.skoleressurs.person.navn.etternavn, epostadresse: undervisningsforhold.skoleressurs.person.kontaktinformasjon.epostadresse })) })) }))
        const kontaktlærerCount = data.reduce((accumulator, current) => {
          return accumulator + current.kontaktlærere.length
        }, 0)
        if (kontaktlærerCount > 0) return success(`Har ${kontaktlærerCount} ${kontaktlærerCount === 0 || kontaktlærerCount > 1 ? 'kontaktlærere' : 'kontaktlærer'}. Se mer på "Se data"`, (data.length === 0 || data.length > 1 ? data : data[0]))
        else return error('Har ikke kontaktlærer(e) 😬', data)
      } else return error('Har ikke kontaktlærer(e) 😬')
    } else if (user.expectedType === 'employee' && isTeacher(user.company, user.title)) {
      if (systemData.contactClasses.length === 0) return success('Er ikke kontaktlærer for noen klasser')
      else return success(`Er kontaktlærer for ${systemData.contactClasses.length} ${systemData.contactClasses.length === 0 || systemData.contactClasses.length > 1 ? 'klasser' : 'klasse'}. Se mer på "Se data"`, (systemData.contactClasses.length === 0 || systemData.contactClasses.length > 1 ? systemData.contactClasses : systemData.contactClasses[0]))
    }
  })
  /* test('vis-02', 'Har aktivt forhold', 'Sjekker at bruker har aktivt forhold', () => {
    if (!dataPresent) return noData()
    const activeData = getActiveData(systemData)
    if (user.expectedType === 'student') {
      if (activeData.employee.active && activeData.student.active) return error('Bruker har aktive elev- og ansattforhold 😬', activeData)
      else if (activeData.employee.active && !activeData.student.active) return error('Elev har aktivt ansattforhold 😬', activeData)
      else if (!activeData.employee.active && !activeData.student.active) return error('Mangler aktivt elevforhold 😬😬', activeData)
      return success('Bruker har aktivt elevforhold', activeData)
    } else {
      if (activeData.employee.active && activeData.student.active) return error('Bruker har aktive elev- og ansattforhold 😬', activeData)
      else if (!activeData.employee.active && activeData.student.active) return error('Ansatt har aktivt elevforhold 😬', activeData)
      else if (!activeData.employee.active && !activeData.student.active) return error('Mangler aktivt ansattforhold 😬😬', activeData)
      return success('Bruker har aktivt ansattforhold', activeData)
    }
  }),
  test('vis-03', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    else if (!hasData(systemData.person.fodselsnummer.identifikatorverdi)) return noData()
    const data = {
      id: systemData.person.fodselsnummer.identifikatorverdi,
      fnr: isValidFnr(systemData.person.fodselsnummer.identifikatorverdi)
    }
    return data.fnr.valid ? success(`Har gyldig ${data.fnr.type}`, data) : error(data.fnr.error, data)
  }),
  test('vis-04', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og ViS', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error('Mangler AD-data', allData)

    const data = {
      vis: {
        id: systemData.person.fodselsnummer.identifikatorverdi
      },
      ad: {
        employeeNumber: allData.ad.employeeNumber
      }
    }
    return data.vis.id === data.ad.employeeNumber ? success('Fødselsnummer er likt i AD og ViS', data) : error('Fødselsnummer er forskjellig i AD og ViS', data)
  }),
  test('vis-05', 'Har gruppemedlemskap', 'Sjekker at det finnes gruppemedlemskap', () => {
    if (!dataPresent) return noData()
    const memberships = getMemberships(systemData, user.expectedType)
    if (!hasData(memberships)) {
      if (isTeacher(user.company, user.title)) return error('Har ingen gruppemedlemskap 🤭', systemData)
      else if (user.expectedType === 'student') return warn('Har ingen gruppemedlemskap 🤭', systemData)
      else return noData('Har ingen gruppemedlemskap')
    }
    return success('Har gruppemedlemskap', memberships)
  }),
  test('vis-06', 'Gruppemedlemskap er inaktive', 'Sjekker om noen gruppemedlemskap er inaktive', () => {
    if (!dataPresent) return noData()
    const memberships = getMemberships(systemData, user.expectedType)
    const expiredMemberships = getExpiredMemberships(memberships)
    if (hasData(expiredMemberships)) {
      if (isTeacher(user.company, user.title)) return error(`Har ${expiredMemberships.length} avsluttede gruppemedlemskap`, expiredMemberships)
      else return warn(`Har ${expiredMemberships.length} avsluttede gruppemedlemskap`, expiredMemberships)
    } else return noData('Har ingen avsluttede gruppemedlemskap')
  }),
  test('vis-07', 'Gruppemedlemskap er aktive', 'Sjekker at gruppemedlemskap er aktive', () => {
    if (!dataPresent) return noData()
    const activeMemberships = getActiveMemberships(systemData, user.expectedType)
    if (hasData(activeMemberships)) return success(`Har ${activeMemberships.length} aktive gruppemedlemskap`, activeMemberships)
    if (isTeacher(user.company, user.title)) return error('Mangler aktive gruppemedlemskap 🤭', activeMemberships)
    else if (user.expectedType === 'student') return warn('Mangler aktive gruppemedlemskap 🤭', activeMemberships)
    else return noData('Har ingen aktive gruppemedlemskap')
  }) */
])

module.exports.getActiveData = getActiveData
module.exports.getActiveMemberships = getActiveMemberships
