const { test, success, error, warn, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')

const systemNames = require('../../lib/data/systems.json')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('p360-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    return dataPresent ? success('Har data') : error({ message: 'Mangler data i dette systemet', solution: `Rettes i ${systemNames.p360}` })
  }),
  test('p360-02', 'Har aktiv p360 bruker', `Sjekker at brukeren er aktiv i ${systemNames.p360}`, () => {
    if (!dataPresent) return noData()
    if (user.expectedType === 'employee' && systemData.p360User.length === 0) return success({ message: `Har ikke bruker i ${systemNames.p360}`, solution: `Rettes i ${systemNames.p360} om hen skal ha tilgang` })
    if (user.expectedType === 'employee' && systemData.p360User.length === 1) {
      return systemData.p360User[0].IsActive ? success({ message: `Har aktiv bruker i ${systemNames.p360}` }) : warn({ message: `Har bruker i ${systemNames.p360}, men den er deaktivert`, solution: `Rettes i ${systemNames.p360} om hen skal ha tilgang` })
    }
    if (user.expectedType === 'employee' && systemData.p360User.length > 1) return warn({ message: `Har flere aktive brukere i ${systemNames.p360}, det var rart...`, solution: `Rettes i ${systemNames.p360}` })
    if (user.expectedType === 'student' && systemData.p360User.length > 0) return error({ message: `Elev har bruker i ${systemNames.p360}, det skal da ikke være sånn!`, raw: { p360User: systemData.p360User }, solution: `Rettes i ${systemNames.p360}` })
    return noData()
  }),
  test('p360-03', 'Er elev og har elevmappe', `Sjekker at elev har en elevmappe i ${systemNames.p360}`, () => {
    if (!dataPresent) return noData()
    // Søk etter meg om det blir elevmappetrøbbel i testene
    if (user.expectedType === 'student' && systemData.p360Elevmappe.length === 1) return success({ message: `Elev har en elevmappe i ${systemNames.p360}` })
    if (user.expectedType === 'student' && systemData.p360Elevmappe.length === 0) return warn({ message: `Elev har ingen elevmappe i ${systemNames.p360}`, solution: `Rettes i ${systemNames.p360} om det er slik at eleven skal ha elevmappe. Noen få elever skal ikke ha, f. eks de som tar matte på nettskolen.` })
    if (user.expectedType === 'student' && systemData.p360Elevmappe.length > 1) return warn({ message: `Elev har flere elevmapper i ${systemNames.p360}`, solution: `Rettes i ${systemNames.p360}` })
    return noData()
  }),
  test('p360-04', 'Er elev og har elevmappe med rett format', `Sjekker at elevens elevmappe har korrekt tittel i ${systemNames.p360}`, () => {
    if (!dataPresent) return noData()
    // Søk etter meg om det blir elevmappetrøbbel i testene
    if (user.expectedType === 'student' && systemData.p360Elevmappe.length === 1) {
      const correctFormat = {
        correctTitle: 'Elevmappe',
        rawTitle: systemData.p360Elevmappe[0].Title
      }
      if (correctFormat.correctTitle === correctFormat.rawTitle) {
        return success({ message: `Elevmappe har korrekt tittel i ${systemNames.p360}`, raw: correctFormat })
      } else {
        return error({ message: `Elevmappe har feil tittel i ${systemNames.p360}`, raw: correctFormat, solution: `Rettes i ${systemNames.p360}. (trolig et ekstra mellomrom på slutten)` })
      }
    }
    return noData()
  }),
  test('p360-05', 'Er ansatt og har personalprosjekt', `Sjekker at ansatt har et personalprosjekt i ${systemNames.p360}`, () => {
    if (!dataPresent) return noData()
    if (user.expectedType === 'employee' && systemData.p360EmployeeProject.length === 1) return success({ message: `Ansatt har et personalprosjekt i ${systemNames.p360}` })
    if (user.expectedType === 'employee' && systemData.p360EmployeeProject.length === 0) return error({ message: `Ansatt har ikke personalprosjekt i ${systemNames.p360}`, solution: `Rettes i ${systemNames.p360}` })
    if (user.expectedType === 'employee' && systemData.p360EmployeeProject.length > 1) return warn({ message: `Ansatt har flere personalprosjekt i ${systemNames.p360}`, solution: `Rettes i ${systemNames.p360}` })
    return noData()
  })
])
