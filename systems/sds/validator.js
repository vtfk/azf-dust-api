const { test, success, error, waitForData, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('sds-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    return dataPresent ? success('Har data') : noData()
  }),
  test('sds-02', 'Har person- og gruppemedlemskap', 'Sjekker at det finnes person og gruppemedlemskap', () => {
    if (!dataPresent) return noData()
    const missingPerson = systemData.filter(obj => !obj.person)
    const missingEnrollments = systemData.filter(obj => !obj.enrollments)
    if (hasData(missingPerson)) return error('Person-objekt mangler 🤭', systemData)
    else if (hasData(missingEnrollments)) return error('Gruppemedlemskap mangler 🤭', systemData)
    return success('Har person og gruppemedlemskap', systemData)
  }),
  test('sds-03', 'Er medlem av SDS-gruppen(e) i Azure AD', 'Sjekker at bruker er medlem av SDS-gruppen(e) i Azure AD', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.aad)) return error('Mangler Azure AD data', allData)

    const aadMemberGroups = allData.aad.transitiveMemberOf.filter(member => member && hasData(member.displayName)).map(member => member.displayName)
    const wrongEnrollments = []
    systemData.forEach(obj => {
      // implement check for each group in enrollments for existens in aad data
      if (!hasData(obj.enrollments)) return

      const wrongInnerEnrollments = obj.enrollments.filter(innerObj => !aadMemberGroups.includes(innerObj.sectionName) && !aadMemberGroups.includes(innerObj.sectionId))
      if (hasData(wrongInnerEnrollments)) {
        wrongEnrollments.push({
          person: obj.person,
          enrollments: wrongInnerEnrollments
        })
      }
    })
    if (hasData(wrongEnrollments)) return error('Mangler medlemskap i en eller flere SDS-grupper i Azure AD 🤭', wrongEnrollments)
    else return success('Har medlemskap i alle sine SDS-grupper i Azure AD', systemData)
  })
])
