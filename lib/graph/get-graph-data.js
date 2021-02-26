const { logger } = require('@vtfk/logger')
const axios = require('axios')
const HTTPError = require('../http-error')

module.exports = async (options, token) => {
  options.method = 'GET'
  options.headers = { Authorization: token }

  try {
    logger('info', ['get-graph-data', 'start'])
    const { data } = await axios(options)
    logger('info', ['get-graph-data', 'finish'])
    return data
  } catch (error) {
    const { status, data } = error.response
    logger(error, ['get-graph-data', 'error', data.error.message])
    throw new HTTPError(status, data.error.message)
  }
}
