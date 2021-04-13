const { logger } = require('@vtfk/logger')
const handleData = require('../../lib/handle-data')
const getResponse = require('../../lib/get-response-object')

const getData = async caller => {
  const method = 'get'
  const fileName = 'Get-DUSTVigoBas.ps1'

  return await handleData(caller, method, fileName)
}

module.exports = async caller => {
  logger('info', ['vigobas'])
  const data = await getData(caller)
  logger('info', ['vigobas', 'data', 'received', Array.isArray(data) ? data.length : 1])
  return getResponse(data)
}
