const { test, success, warn, error, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const isWithinDaterange = require('../../lib/helpers/is-within-daterange')
const schools = require('../data/schools.json')
const { SYSTEMS } = require('../../config')

const getEmployeeNumber = data => {
  if (hasData(data)) {
    const user = data.filter(user => user.useridtype === 'personNIN')
    if (hasData(user)) return user[0].text
    else return false
  } else return false
}
const getMembershipsWithTimeframe = data => hasData(data) ? data.filter(item => !!item.member.role.timeframe) : false
const getAllMemberships = data => hasData(data) ? data : false
const getUserIdType = (data, userType) => hasData(data) ? data.filter(item => item.useridtype === userType).map(item => item.useridtype) : false

const getExpiredMemberships = data => {
  return data.filter(item => {
    const begin = item.member.role.timeframe.begin.text || item.member.role.timeframe.begin
    const end = item.member.role.timeframe.end.text || item.member.role.timeframe.end

    return !isWithinDaterange(begin, end)
  })
}

const getPerson = systemData => {
  if (!hasData(systemData.person)) return error('Person-objekt mangler 🤭', systemData)
  const data = {
    person: systemData.person
  }
  return success('Har et person-objekt', data)
}

const getPersonType = (systemData, user) => {
  if (!hasData(systemData.person)) return error('Person-objekt mangler 🤭', systemData)
  else if (!hasData(systemData.person.userid)) return error('Person-objekt mangler userid oppføringer', systemData)

  const employeeType = getUserIdType(systemData.person.userid, SYSTEMS.PIFU.PERSON_EMPLOYEE_TYPE)
  const studentType = getUserIdType(systemData.person.userid, SYSTEMS.PIFU.PERSON_STUDENT_TYPE)
  if (user.expectedType === 'employee') {
    if (hasData(employeeType)) return success('Person-objekt har riktig person-type', employeeType)
    else if (hasData(studentType)) return error('Person-objekt har feil person-type', studentType)
    else return error('Peron-objektet mangler person-type 🤭', systemData.person.userid)
  } else {
    if (hasData(studentType)) return success('Person-objekt har riktig person-type', studentType)
    else if (hasData(employeeType)) return error('Person-objekt har feil person-type', employeeType)
    else return error('Peron-objektet mangler person-type 🤭', systemData.person.userid)
  }
}

const getActiveData = (data, user) => {
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
  test('pifu-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent && user.company && schools.includes(user.company)) return error('Mangler data 😬', systemData)
    else if (!dataPresent && user.expectedType === 'student') return error('Mangler data 😬', systemData)
    else if (!dataPresent && !user.company) return warn('Mangler data. Dessverre er det ikke nok informasjon tilstede på brukerobjektet for å kontrollere om dette er korrekt')
    return dataPresent ? success('Har data') : success('Bruker har ikke data i dette systemet')
  }),
  test('pifu-02', 'Har et person-objekt', 'Sjekker at det finnes et person-objekt', () => {
    if (!dataPresent) return noData()
    return getPerson(systemData)
  }),
  test('pifu-03', 'Har riktig person-type', 'Sjekker at det er riktig person-type', () => {
    if (!dataPresent) return noData()
    return getPersonType(systemData, user)
  }),
  test('pifu-04', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    if (!hasData(systemData.person)) return error('Person-objekt mangler 🤭', systemData)
    else if (!hasData(systemData.person.userid)) return error('Person-objekt mangler userid oppføringer 🤭', systemData)
    const employee = getEmployeeNumber(systemData.person.userid)
    const data = {
      id: employee,
      fnr: isValidFnr(employee)
    }
    return data.fnr.valid ? success(`Har gyldig ${data.fnr.type}`, data) : error(data.fnr.error, data)
  }),
  test('pifu-05', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og Extens', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.ad)) return error('Mangler AD-data', allData)

    if (!hasData(systemData.person)) return error('Person-objekt mangler 🤭', systemData)
    else if (!hasData(systemData.person.userid)) return error('Person-objekt mangler userid oppføringer 🤭', systemData)
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
  test('pifu-06', 'Har aktive gruppemedlemskap', 'Sjekker at det finnes aktive gruppemedlemskap', () => {
    // TODO: Bør det sjekkes noe mere here? Er det noen ganger det er riktig at det ikke er noen gruppemedlemskap?
    if (!dataPresent) return noData()
    const activeMemberships = getMembershipsWithTimeframe(systemData.memberships)
    const allMemberships = getAllMemberships(systemData.memberships)
    if (!hasData(activeMemberships)) return hasData(allMemberships) ? error('Har ingen aktive gruppemedlemskap', systemData) : error('Har ingen gruppemedlemskap 🤭', systemData)
    else return success(`Har ${activeMemberships.length} aktive gruppemedlemskap`, activeMemberships)
  }),
  test('pifu-07', 'Har riktig rolletype', 'Sjekker at det er riktig rolletype i gruppemedlemskapene', () => {
    if (!dataPresent) return noData()
    const activeMemberships = getMembershipsWithTimeframe(systemData.memberships)
    if (!hasData(activeMemberships)) return noData('Mangler aktive gruppemedlemskap')
    const data = activeMemberships.map(membership => ({ id: membership.sourcedid.id, type: membership.member.role.roletype }))
    if (user.expectedType === 'employee') {
      const wrongMemberships = data.filter(item => item.type !== SYSTEMS.PIFU.MEMBERSHIP_EMPLOYEE_ROLETYPE)
      return hasData(wrongMemberships) ? warn(`Har ${wrongMemberships.length} aktive gruppemedlemskap med feil rolletype. Dersom vedkommende faktisk er elev i disse gruppene er dette allikevel riktig`, data) : success('Har riktig rolletype i alle aktive gruppemedlemskap', data)
    } else {
      const wrongMemberships = data.filter(item => item.type !== SYSTEMS.PIFU.MEMBERSHIP_STUDENT_ROLETYPE)
      return hasData(wrongMemberships) ? error(`Har ${wrongMemberships.length} aktive gruppemedlemskap med feil rolletype`, data) : success('Har riktig rolletype i alle aktive gruppemedlemskap', data)
    }
  }),
  test('pifu-08', 'Gruppemedlemskapet er gyldig', 'Sjekker at gruppemedlemskapene ikke er avsluttet', () => {
    if (!dataPresent) return noData()
    const activeMemberships = getMembershipsWithTimeframe(systemData.memberships)
    if (!hasData(activeMemberships)) return noData('Mangler aktive gruppemedlemskap')
    const expiredMemberships = getExpiredMemberships(activeMemberships)
    return hasData(expiredMemberships) ? error(`Har ${expiredMemberships.length} avsluttede gruppemedlemskap av totalt ${activeMemberships.length} gruppemedlemskap`, expiredMemberships) : success('Alle gruppemedlemskap er gyldige', activeMemberships)
  })
])

module.exports.getActiveData = getActiveData
