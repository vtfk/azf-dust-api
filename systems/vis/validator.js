const { test, success, warn, error, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const isTeacher = require('../../lib/helpers/is-teacher')

const getMemberships = (data, expectedType) => {
  const membership = []

  if (expectedType === 'student' && data.person.elev !== null) {
    const relationships = data.person.elev.elevforhold || []
    relationships.forEach(relation => {
      if (relation.basisgruppe) membership.push(...relation.basisgruppe)
      if (relation.undervisningsgruppe) membership.push(...relation.undervisningsgruppe)
    })
  } else if (expectedType === 'employee' && data.skoleressurs.undervisningsforhold !== null) {
    data.skoleressurs.undervisningsforhold.forEach(undervisningsforhold => {
      if (undervisningsforhold.basisgruppe) membership.push(...undervisningsforhold.basisgruppe)
      if (undervisningsforhold.undervisningsgruppe) membership.push(...undervisningsforhold.undervisningsgruppe)
    })
  }

  return membership
}
const getActiveMemberships = (data, expectedType) => getMemberships(data, expectedType).filter(item => !!item.periode && !!item.periode.slutt && new Date(item.periode.slutt) > new Date()) // isTeachingGroup(item.sourcedid.id)
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
  } else if (data && data.skoleressurs) {
    activeData.employee = Object.assign(activeData.employee, data.skoleressurs.personalressurs)
    activeData.employee.active = data.skoleressurs.personalressurs.ansettelsesperiode.slutt === null || new Date(data.skoleressurs.personalressurs.ansettelsesperiode.slutt) > new Date()
  }
  return activeData
}

const getElevforhold = data => {
  if (!data.person || !data.person.elev || !Array.isArray(data.person.elev.elevforhold)) {
    return { basisgrupper: [], undervisningsgrupper: [], kontaktlarere: [], skoler: [] }
  }

  return data.person.elev.elevforhold.reduce((accumulator, current) => {
    accumulator.skoler.push(current.skole.navn)

    current.basisgruppe.forEach(basisgruppe => {
      accumulator.basisgrupper.push({
        skole: current.skole.navn,
        navn: basisgruppe.navn,
        systemId: basisgruppe.systemId.identifikatorverdi
      })
    })

    current.undervisningsgruppe.forEach(undervisningsgruppe => {
      accumulator.undervisningsgrupper.push({
        skole: current.skole.navn,
        navn: undervisningsgruppe.navn,
        systemId: undervisningsgruppe.systemId.identifikatorverdi
      })
    })

    current.kontaktlarergruppe.forEach(kontaktlarergruppe => {
      kontaktlarergruppe.undervisningsforhold.forEach(undervisningsforhold => {
        accumulator.kontaktlarere.push({
          skole: current.skole.navn,
          fornavn: undervisningsforhold.skoleressurs.person.navn.fornavn,
          etternavn: undervisningsforhold.skoleressurs.person.navn.etternavn,
          epostadresse: undervisningsforhold.skoleressurs.person.kontaktinformasjon.epostadresse
        })
      })
    })
    return accumulator
  }, { basisgrupper: [], undervisningsgrupper: [], kontaktlarere: [], skoler: [] })
}

const isSchoolAdded = (schools, school) => !!schools.find(s => s === school)
const sortStudents = students => {
  return students.sort((a, b) => {
    const a1 = a.displayName[0].toLowerCase()
    const a2 = a.displayName[1].toLowerCase()
    const b1 = b.displayName[0].toLowerCase()
    const b2 = b.displayName[1].toLowerCase()
    if (a1 < b1) return -1
    if (a1 > b1) return 1
    if (a1 === b1) {
      if (a2 < b2) return -1
      if (a2 > b2) return 1
    }
    return 0
  })
}

const getUndervisningsforhold = data => {
  if (!data.skoleressurs) {
    return { basisgrupper: [], undervisningsgrupper: [], kontaktlarergrupper: [], skoler: [] }
  }

  return data.skoleressurs.undervisningsforhold.reduce((accumulator, current) => {
    current.basisgruppe.forEach(basisgruppe => {
      accumulator.basisgrupper.push({
        skole: basisgruppe.skole.navn,
        navn: basisgruppe.navn,
        systemId: basisgruppe.systemId.identifikatorverdi,
        antallElever: basisgruppe.elevforhold.length,
        elever: sortStudents(basisgruppe.elevforhold.map(elevforhold => ({ displayName: `${elevforhold.elev.person.navn.fornavn} ${elevforhold.elev.person.navn.etternavn}` })))
      })
      if (!isSchoolAdded(accumulator.skoler, basisgruppe.skole.navn)) {
        accumulator.skoler.push(basisgruppe.skole.navn)
      }
    })

    current.undervisningsgruppe.forEach(undervisningsgruppe => {
      accumulator.undervisningsgrupper.push({
        skole: undervisningsgruppe.skole.navn,
        navn: undervisningsgruppe.navn,
        systemId: undervisningsgruppe.systemId.identifikatorverdi
      })
      if (!isSchoolAdded(accumulator.skoler, undervisningsgruppe.skole.navn)) {
        accumulator.skoler.push(undervisningsgruppe.skole.navn)
      }
    })
    return accumulator
  }, { basisgrupper: [], undervisningsgrupper: [], skoler: [] })
}

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('vis-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData) && (!!systemData.person || !!systemData.skoleressurs)
    if (!dataPresent) {
      if (user.expectedType === 'student') return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i Visma InSchool' })
      else if (isTeacher(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i Visma InSchool' })
      else return success('Bruker har ikke data i dette systemet')
    } else return success('Har data')
  }),
  test('vis-02', 'Har/er kontaktlærer', 'Sjekker at bruker har/er kontaktlærer', () => {
    if (!dataPresent) return noData()
    else if (user.expectedType === 'employee' && !isTeacher(user)) return success('Bruker har ikke relevante data i dette systemet')

    if (user.expectedType === 'student') {
      const data = getElevforhold(systemData)
      if (data.kontaktlarere.length > 0) return success({ message: `Har ${data.kontaktlarere.length} ${data.kontaktlarere.length > 1 ? 'kontaktlærere' : 'kontaktlærer'}`, raw: data.kontaktlarere })
      else return error({ message: 'Har ikke kontaktlærer(e) 😬', raw: data, solution: 'Rettes i Visma InSchool' })
    } else if (user.expectedType === 'employee' && isTeacher(user)) {
      const data = getUndervisningsforhold(systemData)
      if (data.basisgrupper.length === 0) return success('Er ikke kontaktlærer for noen klasser')
      else return success({ message: `Er kontaktlærer for ${data.basisgrupper.length} ${data.basisgrupper.length > 1 ? 'klasser' : 'klasse'}`, raw: data.basisgrupper })
    }
  }),
  test('vis-03', 'Har skoleforhold', 'Sjekker om bruker har skoleforhold', () => {
    if (!dataPresent || (user.expectedType === 'employee' && !isTeacher(user))) return noData()

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
  }),
  test('vis-04', 'Har basisgruppe', 'Sjekker at bruker har basisgruppe(r)', () => {
    if (!dataPresent || user.expectedType === 'employee') return noData()

    const data = getElevforhold(systemData)
    if (data.basisgrupper.length > 0) return success({ message: `Har ${data.basisgrupper.length} ${data.basisgrupper.length > 1 ? 'basisgrupper' : 'basisgruppe'}`, raw: data.basisgrupper })
    else return error({ message: 'Mangler medlemskap i basisgruppe(r) 😬', raw: data, solution: 'Rettes i Visma InSchool' })
  }),
  test('vis-05', 'Har undervisningsgruppe', 'Sjekker at bruker har undervisningsgruppe(r)', () => {
    if (!dataPresent || (user.expectedType === 'employee' && !isTeacher(user))) return noData()

    if (user.expectedType === 'student') {
      const data = getElevforhold(systemData)
      if (data.undervisningsgrupper.length > 0) return success({ message: `Har ${data.undervisningsgrupper.length} ${data.undervisningsgrupper.length > 1 ? 'undervisningsgrupper' : 'undervisningsgruppe'}`, raw: data.undervisningsgrupper })
      else return error({ message: 'Mangler medlemskap i undervisningsgruppe(r) 😬', raw: data, solution: 'Rettes i Visma InSchool' })
    } else if (user.expectedType === 'employee' && isTeacher(user)) {
      const data = getUndervisningsforhold(systemData)
      if (data.undervisningsgrupper.length === 0) return warn({ message: 'Mangler medlemskap i undervisningsgruppe(r)', raw: data, solution: 'Rettes i Visma InSchool' })
      else return success({ message: `Underviser i ${data.undervisningsgrupper.length} ${data.undervisningsgrupper.length > 1 ? 'undervisningsgrupper' : 'undervisningsgruppe'}`, raw: data })
    }
  }),
  test('vis-06', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent || (!systemData.person && !systemData.skoleressurs) || (user.expectedType === 'employee' && !isTeacher(user))) return noData()
    const fnr = systemData.person ? systemData.person.fodselsnummer.identifikatorverdi : systemData.skoleressurs.person.fodselsnummer.identifikatorverdi
    const data = {
      id: fnr,
      fnr: isValidFnr(fnr)
    }
    return data.fnr.valid ? success({ message: `Har gyldig ${data.fnr.type}`, raw: data }) : error({ message: data.fnr.error, raw: data })
  }),
  test('vis-07', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og ViS', () => {
    if (!dataPresent || (!systemData.person && !systemData.skoleressurs) || (user.expectedType === 'employee' && !isTeacher(user))) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error({ message: 'Mangler AD-data', raw: allData.ad })

    const fnr = systemData.person ? systemData.person.fodselsnummer.identifikatorverdi : systemData.skoleressurs.person.fodselsnummer.identifikatorverdi
    const data = {
      vis: {
        id: fnr
      },
      ad: {
        employeeNumber: allData.ad.employeeNumber
      }
    }
    return data.vis.id === data.ad.employeeNumber ? success({ message: 'Fødselsnummer er likt i AD og ViS', raw: data }) : error({ message: 'Fødselsnummer er forskjellig i AD og ViS', raw: data })
  })
])

module.exports.getActiveData = getActiveData
module.exports.getActiveMemberships = getActiveMemberships
