const axios = require('axios')
const qs = require('qs')
const NodeCache = require('node-cache')
const { logger } = require('@vtfk/logger')
const { GRAPH: { AUTH: { CLIENT_ID, CLIENT_SECRET, SCOPE, GRANT_TYPE, URL } } } = require('../../config')
const HTTPError = require('../http-error')

const cache = new NodeCache({ stdTTL: 3000 })

module.exports = async () => {
  const cachedGraphToken = cache.get('graphToken')
  if (cachedGraphToken) {
    logger('info', ['get-graph-token', 'return cached token'])
    return cachedGraphToken
  }

  const authOptions = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: SCOPE,
    grant_type: GRANT_TYPE
  }

  const options = {
    url: URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: qs.stringify(authOptions)
  }

  try {
    const { data } = await axios(options)
    const token = `${data.token_type} ${data.access_token}`.trim()
    cache.set('graphToken', token, data.expires_in)
    logger('info', ['get-graph-token', 'return new token'])
    return token
  } catch (error) {
    const { status, data } = error.response
    logger(error, ['get-graph-token', 'error', data.error.message])
    throw new HTTPError(status, data.error.message)
  }
}
