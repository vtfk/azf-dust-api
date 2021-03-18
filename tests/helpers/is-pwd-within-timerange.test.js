const isPwdWithinTimerange = require('../../lib/helpers/is-pwd-within-timerange')

const getResult = (one, two) => isPwdWithinTimerange(new Date(one), new Date(two)).result

test('Returnerer false om ingen datoer er gyldige', () => {
  expect(getResult(undefined, undefined)).toBe(false)
})

test('Returnerer false om første dato mangler', () => {
  expect(getResult(undefined, '2019-11-18T15:18:10.6601414+01:00')).toBe(false)
})

test('Returnerer false om andre dato mangler', () => {
  expect(getResult('2019-11-18T15:18:10.6601414+01:00', undefined)).toBe(false)
})

test('Returnerer true om det er <= 15 sekunder mellom andre dato og første dato', () => {
  expect(getResult('2019-11-18T15:18:10.6601414+01:00', '2019-11-18T15:18:11.6601414+01:00')).toBe(true)
})

test('Returnerer false om det er > 15 sekunder mellom andre dato og første dato', () => {
  expect(getResult('2019-11-18T15:18:10.6601414+01:00', '2019-11-18T15:18:26.6601414+01:00')).toBe(false)
})
