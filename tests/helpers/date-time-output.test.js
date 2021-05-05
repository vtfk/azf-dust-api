const { prettifyDate, azureADDate } = require('../../lib/helpers/date-time-output')
const date = new Date('2021-05-05T04:35:03.0852857+02:00')

test('Prettified date is padded correctly', () => {
  const prettifiedDate = prettifyDate(date)
  expect(prettifiedDate).toMatch(/\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2}/)
})

test('AzureAD date is padded correctly', () => {
  const prettifiedDate = azureADDate(date)
  expect(prettifiedDate).toMatch(/\d{4}-\d{2}-\d{2}/)
})
