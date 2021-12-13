const { test, success, warn, error, /* waitForData */ noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
// const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const isTeacher = require('../../lib/helpers/is-teacher')

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
  if (data && data.person) {
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
  }
  return activeData
}
const getElevforhold = data => {
  return data.person.elev.elevforhold.map(elevforhold => {
    return {
      skole: elevforhold.skole.navn,
      kontaktlærere: elevforhold.kontaktlarergruppe.map(kontaktlærer => {
        return {
          klasse: kontaktlærer.navn,
          lærere: kontaktlærer.undervisningsforhold.map(undervisningsforhold => {
            return {
              fornavn: undervisningsforhold.skoleressurs.person.navn.fornavn,
              etternavn: undervisningsforhold.skoleressurs.person.navn.etternavn,
              epostadresse: undervisningsforhold.skoleressurs.person.kontaktinformasjon.epostadresse
            }
          })
        }
      })
    }
  })
}

const isSchoolAdded = (schools, school) => !!schools.find(s => s === school)

const getUndervisningsforhold = data => {
  if (!data.skoleressurs) {
    return { basisgrupper: [], undervisningsgrupper: [], kontaktlarergrupper: [], skoler: [] }
  }

  return data.skoleressurs.undervisningsforhold.reduce((accumulator, current) => {
    current.basisgruppe.forEach(basisgruppe => {
      accumulator.basisgrupper.push({
        skole: basisgruppe.skole.navn,
        navn: basisgruppe.navn
      })
      if (!isSchoolAdded(accumulator.skoler, basisgruppe.skole.navn)) {
        accumulator.skoler.push(basisgruppe.skole.navn)
      }
    })
    
    current.undervisningsgruppe.forEach(undervisningsgruppe => {
      accumulator.undervisningsgrupper.push({
        skole: undervisningsgruppe.skole.navn,
        navn: undervisningsgruppe.navn
      })
      if (!isSchoolAdded(accumulator.skoler, undervisningsgruppe.skole.navn)) {
        accumulator.skoler.push(undervisningsgruppe.skole.navn)
      }
    })

    current.kontaktlarergruppe.forEach(kontaktlarergruppe => {
      accumulator.kontaktlarergrupper.push({
        skole: kontaktlarergruppe.skole.navn,
        navn: kontaktlarergruppe.navn
      })
      if (!isSchoolAdded(accumulator.skoler, kontaktlarergruppe.skole.navn)) {
        accumulator.skoler.push(kontaktlarergruppe.skole.navn)
      }
    })
    return accumulator
  }, { basisgrupper: [], undervisningsgrupper: [], kontaktlarergrupper: [], skoler: [] })
}

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('vis-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData) && (!!systemData.person || !!systemData.skoleressurs)
    if (!dataPresent) {
      if (user.expectedType === 'student') return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i Visma InSchool' })
      else if (!user.company || !user.title) return warn('Mangler data. Dessverre er det ikke nok informasjon tilstede på brukerobjektet for å kontrollere om dette er korrekt')
      else if (isTeacher(user.company, user.title)) return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i Visma InSchool' })
      else return success('Bruker har ikke data i dette systemet')
    } else return success('Har data')
  }),
  test('vis-02', 'Har/er kontaktlærer', 'Sjekker at bruker har/er kontaktlærer', () => {
    if (!dataPresent) return noData()
    else if (user.expectedType === 'employee' && !isTeacher(user.company, user.title)) return success('Bruker har ikke relevante data i dette systemet') // TODO: Trenger vi egentlig å sjekke ViS for en vanlig ansatt?

    if (user.expectedType === 'student') {
      if (systemData.person.elev && systemData.person.elev.elevforhold && systemData.person.elev.elevforhold.length > 0) {
        const data = getElevforhold(systemData)
        const kontaktlærerCount = data.reduce((dataAcc, dataCurr) => {
          return dataAcc + dataCurr.kontaktlærere.filter(kontaktlærer => kontaktlærer.lærere.length > 0)
            .reduce((kontaktAcc, kontaktCurr) => {
              return kontaktAcc + kontaktCurr.lærere.length
            }, 0)
        }, 0)
        if (kontaktlærerCount > 0) return success({ message: `Har ${kontaktlærerCount} ${kontaktlærerCount === 0 || kontaktlærerCount > 1 ? 'kontaktlærere' : 'kontaktlærer'}`, raw: (data.length === 0 || data.length > 1 ? data : data[0]) })
        else return error({ message: 'Har ikke kontaktlærer(e) 😬', raw: data, solution: 'Rettes i Visma InSchool' })
      } else return error({ message: 'Har ikke kontaktlærer(e) 😬', solution: 'Rettes i Visma InSchool' })
    } else if (user.expectedType === 'employee' && isTeacher(user.company, user.title)) {
      const data  = getUndervisningsforhold(systemData)
      if (data.kontaktlarergrupper.length === 0) return success('Er ikke kontaktlærer for noen klasser')
      else return success({ message: `Er kontaktlærer for ${data.kontaktlarergrupper.length} ${data.kontaktlarergrupper.length > 1 ? 'klasser' : 'klasse'}`, raw: data })
    }
  }),
  test('vis-03', 'Tom kontaktlærergruppe', 'Sjekker om bruker har tomme kontaktlærergrupper', () => {
    if (!dataPresent || user.expectedType === 'employee') return noData()

    if (systemData.person.elev && systemData.person.elev.elevforhold && systemData.person.elev.elevforhold.length > 0) {
      const data = getElevforhold(systemData)
      const emptyGroups = data.filter(school => school.kontaktlærere.filter(kontaktlærer => kontaktlærer.lærere.length === 0).length > 0)
      if (emptyGroups.length > 0) return error({ message: `Har ${emptyGroups.length} ${emptyGroups.length > 1 ? 'kontaktlærergrupper' : 'kontaktlæregruppe'} uten kontaktlærer`, raw: (emptyGroups.length === 0 || emptyGroups.length > 1 ? emptyGroups : emptyGroups[0]), solution: 'Rettes i Visma InSchool' })
      else return noData()
    } else return noData()
  }),
  test('vis-04', 'Har skoleforhold', 'Sjekker om bruker har skoleforhold', () => {
    if (!dataPresent || (user.expectedType === 'employee' && !isTeacher(user.company, user.title))) return noData()

    if (user.expectedType === 'student') {
      if (systemData.person.elev && systemData.person.elev.elevforhold && systemData.person.elev.elevforhold.length > 0) {
        const data = systemData.person.elev.elevforhold.map(elevforhold => ({ skole: elevforhold.skole.navn, hovedskole: elevforhold.hovedskole }))
        if (data.length > 1) {
          const primarySchool = data.find(elevforhold => elevforhold.hovedskole === true)
          return primarySchool ? warn({ message: `Har ${data.length} skoleforhold. ${primarySchool.skole} er hovedskole`, raw: data, solution: 'Dette er i mange tilfeller korrekt. Dersom det allikevel skulle være feil, må det rettes i Visma InSchool' }) : error({ message: `Har ${data.length} skoleforhold men ingen hovedskole`, raw: data, solution: 'Rettes i Visma InSchool' })
        } else return success({ message: 'Har ett skoleforhold', raw: data })
      } else return error({ message: 'Har ingen skoleforhold 😬', raw: systemData })
    } else {
      const data = getUndervisningsforhold(systemData)
      if (data.skoler.length === 0) return error({ message: 'Har ingen skoleforhold 😬', solution: 'Rettes i Visma InSchool' })
      else return success({ message: `Har ${data.skoler.length} skoleforhold`, raw: data })
    }
  })
  /* test('vis-02', 'Har aktivt forhold', 'Sjekker at bruker har aktivt forhold', () => {
    if (!dataPresent) return noData()
    const activeData = getActiveData(systemData)
    if (user.expectedType === 'student') {
      if (activeData.employee.active && activeData.student.active) return error({ message: 'Bruker har aktive elev- og ansattforhold 😬', raw: activeData })
      else if (activeData.employee.active && !activeData.student.active) return error({ message: 'Elev har aktivt ansattforhold 😬', raw: activeData })
      else if (!activeData.employee.active && !activeData.student.active) return error({ message: 'Mangler aktivt elevforhold 😬😬', raw: activeData })
      return success({ message: 'Bruker har aktivt elevforhold', raw: activeData })
    } else {
      if (activeData.employee.active && activeData.student.active) return error({ message: 'Bruker har aktive elev- og ansattforhold 😬', raw: activeData })
      else if (!activeData.employee.active && activeData.student.active) return error({ message: 'Ansatt har aktivt elevforhold 😬', raw: activeData })
      else if (!activeData.employee.active && !activeData.student.active) return error({ message: 'Mangler aktivt ansattforhold 😬😬', raw: activeData })
      return success({ message: 'Bruker har aktivt ansattforhold', raw: activeData })
    }
  }),
  test('vis-03', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    else if (!hasData(systemData.person.fodselsnummer.identifikatorverdi)) return noData()
    const data = {
      id: systemData.person.fodselsnummer.identifikatorverdi,
      fnr: isValidFnr(systemData.person.fodselsnummer.identifikatorverdi)
    }
    return data.fnr.valid ? success({ message: `Har gyldig ${data.fnr.type}`, raw: data }) : error({ message: data.fnr.error, raw: data })
  }),
  test('vis-04', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og ViS', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error({ message: 'Mangler AD-data', raw: allData.ad })

    const data = {
      vis: {
        id: systemData.person.fodselsnummer.identifikatorverdi
      },
      ad: {
        employeeNumber: allData.ad.employeeNumber
      }
    }
    return data.vis.id === data.ad.employeeNumber ? success({ message: 'Fødselsnummer er likt i AD og ViS', raw: data }) : error({ message: 'Fødselsnummer er forskjellig i AD og ViS', raw: data })
  }),
  test('vis-05', 'Har gruppemedlemskap', 'Sjekker at det finnes gruppemedlemskap', () => {
    if (!dataPresent) return noData()
    const memberships = getMemberships(systemData, user.expectedType)
    if (!hasData(memberships)) {
      if (isTeacher(user.company, user.title)) return error({ message: 'Har ingen gruppemedlemskap 🤭', raw: systemData })
      else if (user.expectedType === 'student') return warn({ message: 'Har ingen gruppemedlemskap 🤭', raw: systemData })
      else return noData('Har ingen gruppemedlemskap')
    }
    return success({ message: 'Har gruppemedlemskap', raw: memberships })
  }),
  test('vis-06', 'Gruppemedlemskap er inaktive', 'Sjekker om noen gruppemedlemskap er inaktive', () => {
    if (!dataPresent) return noData()
    const memberships = getMemberships(systemData, user.expectedType)
    const expiredMemberships = getExpiredMemberships(memberships)
    if (hasData(expiredMemberships)) {
      if (isTeacher(user.company, user.title)) return error({ message: `Har ${expiredMemberships.length} avsluttede gruppemedlemskap`, raw: expiredMemberships })
      else return warn({ message: `Har ${expiredMemberships.length} avsluttede gruppemedlemskap`, raw: expiredMemberships })
    } else return noData('Har ingen avsluttede gruppemedlemskap')
  }),
  test('vis-07', 'Gruppemedlemskap er aktive', 'Sjekker at gruppemedlemskap er aktive', () => {
    if (!dataPresent) return noData()
    const activeMemberships = getActiveMemberships(systemData, user.expectedType)
    if (hasData(activeMemberships)) return success({ message: `Har ${activeMemberships.length} aktive gruppemedlemskap`, raw: activeMemberships })
    if (isTeacher(user.company, user.title)) return error({ message: 'Mangler aktive gruppemedlemskap 🤭', raw: activeMemberships })
    else if (user.expectedType === 'student') return warn({ message: 'Mangler aktive gruppemedlemskap 🤭', raw: activeMemberships })
    else return noData('Har ingen aktive gruppemedlemskap')
  }) */
])

module.exports.getActiveData = getActiveData
module.exports.getActiveMemberships = getActiveMemberships
