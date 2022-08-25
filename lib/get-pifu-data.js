const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const NodeCache = require('node-cache')
const generateSystemJwt = require('./auth/generate-jwt')
const { SYSTEMS: { VIS: { PIFU_URL, PIFU_JWT_SECRET } } } = require('../config')

const cache = new NodeCache({ stdTTL: 14400 }) // cache for 4 hours

module.exports = async user => {
  if (cache.has(user)) {
    logger('info', ['get-pifu-data', user, 'me', 'return cached data'])
    return cache.get(user)
  }

  const token = generateSystemJwt(PIFU_JWT_SECRET, user)
  const options = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }

  logger('info', ['get-pifu-data', user, 'me', 'start'])
  const { data } = await axios.get(`${PIFU_URL}/me`, options)
  logger('info', ['get-pifu-data', user, 'me', 'finished'])
  cache.set(user, data)
  return data
}
