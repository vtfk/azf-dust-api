const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const generateSystemJwt = require('./auth/generate-jwt')
const { SYSTEMS: { VIS: { PIFU_URL, PIFU_JWT_SECRET } } } = require('../config')

module.exports = async (user, type) => {
  const token = generateSystemJwt(PIFU_JWT_SECRET, user, type)
  const options = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  logger('info', ['get-pifu-data', type, user, 'me', 'start'])
  const { data } = await axios.get(`${PIFU_URL}/me`, options)
  logger('info', ['get-pifu-data', type, user, 'me', 'finished'])
  return data
}
