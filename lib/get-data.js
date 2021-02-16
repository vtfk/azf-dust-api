const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const HTTPError = require('./http-error')
const generateJwt = require('./generate-jwt')

const { DUST_JWT_SECRET } = require('../config')

module.exports = async (caller, method, url, body) => {
  const token = generateJwt(DUST_JWT_SECRET, caller)
  axios.defaults.headers.common.Authorization = `Bearer ${token}`

  try {
    logger('info', ['get-data', method, url, 'start'])
    const { data } = await axios({
      method,
      url,
      data: body || undefined,
      responseType: 'json'
    })
    logger('info', ['get-data', method, url, 'finish', 'received data', Array.isArray(data) ? data.length : 1])
    return data
  } catch (error) {
    logger('error', ['get-data', method, url, 'error', error.message])
    return new HTTPError(418, 'Failed to fetch data', error.message)
  }
}
