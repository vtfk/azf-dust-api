//const withTokenAuth = require('../lib/with-token-auth')
const { logger } = require('@vtfk/logger')
const { DEFAULT_CALLER } = require('../config')
const handleAD = require('../handlers/ad')
const handleVisma = require('../handlers/visma')
const HTTPError = require('../lib/http-error')

const handleSystem = async (context, req) => {
  const { system } = req.params
  const { params } = req.body
  const user = (req.token && req.token.upn) || DEFAULT_CALLER
  
  try {
    // handle request for Active Directory
    if (system.toLowerCase() === 'ad') {
      logger('info', ['handle-system', 'system', system])
      return await handleAD(user, params)
    }

    // handle request for Visma
    if (system.toLowerCase() === 'visma') {
      logger('info', ['handle-system', 'system', system])
      return await handleVisma(user, params)
    }

    throw new HTTPError(404, 'no matching system found', { system })
  } catch (error) {
    logger('error', ['handle-systems', 'system', system, 'error', error.message])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, 'An unknown error occured', error).toJSON()
  }
}

module.exports = (context, req) => handleSystem(context, req)
