const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const HTTPError = require('./http-error')
const generateJwt = require('./auth/generate-jwt')

const { DUST_JWT_SECRET } = require('../config')

module.exports = async (caller, system, method, url, body) => {
  const token = generateJwt(DUST_JWT_SECRET, caller)

  try {
    logger('info', ['get-data', system, method, url, 'start'])
    const { data } = await axios({
      method,
      url,
      data: body || undefined,
      responseType: 'json',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    logger('info', ['get-data', system, method, url, 'finish', 'received data', Array.isArray(data) ? data.length : 1])
    return data
  } catch (error) {
    const { status, statusText, data } = error.response
    logger('error', ['get-data', system, method, url, 'error', status, statusText])
    return new HTTPError(status, data)
  }
}
