const isWithinDaterange = require('../../lib/helpers/is-within-daterange')

test('Returnerer false om ingen datoer er angitt', () => {
  expect(isWithinDaterange()).toBe(false)
  expect(isWithinDaterange('', '')).toBe(false)
})

test('Returnerer true om datoen er mellom start- og sluttdatoen', () => {
  const now = new Date('2020-02-01')
  expect(isWithinDaterange('2020-01-01', '2020-03-01', now)).toBe(true)
  expect(isWithinDaterange('2020-01-01', '', now)).toBe(true)
  expect(isWithinDaterange('', '2020-03-01', now)).toBe(true)
})

test('Returnerer false om datoen ikke har passert startdatoen enda', () => {
  const now = new Date('2020-02-01')
  expect(isWithinDaterange('2020-03-01', '2020-04-01', now)).toBe(false)
  expect(isWithinDaterange('2020-02-02', '', now)).toBe(false)
})

test('Returnerer false om datoen har passert sluttdatoen', () => {
  const now = new Date('2020-02-01')
  expect(isWithinDaterange('2020-01-01', '2020-01-02', now)).toBe(false)
  expect(isWithinDaterange('', '2020-01-01', now)).toBe(false)
})
