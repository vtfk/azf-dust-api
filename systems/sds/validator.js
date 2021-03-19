const { test, success, warn, error, noData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')

const getSDSObject = data => hasData(data) ? 

module.exports = (systemData, user, allData = false) => ([
  test('sds-01', 'Har et person-objekt', 'Sjekker at det finnes et person-objekt', () => {
    if (!hasData(systemData.person)) return error('Person-objekt mangler 🤭', systemData)
    const data = {
      person: systemData.person
    }
    return success('Har et person-objekt', data)
  })
])
