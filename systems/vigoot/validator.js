const { test, success, error, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const { isOT } = require('../../lib/helpers/is-type')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('vigoot-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent) {
      if (isOT(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i VIGO OT' })
      else return success('Bruker har ikke data i dette systemet. Det er kun ungdommer i Oppfølgingstjenesten som skal ha data her')
    } else return success('Har data')
  }),
  test('vigoot-02', 'Har fornavn og etternavn', 'Sjekker at bruker er registrert med fornavn og etternavn', () => {
    if (!dataPresent) return noData()
    if (!systemData.fornavn || !systemData.etternavn) return error({ message: 'Mangler fornavn og/eller etternavn', raw: systemData, solution: 'Rettes i VIGO OT' })
    else return success({ message: 'Har fornavn og etternavn', raw: { fornavn: systemData.fornavn, etternavn: systemData.etternavn } })
  }),
  test('vigoot-03', 'Har tilknytning', 'Sjekker at bruker har tilknytning', () => {
    if (!dataPresent) return noData()

    const data = {
      tilknytningnr: systemData.tilknytningnr,
      tilknytningnavn: systemData.tilknytningnavn
    }
    if (!data.tilknytningnr || !data.tilknytningnavn) return error({ message: 'Mangler tilknytning', raw: data, solution: 'Rettes i VIGO OT' })
    return success({ message: 'Har tilknytning', raw: data })
  }),
  test('vigoot-04', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    if (!systemData.fnr) return error({ message: 'Fødselsnummer mangler 😬', raw: systemData })
    const data = {
      employeeNumber: systemData.fnr,
      fnr: isValidFnr(systemData.fnr)
    }
    return data.fnr.valid ? success({ message: `Har gyldig ${data.fnr.type}`, raw: data }) : error({ message: data.fnr.error, raw: data })
  })
])
