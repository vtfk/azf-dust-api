const { test, success, warn, error, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const { isStudent, isTeacher } = require('../../lib/helpers/is-type')
const systemNames = require('../../lib/data/systems.json')

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
          navn: kontaktlarergruppe.navn,
          systemId: kontaktlarergruppe.systemId.identifikatorverdi,
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

    current.kontaktlarergruppe.forEach(kontaktlarergruppe => {
      if (accumulator.kontaktlarergrupper.find(kg => kg.systemId === kontaktlarergruppe.systemId.identifikatorverdi)) return
      if (!kontaktlarergruppe.undervisningsforhold.find(uh => uh.skoleressurs.feidenavn.identifikatorverdi === data.skoleressurs.feidenavn.identifikatorverdi)) return
      accumulator.kontaktlarergrupper.push({
        skole: kontaktlarergruppe.skole.navn,
        navn: kontaktlarergruppe.navn,
        systemId: kontaktlarergruppe.systemId.identifikatorverdi
      })
      if (!isSchoolAdded(accumulator.skoler, kontaktlarergruppe.skole.navn)) {
        accumulator.skoler.push(kontaktlarergruppe.skole.navn)
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
  }, { basisgrupper: [], kontaktlarergrupper: [], undervisningsgrupper: [], skoler: [] })
}

const getDuplicateGroups = data => {
  return data.reduce((accumulator, current) => {
    if (accumulator[current.systemId]) {
      accumulator[current.systemId].count++
      if (accumulator.duplicateGroupCount) {
        accumulator.duplicateGroupCount++
      } else {
        accumulator.duplicateGroupCount = 1
      }
    } else {
      accumulator[current.systemId] = { ...current, count: 0 }
      delete accumulator[current.systemId].elever
    }

    return accumulator
  }, {})
}

const getMissingGroups = (pifuGroups, visGroups) => {
  const missingGroups = []

  visGroups.forEach(group => {
    if (!pifuGroups.includes(group.systemId)) {
      missingGroups.push(group)
    }
  })

  return missingGroups
}

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('vis-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData) && hasData(systemData) && (!!systemData.person || !!systemData.skoleressurs)
    if (!dataPresent) {
      if (user.expectedType === 'student') return error({ message: 'Mangler data 😬', raw: systemData, solution: `Rettes i ${systemNames.vis}` })
      else if (isTeacher(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: `Rettes i ${systemNames.vis}` })
      else return success('Bruker har ikke data i dette systemet')
    } else return success('Har data')
  }),
  test('vis-02', 'Har/er kontaktlærer', 'Sjekker at bruker har/er kontaktlærer', () => {
    if (!dataPresent) return noData()

    if (user.expectedType === 'student') {
      const data = getElevforhold(systemData)
      if (data.kontaktlarere.length > 0) return success({ message: `Har ${data.kontaktlarere.length} ${data.kontaktlarere.length > 1 ? 'kontaktlærere' : 'kontaktlærer'}`, raw: data.kontaktlarere })
      else return error({ message: 'Har ikke kontaktlærer(e) 😬', raw: data, solution: `Rettes i ${systemNames.vis}` })
    } else if (user.expectedType === 'employee' && isTeacher(user)) {
      const data = getUndervisningsforhold(systemData)
      if (data.basisgrupper.length === 0) return success('Er ikke kontaktlærer for noen klasser')
      else return success({ message: `Er kontaktlærer for ${data.kontaktlarergrupper.length} ${data.kontaktlarergrupper.length > 1 ? 'klasser' : 'klasse'}`, raw: data.kontaktlarergrupper })
    }
  }),
  test('vis-03', 'Har skoleforhold', 'Sjekker om bruker har skoleforhold', () => {
    if (!dataPresent) return noData()

    if (user.expectedType === 'student') {
      if (systemData.person.elev && systemData.person.elev.elevforhold && systemData.person.elev.elevforhold.length > 0) {
        const data = systemData.person.elev.elevforhold.map(elevforhold => ({ skole: elevforhold.skole.navn, hovedskole: elevforhold.hovedskole }))
        if (data.length > 1) {
          const primarySchool = data.find(elevforhold => elevforhold.hovedskole === true)
          return primarySchool ? warn({ message: `Har ${data.length} skoleforhold. ${primarySchool.skole} er hovedskole`, raw: data, solution: `Dette er i mange tilfeller korrekt. Dersom det allikevel skulle være feil, må det rettes i ${systemNames.vis}` }) : error({ message: `Har ${data.length} skoleforhold men ingen hovedskole`, raw: data, solution: `Rettes i ${systemNames.vis}` })
        } else return data[0].hovedskole ? success({ message: 'Har ett skoleforhold', raw: data }) : warn({ message: 'Har ett skoleforhold, men dette er ikke satt som hovedskole', raw: data, solution: `Rettes i ${systemNames.vis}` })
      } else return error({ message: 'Har ingen skoleforhold 😬', raw: systemData })
    } else {
      const data = getUndervisningsforhold(systemData)
      if (data.skoler.length === 0) return error({ message: 'Har ingen skoleforhold 😬', solution: `Rettes i ${systemNames.vis}` })
      else return success({ message: `Har ${data.skoler.length} skoleforhold`, raw: data })
    }
  }),
  test('vis-04', 'Har basisgruppe(r)', 'Sjekker at bruker har basisgruppe(r)', () => {
    if (!dataPresent || user.expectedType === 'employee') return noData()

    const data = getElevforhold(systemData)
    if (data.basisgrupper.length > 0) return success({ message: `Har ${data.basisgrupper.length} ${data.basisgrupper.length > 1 ? 'basisgrupper' : 'basisgruppe'}`, raw: data.basisgrupper })
    else return error({ message: 'Mangler medlemskap i basisgruppe(r) 😬', raw: data, solution: `Rettes i ${systemNames.vis}` })
  }),
  test('vis-05', 'Har undervisningsgruppe(r)', 'Sjekker at bruker har undervisningsgruppe(r)', () => {
    if (!dataPresent) return noData()

    if (user.expectedType === 'student') {
      const data = getElevforhold(systemData)
      if (data.undervisningsgrupper.length > 0) return success({ message: `Har ${data.undervisningsgrupper.length} ${data.undervisningsgrupper.length > 1 ? 'undervisningsgrupper' : 'undervisningsgruppe'}`, raw: data.undervisningsgrupper })
      else return error({ message: 'Mangler medlemskap i undervisningsgruppe(r) 😬', raw: data, solution: `Rettes i ${systemNames.vis}` })
    } else if (user.expectedType === 'employee' && isTeacher(user)) {
      const data = getUndervisningsforhold(systemData)
      if (data.undervisningsgrupper.length === 0) return warn({ message: 'Mangler medlemskap i undervisningsgruppe(r)', raw: data, solution: `Rettes i ${systemNames.vis}, dersom det savnes noe medlemskap. Hvis det allerede er korrekt i ${systemNames.vis}, meld sak til arbeidsgruppe identitet` })
      else return success({ message: `Underviser i ${data.undervisningsgrupper.length} ${data.undervisningsgrupper.length > 1 ? 'undervisningsgrupper' : 'undervisningsgruppe'}`, raw: data.undervisningsgrupper })
    }
  }),
  test('vis-06', 'Har duplikate kontaktlærergrupper', 'Sjekker om bruker har duplikate kontaktlærergrupper', () => {
    if (!dataPresent || user.expectedType !== 'employee' || !isTeacher(user)) return noData()

    const data = getUndervisningsforhold(systemData)
    const duplicateGroups = getDuplicateGroups(data.basisgrupper)

    if (Number.isInteger(duplicateGroups.duplicateGroupCount) && duplicateGroups.duplicateGroupCount > 0) {
      const duplicateGroupCount = duplicateGroups.duplicateGroupCount
      delete duplicateGroups.duplicateGroupCount
      return warn({ message: `Har ${duplicateGroupCount} ${duplicateGroupCount === 1 ? 'duplikat basisgruppe' : 'duplikate basisgrupper'}`, raw: { duplicateGroups }, solution: `Rettes i ${systemNames.vis}. Hvis det allerede er korrekt i ${systemNames.vis}, meld sak til arbeidsgruppe identitet` })
    } else return noData()
  }),
  test('vis-07', 'Har duplikate undervisningsgrupper', 'Sjekker om bruker har duplikate undervisningsgrupper', () => {
    if (!dataPresent || user.expectedType !== 'employee' || !isTeacher(user)) return noData()

    const data = getUndervisningsforhold(systemData)
    const duplicateGroups = getDuplicateGroups(data.undervisningsgrupper)

    if (Number.isInteger(duplicateGroups.duplicateGroupCount) && duplicateGroups.duplicateGroupCount > 0) {
      const duplicateGroupCount = duplicateGroups.duplicateGroupCount
      delete duplicateGroups.duplicateGroupCount
      return warn({ message: `Har ${duplicateGroupCount} ${duplicateGroupCount === 1 ? 'duplikat undervisningsgruppe' : 'duplikate undervisningsgrupper'}`, raw: { duplicateGroups }, solution: `Rettes i ${systemNames.vis}. Hvis det allerede er korrekt i ${systemNames.vis}, meld sak til arbeidsgruppe identitet` })
    } else return noData()
  }),
  test('vis-08', 'Basisgrupper i ViS og PIFU', 'Sjekker at det er like basisgrupper i ViS og PIFU', () => {
    if (!dataPresent || (!isTeacher(user) && !isStudent(user)) || !user.samAccountName) return noData()
    if (!hasData(systemData.pifu)) return error({ message: 'Bruker finnes ikke i PIFU-basen 😬', solution: `Rettes i ${systemNames.vis}. Hvis det allerede er korrekt i ${systemNames.vis}, vil dette løse seg imorgen (sync). Er det fremdeles problemer etter 1 dag, meld sak til arbeidsgruppe identitet` })

    const pifuGroups = systemData.pifu.basisgruppeIds
    const visGroups = user.expectedType === 'employee'
      ? getUndervisningsforhold(systemData).basisgrupper
      : user.expectedType === 'student'
        ? getElevforhold(systemData).basisgrupper
        : []
    const missingGroups = getMissingGroups(pifuGroups, visGroups)
    if (missingGroups.length > 0) return error({ message: `Mangler ${missingGroups.length} ${missingGroups.length === 1 ? 'basisgruppe' : 'basisgrupper'} i PIFU-basen 😬`, raw: missingGroups, solution: `Rettes i ${systemNames.vis}. Hvis det allerede er korrekt i ${systemNames.vis}, vil dette løse seg imorgen (sync). Er det fremdeles problemer etter 1 dag, meld sak til arbeidsgruppe identitet` })
    else return noData()
  }),
  test('vis-09', 'Kontaktlærergrupper i ViS og PIFU', 'Sjekker at det er like kontaktlærergrupper i ViS og PIFU', () => {
    if (!dataPresent || (!isTeacher(user) && !isStudent(user)) || !user.samAccountName) return noData()
    if (!hasData(systemData.pifu)) return error({ message: 'Bruker finnes ikke i PIFU-basen 😬', solution: `Rettes i ${systemNames.vis}. Hvis det allerede er korrekt i ${systemNames.vis}, vil dette løse seg imorgen (sync). Er det fremdeles problemer etter 1 dag, meld sak til arbeidsgruppe identitet` })

    const pifuGroups = systemData.pifu.kontaktlarergruppeIds
    const visGroups = user.expectedType === 'employee'
      ? getUndervisningsforhold(systemData).kontaktlarergrupper
      : user.expectedType === 'student'
        ? getElevforhold(systemData).kontaktlarere
        : []
    const missingGroups = getMissingGroups(pifuGroups, visGroups)
    if (missingGroups.length > 0) return error({ message: `Mangler ${missingGroups.length} ${missingGroups.length === 1 ? 'kontaktlærergruppe' : 'kontaktlærergrupper'} i PIFU-basen 😬`, raw: missingGroups, solution: `Rettes i ${systemNames.vis}. Hvis det allerede er korrekt i ${systemNames.vis}, vil dette løse seg imorgen (sync). Er det fremdeles problemer etter 1 dag, meld sak til arbeidsgruppe identitet` })
    else return noData()
  }),
  test('vis-10', 'Undervisningsgrupper i ViS og PIFU', 'Sjekker at det er like undervisningsgrupper i ViS og PIFU', () => {
    if (!dataPresent || (!isTeacher(user) && !isStudent(user)) || !user.samAccountName) return noData()
    if (!hasData(systemData.pifu)) return error({ message: 'Bruker finnes ikke i PIFU-basen 😬', solution: `Rettes i ${systemNames.vis}. Hvis det allerede er korrekt i ${systemNames.vis}, vil dette løse seg imorgen (sync). Er det fremdeles problemer etter 1 dag, meld sak til arbeidsgruppe identitet` })

    const pifuGroups = systemData.pifu.undervisningsgruppeIds
    const visGroups = user.expectedType === 'employee'
      ? getUndervisningsforhold(systemData).undervisningsgrupper
      : user.expectedType === 'student'
        ? getElevforhold(systemData).undervisningsgrupper
        : []
    const missingGroups = getMissingGroups(pifuGroups, visGroups)
    if (missingGroups.length > 0) return error({ message: `Mangler ${missingGroups.length} ${missingGroups.length === 1 ? 'undervisningsgruppe' : 'undervisningsgrupper'} i PIFU-basen 😬`, raw: missingGroups, solution: `Rettes i ${systemNames.vis}. Hvis det allerede er korrekt i ${systemNames.vis}, vil dette løse seg imorgen (sync). Er det fremdeles problemer etter 1 dag, meld sak til arbeidsgruppe identitet` })
    else return noData()
  }),
  test('vis-11', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent || (!systemData.person && !systemData.skoleressurs)) return noData()
    const fnr = systemData.person ? systemData.person.fodselsnummer.identifikatorverdi : systemData.skoleressurs.person.fodselsnummer.identifikatorverdi
    const data = {
      id: fnr,
      fnr: isValidFnr(fnr)
    }
    return data.fnr.valid ? success({ message: `Har gyldig ${data.fnr.type}`, raw: data }) : error({ message: data.fnr.error, raw: data })
  }),
  test('vis-12', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og ViS', () => {
    if (!dataPresent || (!systemData.person && !systemData.skoleressurs)) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error({ message: `Mangler ${systemNames.ad}-data`, raw: allData.ad })

    const fnr = systemData.person ? systemData.person.fodselsnummer.identifikatorverdi : systemData.skoleressurs.person.fodselsnummer.identifikatorverdi
    const data = {
      vis: {
        id: fnr
      },
      ad: {
        employeeNumber: allData.ad.employeeNumber
      }
    }
    return data.vis.id === data.ad.employeeNumber ? success({ message: `Fødselsnummer er likt i ${systemNames.ad} og ${systemNames.vis}`, raw: data }) : error({ message: `Fødselsnummer er forskjellig i ${systemNames.ad} og ${systemNames.vis}`, raw: data })
  }),
  test('vis-13', 'Har mobiltelefonnumer', 'Sjekker at mobiltelefonnummer er registrert i ViS', () => {
    if (!dataPresent) return noData()

    if (user.expectedType === 'student') {
      if (systemData.person.kontaktinformasjon.mobiltelefonnummer) return noData()
      return warn({ message: `Mobiltelefonnummer ikke registrert i ${systemNames.vis}`, raw: systemData.person.kontaktinformasjon, solution: `Rettes i ${systemNames.vis}` })
    } else if (user.expectedType === 'employee' && isTeacher(user)) {
      if (systemData.skoleressurs.person.kontaktinformasjon.mobiltelefonnummer) return noData()
      return warn({ message: `Mobiltelefonnummer ikke registrert i ${systemNames.vis}`, raw: systemData.skoleressurs.person.kontaktinformasjon, solution: `Rettes i ${systemNames.vis}` })
    }
  }),
  test('vis-14', 'Har feidenavn', 'Sjekker at feidenavn er skrevet tilbake i ViS', () => {
    if (!dataPresent) return noData()
    if (user.expectedType === 'student' && (!systemData.person || !systemData.person.elev)) return noData()
    if (user.expectedType === 'employee' && !systemData.skoleressurs) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.feide)) return error({ message: `Mangler ${systemNames.feide}-data`, raw: allData.feide })

    if (user.expectedType === 'student') {
      if (systemData.person.elev.feidenavn && systemData.person.elev.feidenavn.identifikatorverdi) return systemData.person.elev.feidenavn.identifikatorverdi === allData.feide.eduPersonPrincipalName ? noData() : error({ message: `${systemNames.feide}-id skrevet tilbake er ikke riktig 😱`, raw: { vis: systemData.person.elev.feidenavn, feide: allData.feide.eduPersonPrincipalName }, solution: 'Meld sak til arbeidsgruppe identitet' })
      else return error({ message: `${systemNames.feide}-id er ikke skrevet tilbake 😬`, raw: systemData.person.elev.feidenavn, solution: `${systemNames.vis} systemansvarlig må kontakte leverandør da dette må fikses i bakkant!` })
    } else if (user.expectedType === 'employee' && isTeacher(user)) {
      if (systemData.skoleressurs.feidenavn && systemData.skoleressurs.feidenavn.identifikatorverdi) return systemData.skoleressurs.feidenavn.identifikatorverdi === allData.feide.eduPersonPrincipalName ? noData() : error({ message: `${systemNames.feide}-id skrevet tilbake er ikke riktig 😱`, raw: { vis: systemData.skoleressurs.feidenavn, feide: allData.feide.eduPersonPrincipalName }, solution: 'Meld sak til arbeidsgruppe identitet' })
      else return error({ message: `${systemNames.feide}-id er ikke skrevet tilbake 😬`, raw: systemData.skoleressurs.feidenavn, solution: `${systemNames.vis} systemansvarlig må kontakte leverandør da dette må fikses i bakkant!` })
    }
  })
])

module.exports.getActiveData = getActiveData
module.exports.getActiveMemberships = getActiveMemberships
