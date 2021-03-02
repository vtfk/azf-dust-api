const { SCRIPT_SERVICE_URL } = require('../config')
const { logger } = require('@vtfk/logger')
const getData = require('./get-data')
const HTTPError = require('./http-error')

module.exports = async (caller, method, fileName, args) => {
  logger('info', ['handle-data', method, SCRIPT_SERVICE_URL])
  const data = await getData(caller, method, SCRIPT_SERVICE_URL, {
    fileName,
    args
  })

  if (data instanceof HTTPError) {
    logger('error', ['handle-data', 'error', data && data.message ? typeof data.message === 'object' ? JSON.stringify(data.message, null, 2) : data.message : ''])
    throw data
  }

  logger('info', ['handle-data', 'data', 'received', Array.isArray(data) ? data.length : 1])
  return data
}
