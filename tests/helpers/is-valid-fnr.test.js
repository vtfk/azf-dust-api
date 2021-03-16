const isValidFnr = require('../../lib/helpers/is-valid-fnr')

const lengthError = { valid: false, error: 'Fødselsnummeret har ugyldig lengde' }
const dateError = { valid: false, error: 'Fødselsnummeret har ugyldig dato' }

const validFnr = { valid: true, type: 'Fødselsnummer' }
const validVIGO = { valid: true, type: 'VIGO-nummer' }
const validDnr = { valid: true, type: 'D-nummer' }

const invalidDnr = { valid: false, error: 'D-nummeret er ugyldig' }
const invalidFnr = { valid: false, error: 'Fødselsnummeret er ugyldig' }

test('Verdier med feil lengde kaster feil', () => {
  expect(isValidFnr()).toMatchObject(lengthError)
  expect(isValidFnr('010101')).toMatchObject(lengthError)
  expect(isValidFnr('111111111111')).toMatchObject(lengthError)
})

test('Kaster ikke feil om lengden er korrekt', () => {
  expect(isValidFnr('11111111111')).not.toMatchObject(lengthError)
})

test('Dato håndteres riktig', () => {
  expect(isValidFnr('13097248022')).toMatchObject(validFnr)
  expect(isValidFnr('29020075838')).toMatchObject(validFnr)
  expect(isValidFnr('29020112345')).toMatchObject(dateError)
  expect(isValidFnr('32127248022')).toMatchObject(dateError)
  expect(isValidFnr('13137248022')).toMatchObject(dateError)
})

test('VIGO-nummer oppdages korrekt', () => {
  expect(isValidFnr('42010099038')).toMatchObject(validVIGO)
  expect(isValidFnr('42010039038')).not.toMatchObject(validVIGO)
  expect(isValidFnr('02010099038')).not.toMatchObject(validVIGO)
})

test('D-nummer oppdages korrekt', () => {
  expect(isValidFnr('53097248016')).toMatchObject(validDnr)
  expect(isValidFnr('53097248026')).toMatchObject(invalidDnr)
  expect(isValidFnr('53107248016')).toMatchObject(invalidDnr)
  expect(isValidFnr('13097248016')).toMatchObject(invalidFnr)
})

test('Fødselsnummer oppdages korrekt', () => {
  expect(isValidFnr('01010750160')).toMatchObject(validFnr)
  expect(isValidFnr('15021951940')).toMatchObject(validFnr)
})

test('Sjekksum 1 ugyldig', () => {
  expect(isValidFnr('13097248032')).toMatchObject(invalidFnr)
})

test('Sjekksum 2 ugyldig', () => {
  expect(isValidFnr('13097248023')).toMatchObject(invalidFnr)
})
