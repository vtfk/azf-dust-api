const { test, success, error, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('vigobas-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    return dataPresent ? success('Har data') : error('Mangler data...')
  }),
  test('vigobas-02', 'Har lastRunTime', 'Sjekker at lastRunTime finnes', () => {
    if (!dataPresent) return noData()
    return systemData.lastRunTime ? success('lastRunTime finnes') : error('lastRunTime mangler...')
  })
])
