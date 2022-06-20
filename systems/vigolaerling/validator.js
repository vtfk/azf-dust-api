const { test, success, error, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const { isApprentice } = require('../../lib/helpers/is-type')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('vigolaerling-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (!dataPresent) {
      if (isApprentice(user)) return error({ message: 'Mangler data 😬', raw: systemData, solution: 'Rettes i VIGO Opplæring' })
      else return success('Bruker har ikke data i dette systemet. Det er kun lærlinger som skal ha data her')
    } else return success('Har data')
  }),
  test('vigolaerling-02', 'Har fornavn og etternavn', 'Sjekker at bruker er registrert med fornavn og etternavn', () => {
    if (!dataPresent) return noData()
    if (!systemData.fornavn || !systemData.etternavn) return error({ message: 'Mangler fornavn og/eller etternavn', raw: systemData, solution: 'Rettes i VIGO Opplæring' })
    else return success({ message: 'Har fornavn og etternavn', raw: { fornavn: systemData.fornavn, etternavn: systemData.etternavn } })
  }),
  test('vigolaerling-03', 'Har tilknytning til bedrift', 'Sjekker at bruker har tilknytning til bedrift', () => {
    if (!dataPresent) return noData()

    const data = {
      bedriftsnr: systemData.bnr,
      bedriftsNavn: systemData.bedrnavn
    }
    if (!data.bedriftsnr || !data.bedriftsNavn) return error({ message: 'Mangler tilknytning til bedrift', raw: data, solution: 'Rettes i VIGO Opplæring' })
    return success({ message: 'Har tilknytning til bedrift', raw: data })
  }),
  test('vigolaerling-04', 'Har start- og sluttdato', 'Sjekker at bruker har start- og sluttdato', () => {
    if (!dataPresent) return noData()

    const data = {
      start: systemData.start,
      slutt: systemData.slutt
    }
    if (!data.start || !data.slutt) return error({ message: 'Mangler start- og/eller sluttdato', raw: data, solution: 'Rettes i VIGO Opplæring' })
    return success({ message: 'Har start- og sluttdato', raw: data })
  }),
  test('vigolaerling-05', 'Har gyldig fødselsnummer', 'Sjekker at fødselsnummer er gyldig', () => {
    if (!dataPresent) return noData()
    if (!systemData.fnr) return error({ message: 'Fødselsnummer mangler 😬', raw: systemData })
    const data = {
      employeeNumber: systemData.fnr,
      fnr: isValidFnr(systemData.fnr)
    }
    return data.fnr.valid ? success({ message: `Har gyldig ${data.fnr.type}`, raw: data }) : error({ message: data.fnr.error, raw: data })
  })
])
