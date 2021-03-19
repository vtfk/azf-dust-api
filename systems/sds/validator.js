const { test, success, warn, error, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')

module.exports = (systemData, user, allData = false) => ([
  test('sds-01', 'Har person- og gruppemedlemskap', 'Sjekker at det finnes person og gruppemedlemskap', () => {
    const missingPerson = systemData.filter(obj => !obj.person)
    const missingEnrollments = systemData.filter(obj => !obj.enrollments)
    if (hasData(missingPerson)) return error('Person-objekt mangler 🤭', systemData)
    else if (hasData(missingEnrollments)) return error('Gruppemedlemskap mangler 🤭', systemData)
    return success('Har person og gruppemedlemskap', systemData)
  }),
  test('sds-02', 'SDS-gruppene er opprettet i Azure AD', 'Sjekker at SDS-gruppene er synkronisert ut til Azure AD', () => {
    if (!allData) return noData('Venter på data...')
    if (!hasData(allData.aad)) return error('Mangler AAD-data', allData)

    //const aadMemberGroups = allData.aad.memberOf.filter(member => hasData(member.displayName)).map(member => member.displayName)
    const wrongEnrollments = systemData.filter(obj => !!obj) // implement check for each group in enrollments for existens in aad data
    if (hasData(wrongEnrollments)) return error(`${wrongEnrollments.length} gruppe(r) mangler i Azure AD 🤭`, wrongEnrollments)
    else return success('Alle SDS-gruppene er synkronisert ut til Azure AD', systemData)
  })
])
