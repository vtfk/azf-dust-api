const { DEFAULT_CALLER } = require('../config')
const { logger } = require('@vtfk/logger')
const withTokenAuth = require('../lib/with-token-auth')
const handleAD = require('../handlers/ad')
const handleVisma = require('../handlers/visma')
const handleFeide = require('../handlers/feide')
const handleSDS = require('../handlers/sds')
const handlePIFU = require('../handlers/pifu')
const HTTPError = require('../lib/http-error')

const handleSystem = async (context, req) => {
  const { system } = req.params
  const { body } = req
  const caller = (req.token && req.token.upn) || DEFAULT_CALLER

  try {
    logger('info', ['handle-system', system, 'start'])

    // handle request for Active Directory
    if (system.toLowerCase() === 'ad') {
      return await handleAD(caller, body)
    }

    // handle request for Visma
    if (system.toLowerCase() === 'visma') {
      return await handleVisma(caller, body)
    }

    // handle request for FEIDE
    if (system.toLowerCase() === 'feide') {
      return await handleFeide(caller, body)
    }

    // handle request for School Data Sync
    if (system.toLowerCase() === 'sds') {
      return await handleSDS(caller, body)
    }

    // handle request for PIFU
    if (system.toLowerCase() === 'pifu') {
      return await handlePIFU(caller, body)
    }

    throw new HTTPError(404, 'no matching system found', {
      message: 'no matching system found',
      system
    })
  } catch (error) {
    logger('error', ['handle-system', system, 'error', error.statusCode, error.name])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, 'An unknown error occured', error).toJSON()
  }
}

module.exports = (context, req) => withTokenAuth(context, req, handleSystem)
