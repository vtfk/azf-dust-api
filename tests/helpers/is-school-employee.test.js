const isSchoolEmployee = require('../../lib/helpers/is-school-employee')

const mockTeacher = {
  employeeNumber: '12128015478',
  departmentShort: 'OF-REV-SPR-REAL',
  company: 'Re videregående skole',
  expectedType: 'employee'
}
const mockSchoolAdmEmployee = {
  employeeNumber: '12128015478',
  departmentShort: 'OF-REV',
  company: 'Re videregående skole',
  expectedType: 'employee'
}
const mockAdvicor = {
  employeeNumber: '12128015478',
  departmentShort: 'BDK-TEK',
  company: 'Brukerbehov, digitalisering og kommunikasjon',
  expectedType: 'employee'
}

test('Lærer gir tilbake true', () => {
  const result = isSchoolEmployee(mockTeacher.company)
  expect(result).toBe(true)
})

test('Skoleadministrativt ansatt gir tilbake true', () => {
  const result = isSchoolEmployee(mockSchoolAdmEmployee.company)
  expect(result).toBe(true)
})

test('Ansatt uten skoletilhørighet gir tilbake false', () => {
  const result = isSchoolEmployee(mockAdvicor.company)
  expect(result).toBe(false)
})
