const { prettifyDateToLocaleString, azureADDate } = require('../../lib/helpers/date-time-output')
const date = new Date('2021-05-05T04:35:03.0852857+02:00')

test('Prettified locale string is padded correctly', () => {
  const prettifiedDate = prettifyDateToLocaleString(date)
  expect(prettifiedDate).toMatch(/\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2}/)
})

test('Prettified locale string is padded correctly when dateOnly is explicit set to false', () => {
  const prettifiedDate = prettifyDateToLocaleString(date, false)
  expect(prettifiedDate).toMatch(/\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2}/)
})

test('Prettified locale string is padded correctly when dateOnly is set to true', () => {
  const prettifiedDate = prettifyDateToLocaleString(date, true)
  expect(prettifiedDate).toMatch(/\d{2}.\d{2}.\d{4}/)
})

test('AzureAD date is padded correctly', () => {
  const prettifiedDate = azureADDate(date)
  expect(prettifiedDate).toMatch(/\d{4}-\d{2}-\d{2}/)
})
