const { SCRIPT_SERVICE_URL } = require('../config')
const { logger } = require('@vtfk/logger')
const getData = require('./get-data')
const HTTPError = require('../lib/http-error')

module.exports = async (caller, method, fileName, args) => {
  logger('info', ['handle-data', 'method', method, 'url', SCRIPT_SERVICE_URL])
  const data = await getData(caller, method, SCRIPT_SERVICE_URL, {
    fileName,
    args
  })

  if (data instanceof HTTPError) {
    logger('error', ['handle-data', 'error', data])
    throw data
  }

  logger('info', ['handle-data', 'data', 'received'])
  return data
}
