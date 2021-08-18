const { SCRIPT_SERVICE_URL } = require('../config')
const { logger } = require('@vtfk/logger')
const getData = require('./get-data')
const HTTPError = require('./http-error')

module.exports = async (caller, system, method, fileName, args) => {
  logger('info', ['handle-data', system, method, SCRIPT_SERVICE_URL])
  const data = await getData(caller, system, method, SCRIPT_SERVICE_URL, {
    fileName,
    args
  })

  if (data instanceof HTTPError) {
    logger('error', ['handle-data', system, 'error', (data && data.message && data.message.error) || (data && data.message) || ''])
    throw data
  }

  logger('info', ['handle-data', system, 'data', 'received', Array.isArray(data) ? data.length : 1])
  return data
}
