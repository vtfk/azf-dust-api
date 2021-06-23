const { test, success, warn, error, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const isWithinDaterange = require('../../lib/helpers/is-within-daterange')
const isTeacher = require('../../lib/helpers/is-teacher')
const isSchoolEmployee = require('../../lib/helpers/is-school-employee')
const { SYSTEMS } = require('../../config')

const getEmployeeNumber = data => {
  if (hasData(data)) {
    const user = data.filter(user => user.useridtype === 'personNIN')
    if (hasData(user)) return user[0].text
    else return false
  } else return false
}
const isTeachingGroup = data => data.startsWith('1_') || data.startsWith('2_') || data.startsWith('3_') || data.startsWith('4_') || data.startsWith('5_') || data.startsWith('6_') || data.startsWith('7_')
const getMembershipsWithTimeframe = data => hasData(data) ? data.filter(item => !!item.member.role.timeframe && isTeachingGroup(item.sourcedid.id)) : []
const getAllMemberships = data => hasData(data) ? data : []
const getUserIdType = (data, userType) => hasData(data) ? data.filter(item => item.useridtype === userType).map(item => item.useridtype) : false

const getExpiredMemberships = data => {
  return data.filter(item => {
    const begin = item.member.role.timeframe.begin.text || item.member.role.timeframe.begin
    const end = item.member.role.timeframe.end.text || item.member.role.timeframe.end

    return !isWithinDaterange(begin, end)
  })
}

/* const getPerson = systemData => {
  if (!hasData(systemData.person)) return error('Person-objekt mangler 🤭', systemData)
  const data = {
    person: systemData.person
  }
  return success('Har et person-objekt', data)
} */

/* const getPersonType = (systemData, user) => {
  if (!hasData(systemData.person)) return noData()
  else if (!hasData(systemData.person.userid)) return error('Person-objekt mangler userid-oppføringer', systemData)

  const employeeType = getUserIdType(systemData.person.userid, SYSTEMS.PIFU.PERSON_EMPLOYEE_TYPE)
  const studentType = getUserIdType(systemData.person.userid, SYSTEMS.PIFU.PERSON_STUDENT_TYPE)
  if (user.expectedType === 'employee') {
    if (hasData(employeeType)) return success('Person-objekt har riktig person-type', employeeType)
    else if (hasData(studentType)) return error('Person-objekt har feil person-type', studentType)
    else return error('Person-objektet mangler person-type 🤭', systemData.person.userid)
  } else {
    if (hasData(studentType)) return success('Person-objekt har riktig person-type', studentType)
    else if (hasData(employeeType)) return error('Person-objekt har feil person-type', employeeType)
    else return error('Person-objektet mangler person-type 🤭', systemData.person.userid)
  }
} */

const getActiveData = (data, user) => {
  // TODO: Noe må gjørras her....
  const person = getPerson(data)
  const personType = getPersonType(data, user)
  return {
    person: {
      message: person.message,
      raw: person.raw
    },
    personType: {
      message: personType.message,
      raw: personType.raw
    }
  }
}

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('vis-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent) {
      if (user.expectedType === 'student') return error('Mangler data 😬', systemData)
      else if (!user.company || !user.title) return warn('Mangler data. Dessverre er det ikke nok informasjon tilstede på brukerobjektet for å kontrollere om dette er korrekt')
      else if (isTeacher(user.company, user.title)) return error('Mangler data 😬', systemData)
      else if (isSchoolEmployee(user)) return warn('Data mangler til tross for skoletilhørighet 😬', systemData)
      else return success('Bruker har ikke data i dette systemet')
    } else return success('Har data')
  }),
  test('vis-02', 'Har riktig forhold', 'Sjekker at bruker har riktig forhold', () => {
    if (!dataPresent) return noData()
    if (user.expectedType === 'student') {
      if (systemData.person.personalressurs !== null && systemData.person.elev !== null) return error('Bruker har både elev- og ansattforhold 😬', systemData)
      else if (systemData.person.personalressurs !== null && systemData.person.elev === null) return error('Elev har bare ansattforhold 😬', systemData)
      else if (systemData.person.personalressurs === null && systemData.person.elev === null) return error('Mangler elevforhold 😬😬', systemData)
      return success('Bruker har elevforhold', systemData)
    } else {
      if (systemData.person.personalressurs !== null && systemData.person.elev !== null) return error('Bruker har både elev- og ansattforhold 😬', systemData)
      else if (systemData.person.personalressurs === null && systemData.person.elev !== null) return error('Ansatt har bare elevforhold 😬', systemData)
      else if (systemData.person.personalressurs === null && systemData.person.elev === null) return error('Mangler ansattforhold 😬😬', systemData)
      return success('Bruker har ansattforhold', systemData)
    }
  }),
  test('vis-03', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    if (!hasData(systemData.person)) return noData()
    else if (!hasData(systemData.person.userid)) return noData()
    const employee = getEmployeeNumber(systemData.person.userid)
    const data = {
      id: employee,
      fnr: isValidFnr(employee)
    }
    return data.fnr.valid ? success(`Har gyldig ${data.fnr.type}`, data) : error(data.fnr.error, data)
  }),
  test('vis-04', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og Extens', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error('Mangler AD-data', allData)

    if (!hasData(systemData.person)) return noData()
    else if (!hasData(systemData.person.userid)) return noData()
    const employee = getEmployeeNumber(systemData.person.userid)
    const data = {
      pifu: {
        id: employee
      },
      ad: {
        employeeNumber: allData.ad.employeeNumber
      }
    }
    if (data.pifu.id === data.ad.employeeNumber) return success('Fødselsnummer er likt i AD og Extens', data)
    else return error('Fødselsnummer er forskjellig i AD og Extens', data)
  }),
  test('vis-05', 'Har aktive gruppemedlemskap', 'Sjekker at det finnes aktive gruppemedlemskap', () => {
    if (!dataPresent) return noData()
    const activeMemberships = getMembershipsWithTimeframe(systemData.memberships)
    const allMemberships = getAllMemberships(systemData.memberships)
    const userIsTeacher = isTeacher(user.company, user.title)
    if (!hasData(activeMemberships)) {
      if (hasData(allMemberships)) {
        if (userIsTeacher) return error('Har ingen aktive gruppemedlemskap (MinElev)', systemData)
        else return success('Har ingen aktive gruppemedlemskap (MinElev)', systemData)
      } else {
        if (userIsTeacher) return error('Har ingen gruppemedlemskap (MinElev) 🤭', systemData)
        else return success('Har ingen gruppemedlemskap (MinElev)', systemData)
      }
    } else return success(`Har ${activeMemberships.length} aktive gruppemedlemskap (MinElev)`, activeMemberships)
  }),
  test('vis-06', 'Har riktig rolletype', 'Sjekker at det er riktig rolletype i gruppemedlemskapene', () => {
    if (!dataPresent) return noData()
    const activeMemberships = getMembershipsWithTimeframe(systemData.memberships)
    if (!hasData(activeMemberships)) return noData('Mangler aktive gruppemedlemskap')
    const data = activeMemberships.map(membership => ({ id: membership.sourcedid.id, type: membership.member.role.roletype }))
    if (user.expectedType === 'employee') {
      const wrongMemberships = data.filter(item => item.type !== SYSTEMS.PIFU.MEMBERSHIP_EMPLOYEE_ROLETYPE)
      return hasData(wrongMemberships) ? warn(`Har ${wrongMemberships.length} aktive gruppemedlemskap med feil rolletype. Dersom vedkommende skal være elev i disse gruppene er dette allikevel riktig`, data) : success('Har riktig rolletype i alle aktive gruppemedlemskap', data)
    } else {
      const wrongMemberships = data.filter(item => item.type !== SYSTEMS.PIFU.MEMBERSHIP_STUDENT_ROLETYPE)
      return hasData(wrongMemberships) ? error(`Har ${wrongMemberships.length} aktive gruppemedlemskap med feil rolletype`, data) : success('Har riktig rolletype i alle aktive gruppemedlemskap', data)
    }
  }),
  test('vis-07', 'Gruppemedlemskapet er gyldig', 'Sjekker at gruppemedlemskapene ikke er avsluttet', () => {
    if (!dataPresent) return noData()
    const activeMemberships = getMembershipsWithTimeframe(systemData.memberships)
    const userIsTeacher = isTeacher(user.company, user.title)
    if (!hasData(activeMemberships)) {
      if (userIsTeacher) return warn('Mangler aktive gruppemedlemskap (MinElev)', systemData)
      else return noData('Mangler aktive gruppemedlemskap (MinElev)')
    }
    const expiredMemberships = getExpiredMemberships(activeMemberships)
    return hasData(expiredMemberships) ? error(`Har ${expiredMemberships.length} avsluttede gruppemedlemskap av totalt ${activeMemberships.length} gruppemedlemskap`, expiredMemberships) : success('Alle gruppemedlemskap er gyldige', activeMemberships)
  })
])

module.exports.getActiveData = getActiveData
module.exports.getActiveMemberships = getMembershipsWithTimeframe
