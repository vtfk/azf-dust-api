const withTokenAuth = require('../lib/with-token-auth')
const { DEFAULT_CALLER } = require('../config')
const { logger } = require('@vtfk/logger')
const handleAD = require('../handlers/ad')
const handleVisma = require('../handlers/visma')
const handleFeide = require('../handlers/feide')
const HTTPError = require('../lib/http-error')

const handleSystem = async (context, req) => {
  const { system } = req.params
  const { params } = req.body
  const caller = (req.token && req.token.upn) || DEFAULT_CALLER

  try {
    logger('info', ['handle-system', 'system', system, 'start'])

    // handle request for Active Directory
    if (system.toLowerCase() === 'ad') {
      return await handleAD(caller, params)
    }

    // handle request for Visma
    if (system.toLowerCase() === 'visma') {
      return await handleVisma(caller, params)
    }

    // handle request for FEIDE
    if (system.toLowerCase() === 'feide') {
      return await handleFeide(caller, params)
    }

    throw new HTTPError(404, 'no matching system found', { system })
  } catch (error) {
    logger('error', ['handle-systems', 'system', system, 'error', error.message])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, 'An unknown error occured', error).toJSON()
  }
}

module.exports = (context, req) => withTokenAuth(context, req, handleSystem)
