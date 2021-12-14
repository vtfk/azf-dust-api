const isTeacher = require('../../lib/helpers/is-teacher')

test('feide not set', () => {
  expect(isTeacher({})).toBe(false)
})

test('feide set to false', () => {
  expect(isTeacher({ feide: false })).toBe(false)
})

test('feide set to true', () => {
  expect(isTeacher({ feide: true })).toBe(true)
})
