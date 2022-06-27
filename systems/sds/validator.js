const { test, success, error, waitForData, warn, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const { isTeacher } = require('../../lib/helpers/is-type')
const getSdsGroups = require('../../lib/get-sds-groups')
const systemNames = require('../../lib/data/systems.json')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('sds-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent) {
      if (user.expectedType === 'student') return error({ message: 'Mangler data 😬', raw: systemData, solution: `Rettes i ${systemNames.vis}` })
      else if (isTeacher(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: `Rettes i ${systemNames.vis}` })
      else return success('Bruker har ikke data i dette systemet. Det er kun elever og lærere som skal ha data her')
    } else return success('Har data')
  }),
  test('sds-02', 'Har person- og gruppemedlemskap', 'Sjekker at det finnes person- og gruppemedlemskap', () => {
    if (!dataPresent) return noData()
    const missingPerson = systemData.filter(obj => !obj.person)
    const missingEnrollments = systemData.filter(obj => !obj.enrollments)
    if (hasData(missingPerson)) return error({ message: 'Person-objekt mangler 😬', raw: systemData, solution: `Rettes i ${systemNames.vis}` })
    else if (hasData(missingEnrollments)) return error({ message: 'Gruppemedlemskap mangler 😬', raw: systemData, solution: `Rettes i ${systemNames.vis}` })
    return success({ message: 'Har person- og gruppemedlemskap', raw: systemData })
  }),
  test('sds-03', 'Er medlem av SDS-gruppen(e) i Azure AD', 'Sjekker at bruker er medlem av SDS-gruppen(e) i Azure AD', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.aad)) return error({ message: `Mangler ${systemNames.aad} data`, raw: allData.ad })

    const aadGroups = allData.aad.transitiveMemberOf.map(group => group.mailNickname)
    const sdsGroups = getSdsGroups(systemData)
    const wrongEnrollments = sdsGroups.filter(group => !aadGroups.includes(`Section_${group}`))
    if (hasData(wrongEnrollments)) return error({ message: `Mangler medlemskap i ${wrongEnrollments.length} ${systemNames.sds} gruppe${wrongEnrollments.length > 1 ? 'r' : ''} i ${systemNames.aad} 😬`, raw: wrongEnrollments, solution: `Bruker meldes inn i Team(s) fra ${systemNames.aad} / Teams Admin Center` })
    else return success({ message: `Har medlemskap i alle sine ${systemNames.sds} grupper i ${systemNames.aad}`, raw: systemData })
  }),
  test('sds-04', 'For mange SDS-grupper i Azure AD', 'Sjekker om bruker er medlem av for mange SDS-grupper i Azure AD', () => {
    if (!dataPresent) return noData()
    if (!allData) return waitForData()
    if (!hasData(allData.aad)) return error({ message: `Mangler ${systemNames.aad} data`, raw: allData.ad })

    const aadGroups = allData.aad.transitiveMemberOf.map(group => group.mailNickname)
    const sdsGroups = getSdsGroups(systemData)
    const wrongEnrollments = aadGroups.filter(group => !sdsGroups.includes(group.replace('Section_', '')))
    if (hasData(wrongEnrollments)) return warn({ message: `Bruker har flere medlemskap enn det som er registrert i ${systemNames.vis}`, raw: wrongEnrollments, solution: `Bruker kan selv melde seg ut av Team. Utmelding kan også gjøres av IT via ${systemNames.aad} / Teams Admin Center` })
    else return noData()
  })
])
