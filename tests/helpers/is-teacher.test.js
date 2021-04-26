const isTeacher = require('../../lib/helpers/is-teacher')
const validCompany = require('../../systems/data/schools.json')[0]
const companyNonSchool = 'Fylkeshuset i Tønsberg'
const validTitle = require('../../systems/data/teacher-titles.json')[0]
const titleAdmEmployee = 'Stabsleder'
const titleAdvicer = 'Rådgiver'

test('Company og title ikke angitt gir tilbake false', () => {
  expect(isTeacher()).toBe(false)
})

test('Title ikke angitt gir tilbake false', () => {
  expect(isTeacher(validCompany)).toBe(false)
})

test('Company ikke angitt gir tilbake false', () => {
  expect(isTeacher(null, validTitle)).toBe(false)
})

test('Company som en tom streng og title som en tom streng gir tilbake false', () => {
  expect(isTeacher('', '')).toBe(false)
})

test('Company og title angitt korrekt som en elev gir tilbake false', () => {
  expect(isTeacher(validCompany, null)).toBe(false)
})

test('Company som en skoleansatt og title som en administrativt ansatt gir tilbake false', () => {
  expect(isTeacher(validCompany, titleAdmEmployee)).toBe(false)
})

test('Company som en ikke-skoleansatt og title som en rådgiver gir tilbake false', () => {
  expect(isTeacher(companyNonSchool, titleAdvicer)).toBe(false)
})

test('Company og title angitt korrekt som en lærer gir tilbake true', () => {
  expect(isTeacher(validCompany, validTitle)).toBe(true)
})
