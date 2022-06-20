const { isApprentice, isOT, isEmployee, isStudent, isTeacher } = require('../../lib/helpers/is-type')

const apprenticeType = 'Lærling'
const otType = 'Elev-OT'
const employee = '@vtfk.no'
const studentType = 'Elev'

describe('isApprentice', () => {
  test('user object not set', () => {
    expect(isApprentice()).toBe(false)
  })

  test('type not set', () => {
    expect(isApprentice({ displayName: 'Test' })).toBe(false)
  })

  test('type set to an empty string', () => {
    expect(isApprentice({ type: '' })).toBe(false)
  })

  test.each([otType, studentType])('type set as %p should be false', type => {
    expect(isApprentice({ type })).toBe(false)
  })

  test(`type set as "${apprenticeType}" should be true`, () => {
    expect(isApprentice({ type: apprenticeType })).toBe(true)
  })
})

describe('isOT', () => {
  test('user object not set', () => {
    expect(isOT()).toBe(false)
  })

  test('type not set', () => {
    expect(isOT({ displayName: 'Test' })).toBe(false)
  })

  test('type set to an empty string', () => {
    expect(isOT({ type: '' })).toBe(false)
  })

  test.each([apprenticeType, studentType])('type set as %p should be false', type => {
    expect(isOT({ type })).toBe(false)
  })

  test(`type set as "${otType}" should be true`, () => {
    expect(isOT({ type: otType })).toBe(true)
  })
})

describe('isEmployee', () => {
  test('user object not set', () => {
    expect(isEmployee()).toBe(false)
  })

  test('userPrincipalName not set', () => {
    expect(isEmployee({ displayName: 'Test' })).toBe(false)
  })

  test('userPrincipalName set to an empty string', () => {
    expect(isEmployee({ userPrincipalName: '' })).toBe(false)
  })

  test(`userPrincipalName set as "${employee}" should be true`, () => {
    expect(isEmployee({ userPrincipalName: `test${employee}` })).toBe(true)
  })
})

describe('isStudent', () => {
  test('user object not set', () => {
    expect(isStudent()).toBe(false)
  })

  test('type not set', () => {
    expect(isStudent({ displayName: 'Test' })).toBe(false)
  })

  test('type set to an empty string', () => {
    expect(isStudent({ type: '' })).toBe(false)
  })

  test.each([apprenticeType, otType])('type set as %p should be false', type => {
    expect(isStudent({ type })).toBe(false)
  })

  test(`type set as "${studentType}" should be true`, () => {
    expect(isStudent({ type: studentType })).toBe(true)
  })
})

describe('isTeacher', () => {
  test('user object not set', () => {
    expect(isTeacher()).toBe(false)
  })

  test('feide not set', () => {
    expect(isTeacher({ displayName: 'Test' })).toBe(false)
  })

  test('feide set to false', () => {
    expect(isTeacher({ feide: false })).toBe(false)
  })

  test('feide set to true', () => {
    expect(isTeacher({ feide: true })).toBe(true)
  })
})
