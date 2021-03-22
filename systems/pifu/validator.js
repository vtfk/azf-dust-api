const { test, success, warn, error, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const isWithinDaterange = require('../../lib/helpers/is-within-daterange')
const { SYSTEMS } = require('../../config')

const getEmployeeNumber = data => {
  if (hasData(data)) {
    const user = data.filter(user => user.useridtype === 'personNIN')
    if (hasData(user)) return user[0].text
    else return false
  } else return false
}
const getMemberships = data => hasData(data) ? data.filter(item => !!item.member.role.timeframe) : false
const getUserIdType = (data, userType) => hasData(data) ? data.filter(item => item.useridtype === userType).map(item => item.useridtype) : false

module.exports = (systemData, user, allData = false) => ([
  test('pifu-01', 'Har et person-objekt', 'Sjekker at det finnes et person-objekt', () => {
    if (!hasData(systemData.person)) return error('Person-objekt mangler 🤭', systemData)
    const data = {
      person: systemData.person
    }
    return success('Har et person-objekt', data)
  }),
  test('pifu-02', 'Har riktig person-type', 'Sjekker at det er riktig person-type', () => {
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
  }),
  test('pifu-03', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!hasData(systemData.person)) return error('Person-objekt mangler 🤭', systemData)
    else if (!hasData(systemData.person.userid)) return error('Person-objekt mangler userid oppføringer 🤭', systemData)
    const employee = getEmployeeNumber(systemData.person.userid)
    const data = {
      id: employee,
      fnr: isValidFnr(employee)
    }
    return data.fnr.valid ? success(`Har gyldig ${data.fnr.type}`, data) : error(data.fnr.error, data)
  }),
  test('pifu-04', 'Fødselsnummer er likt i AD', 'Sjekker at fødselsnummeret er likt i AD og Extens', () => {
    if (!allData) return noData('Venter på data...')
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
  test('pifu-05', 'Har gruppemedlemskap', 'Sjekker at det finnes gruppemedlemskap', () => {
    // TODO: Bør det sjekkes noe mere here? Er det noen ganger det er riktig at det ikke er noen gruppemedlemskap?
    const memberships = getMemberships(systemData.memberships)
    if (!hasData(memberships)) return error('Har ingen gruppemedlemskap 🤭', systemData)
    else return success(`Har ${memberships.length} gruppemedlemskap`, memberships)
  }),
  test('pifu-06', 'Har riktig rolletype', 'Sjekker at det er riktig rolletype i gruppemedlemskapene', () => {
    const memberships = getMemberships(systemData.memberships)
    if (!hasData(memberships)) return error('Har ingen gruppemedlemskap 🤭', systemData)
    const data = memberships.map(membership => ({ id: membership.sourcedid.id, type: membership.member.role.roletype }))
    if (user.expectedType === 'employee') {
      const wrongMemberships = data.filter(item => item.type !== SYSTEMS.PIFU.MEMBERSHIP_EMPLOYEE_ROLETYPE)
      return hasData(wrongMemberships) ? warn(`Har ${wrongMemberships.length} gruppemedlemskap med feil rolletype. Dersom vedkommende er elev i disse gruppene er dette allikevel riktig`, data) : success('Har riktig rolletype i alle gruppemedlemskapene', data)
    } else {
      const wrongMemberships = data.filter(item => item.type !== SYSTEMS.PIFU.MEMBERSHIP_STUDENT_ROLETYPE)
      return hasData(wrongMemberships) ? error(`Har ${wrongMemberships.length} gruppemedlemskap med feil rolletype`, data) : success('Har riktig rolletype i alle gruppemedlemskapene', data)
    }
  }),
  test('pifu-07', 'Gruppemedlemskapet er gyldig', 'Sjekker at gruppemedlemskapene ikke er avlsuttet', () => {
    const memberships = getMemberships(systemData.memberships)
    if (!hasData(memberships)) return error('Har ingen gruppemedlemskap 🤭', systemData)
    const invalidMemberships = memberships.filter(item => !isWithinDaterange(item.member.role.timeframe.begin.text, item.member.role.timeframe.end.text))
    return hasData(invalidMemberships) ? error(`Har ${invalidMemberships.length} ugyldige gruppemedlemskap av totalt ${memberships.length} gruppemedlemskap`, invalidMemberships) : success('Alle gruppemedlemskap er gyldige', memberships)
  })
])
