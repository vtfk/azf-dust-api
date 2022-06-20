const { isApprentice, isOT, isEmployee, isStudent, isTeacher } = require('../../lib/helpers/is-type')

const apprenticeTitle = 'Lærling'
const otTitle = 'Elev-OT'
const employee = '@vtfk.no'
const studentTitle = 'Elev'

describe('isApprentice : AD', () => {
  test('user object not set', () => {
    expect(isApprentice()).toBe(false)
  })

  test('title not set', () => {
    expect(isApprentice({ displayName: 'Test' })).toBe(false)
  })

  test('title set to an empty string', () => {
    expect(isApprentice({ title: '' })).toBe(false)
  })

  test.each([otTitle, studentTitle])('title set as %p should be false', title => {
    expect(isApprentice({ title })).toBe(false)
  })

  test.each(['login', ''])(`domain set as %p and title set as "${apprenticeTitle}" should be false`, domain => {
    expect(isApprentice({ domain, title: apprenticeTitle })).toBe(false)
  })

  test(`title set as "${apprenticeTitle}" and domain set as "skole" should be true`, () => {
    expect(isApprentice({ domain: 'skole', title: apprenticeTitle })).toBe(true)
  })
})

describe('isApprentice : AAD', () => {
  test.each([otTitle, studentTitle])('jobTitle set as %p should be false', jobTitle => {
    expect(isApprentice({ jobTitle })).toBe(false)
  })

  test.each(['DC=login', ''])(`onPremisesDistinguishedName includes %p and jobTitle set as "${apprenticeTitle}" should be false`, onPremisesDistinguishedName => {
    expect(isApprentice({ onPremisesDistinguishedName, jobTitle: apprenticeTitle })).toBe(false)
  })

  test(`jobTitle set as "${apprenticeTitle}" and onPremisesDistinguishedName includes "DC=skole" should be true`, () => {
    expect(isApprentice({ onPremisesDistinguishedName: 'DC=skole', jobTitle: apprenticeTitle })).toBe(true)
  })
})

describe('isOT', () => {
  test('user object not set', () => {
    expect(isOT()).toBe(false)
  })

  test('title not set', () => {
    expect(isOT({ displayName: 'Test' })).toBe(false)
  })

  test('title set to an empty string', () => {
    expect(isOT({ title: '' })).toBe(false)
  })

  test.each([apprenticeTitle, studentTitle])('title set as %p should be false', title => {
    expect(isOT({ title })).toBe(false)
  })

  test.each(['login', ''])(`domain set as %p and title set as "${otTitle}" should be false`, domain => {
    expect(isApprentice({ domain, title: otTitle })).toBe(false)
  })

  test(`title set as "${otTitle}" and domain set as "skole" should be true`, () => {
    expect(isOT({ domain: 'skole', title: otTitle })).toBe(true)
  })
})

describe('isOT : AAD', () => {
  test.each([apprenticeTitle, studentTitle])('jobTitle set as %p should be false', jobTitle => {
    expect(isOT({ jobTitle })).toBe(false)
  })

  test.each(['DC=login', ''])(`onPremisesDistinguishedName includes %p and jobTitle set as "${otTitle}" should be false`, onPremisesDistinguishedName => {
    expect(isOT({ onPremisesDistinguishedName, jobTitle: otTitle })).toBe(false)
  })

  test(`jobTitle set as "${otTitle}" and onPremisesDistinguishedName includes "DC=skole" should be true`, () => {
    expect(isOT({ onPremisesDistinguishedName: 'DC=skole', jobTitle: otTitle })).toBe(true)
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

  test('title not set', () => {
    expect(isStudent({ displayName: 'Test' })).toBe(false)
  })

  test('title set to an empty string', () => {
    expect(isStudent({ title: '' })).toBe(false)
  })

  test.each([apprenticeTitle, otTitle])('title set as %p should be false', title => {
    expect(isStudent({ title })).toBe(false)
  })

  test.each(['login', ''])(`domain set as %p and title set as "${studentTitle}" should be false`, domain => {
    expect(isApprentice({ domain, title: studentTitle })).toBe(false)
  })

  test(`title set as "${studentTitle}" and domain set as "skole" should be true`, () => {
    expect(isStudent({ domain: 'skole', title: studentTitle })).toBe(true)
  })
})

describe('isStudent : AAD', () => {
  test.each([otTitle, apprenticeTitle])('jobTitle set as %p should be false', jobTitle => {
    expect(isStudent({ jobTitle })).toBe(false)
  })

  test.each(['DC=login', ''])(`onPremisesDistinguishedName includes %p and jobTitle set as "${studentTitle}" should be false`, onPremisesDistinguishedName => {
    expect(isStudent({ onPremisesDistinguishedName, jobTitle: studentTitle })).toBe(false)
  })

  test(`jobTitle set as "${studentTitle}" and onPremisesDistinguishedName includes "DC=skole" should be true`, () => {
    expect(isStudent({ onPremisesDistinguishedName: 'DC=skole', jobTitle: studentTitle })).toBe(true)
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
