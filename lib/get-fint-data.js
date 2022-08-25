const { logger } = require('@vtfk/logger')
const axios = require('axios').default
const generateJwt = require('./auth/generate-jwt')
const { SYSTEMS: { VIS: { FINT_API_URL, FINT_JWT_SECRET, FINT_TIMEOUT } } } = require('../config')

module.exports = async (template, identity, query) => {
  const token = generateJwt(FINT_JWT_SECRET)
  const options = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  logger('info', ['get-fint-data', template, identity, 'start', 'timeout', FINT_TIMEOUT])
  const { data } = await axios.post(FINT_API_URL, query, options)
  logger('info', ['get-fint-data', template, identity, 'finish', 'data received', Array.isArray(data) ? data.length : 1])
  return data
}
