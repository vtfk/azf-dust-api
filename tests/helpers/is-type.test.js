const { isApprentice, isOT, isEmployee, isStudent, isTeacher } = require('../../lib/helpers/is-type')

const apprentice = '@larling.vtfk.no'
const ot = '@ot.vtfk.no'
const employee = '@vtfk.no'
const student = '@skole.vtfk.no'

describe('isApprentice', () => {
  test('user object not set', () => {
    expect(isApprentice()).toBe(false)
  })

  test('userPrincipalName not set', () => {
    expect(isApprentice({ displayName: 'Test' })).toBe(false)
  })

  test('userPrincipalName set to an empty string', () => {
    expect(isApprentice({ userPrincipalName: '' })).toBe(false)
  })

  test.each([ot, employee, student])('userPrincipalName set as %p should be false', principalName => {
    expect(isApprentice({ userPrincipalName: `test${principalName}` })).toBe(false)
  })

  test(`userPrincipalName set as "${apprentice}" should be true`, () => {
    expect(isApprentice({ userPrincipalName: `test${apprentice}` })).toBe(true)
  })
})

describe('isOT', () => {
  test('user object not set', () => {
    expect(isOT()).toBe(false)
  })

  test('userPrincipalName not set', () => {
    expect(isOT({ displayName: 'Test' })).toBe(false)
  })

  test('userPrincipalName set to an empty string', () => {
    expect(isOT({ userPrincipalName: '' })).toBe(false)
  })

  test.each([apprentice, employee, student])('userPrincipalName set as %p should be false', principalName => {
    expect(isOT({ userPrincipalName: `test${principalName}` })).toBe(false)
  })

  test(`userPrincipalName set as "${ot}" should be true`, () => {
    expect(isOT({ userPrincipalName: `test${ot}` })).toBe(true)
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

  test.each([apprentice, ot, student])('userPrincipalName set as %p should be false', principalName => {
    expect(isEmployee({ userPrincipalName: `test${principalName}` })).toBe(false)
  })

  test(`userPrincipalName set as "${employee}" should be true`, () => {
    expect(isEmployee({ userPrincipalName: `test${employee}` })).toBe(true)
  })
})

describe('isStudent', () => {
  test('user object not set', () => {
    expect(isStudent()).toBe(false)
  })

  test('userPrincipalName not set', () => {
    expect(isStudent({ displayName: 'Test' })).toBe(false)
  })

  test('userPrincipalName set to an empty string', () => {
    expect(isStudent({ userPrincipalName: '' })).toBe(false)
  })

  test.each([apprentice, ot, employee])('userPrincipalName set as %p should be false', principalName => {
    expect(isStudent({ userPrincipalName: `test${principalName}` })).toBe(false)
  })

  test(`userPrincipalName set as "${student}" should be true`, () => {
    expect(isStudent({ userPrincipalName: `test${student}` })).toBe(true)
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
