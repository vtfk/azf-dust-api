const { test, success, error, warn, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isTeacher = require('../../lib/helpers/is-teacher')
const getAadGroups = require('../../lib/get-aad-groups')
const getSdsGroups = require('../../lib/get-sds-groups')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('sds-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent) {
      if (user.expectedType === 'student') return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i Visma InSchool' })
      else if (!user.company || !user.title) return warn('Mangler data. Dessverre er det ikke nok informasjon tilstede på brukerobjektet for å kontrollere om dette er korrekt')
      else if (isTeacher(user.company, user.title)) return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i Visma InSchool' })
      else return success('Bruker har ikke data i dette systemet. Det er kun elever og lærere som skal ha data her')
    } else return success('Har data')
  }),
  test('sds-02', 'Har person- og gruppemedlemskap', 'Sjekker at det finnes person- og gruppemedlemskap', () => {
    if (!dataPresent) return noData()
    const missingPerson = systemData.filter(obj => !obj.person)
    const missingEnrollments = systemData.filter(obj => !obj.enrollments)
    if (hasData(missingPerson)) return error({ message: 'Person-objekt mangler 🤭', raw: systemData, solution: 'Rettes i Visma InSchool' })
    else if (hasData(missingEnrollments)) return error({ message: 'Gruppemedlemskap mangler 🤭', raw: systemData, solution: 'Rettes i Visma InSchool' })
    return success({ message: 'Har person og gruppemedlemskap', raw: systemData })
  }),
  test('sds-03', 'Er medlem av SDS-gruppen(e) i Azure AD', 'Sjekker at bruker er medlem av SDS-gruppen(e) i Azure AD', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.aad)) return error({ message: 'Mangler Azure AD data', raw: allData.ad })

    // TODO: Lærer skal være eier av gruppa i AAD. Eleven skal være med lem

    const aadGroups = getAadGroups(allData.aad.transitiveMemberOf).map(group => group.mailNickname)
    const sdsGroups = getSdsGroups(systemData)
    const wrongEnrollments = sdsGroups.filter(group => !aadGroups.includes(`Section_${group}`))
    if (hasData(wrongEnrollments)) return error({ message: `Mangler medlemskap i ${wrongEnrollments.length} SDS-gruppe${wrongEnrollments.length > 1 ? 'r' : ''} i Azure AD 🤭`, raw: wrongEnrollments, solution: 'Rettes i Visma InSchool' })
    else return success({ message: 'Har medlemskap i alle sine SDS-grupper i Azure AD', solution: systemData })
  })
])
