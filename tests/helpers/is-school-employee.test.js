require('../lib/mock-envs')()
const isSchoolEmployee = require('../../lib/helpers/is-school-employee')

const mockTeacher = {
  employeeNumber: '12128015478',
  departmentShort: 'OF-REV-SPR-REAL',
  company: 'Re videregående skole',
  expectedType: 'employee',
  extensionAttribute7: 'OF-ALLE'
}
const mockSchoolAdmEmployee = {
  employeeNumber: '12128015478',
  departmentShort: 'OF-REV',
  company: 'Re videregående skole',
  expectedType: 'employee',
  extensionAttribute7: 'OF-ALLE'
}
const mockAdvicor = {
  employeeNumber: '12128015478',
  departmentShort: 'BDK-TEK',
  company: 'Brukerbehov, digitalisering og kommunikasjon',
  expectedType: 'employee',
  extensionAttribute7: null
}

test('Lærer gir tilbake true', () => {
  const result = isSchoolEmployee(mockTeacher)
  expect(result).toBe(true)
})

test('Skoleadministrativt ansatt gir tilbake true', () => {
  const result = isSchoolEmployee(mockSchoolAdmEmployee)
  expect(result).toBe(true)
})

test('Ansatt uten skoletilhørighet gir tilbake false', () => {
  const result = isSchoolEmployee(mockAdvicor)
  expect(result).toBe(false)
})
