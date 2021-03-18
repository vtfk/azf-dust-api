const { hasData } = require('../../lib/helpers/system-data')

test('Returnerer true om et array har innhold', () => {
  expect(hasData(['hei'])).toBe(true)
})

test('Returnerer false om et array ikke har innhold', () => {
  expect(hasData([])).toBe(false)
})

test('Returnerer true om et objekt har properties (annet enn length)', () => {
  expect(hasData({ name: 'hei' })).toBe(true)
})

test('Returnerer false om et objekt ikke har har properties (eller bare har length)', () => {
  expect(hasData({})).toBe(false)
})

test('Returnerer true om det ikke er et array og ikke er et objekt og heller ikke er undefined', () => {
  expect(hasData('hei')).toBe(true)
})

test('Returnerer false om det ikke er et array og ikke er et objekt men er undefined', () => {
  expect(hasData(undefined)).toBe(false)
})

test('Returnerer false om det ikke er gitt med noen ting', () => {
  expect(hasData()).toBe(false)
})
