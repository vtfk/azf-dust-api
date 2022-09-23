const { logger } = require('@vtfk/logger')
const axios = require('axios').default
const HTTPError = require('../http-error')

module.exports = async (options) => {
  try {
    logger('info', ['get-p360-data', 'start'])
    const { data } = await axios.post(options.url, options.payload)
    logger('info', ['get-p360-data', 'finish'])
    if (data.Successful) {
      return data
    } else {
      throw new Error(data.ErrorMessage)
    }
  } catch (error) {
    console.log(error)
    const { status, data } = error.response
    if (!data) {
      logger('error', ['get-p360-data', 'internal P360 error', error.message])
      throw new HTTPError(500, error.message)
    }
    logger('error', ['get-p360-data', 'error', data.error.message])
    throw new HTTPError(status, data.error.message)
  }
}
