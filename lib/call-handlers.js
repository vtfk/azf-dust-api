const { logger } = require('@vtfk/logger')
const { ad, aad, feide, vis, sds, visma, sync, equitrac } = require('../systems')
const { getErrorMessage, getStatusCode } = require('./get-http-error')
const HTTPError = require('./http-error')

module.exports = async (caller, body, name) => {
  try {
    // handle request for Active Directory
    if (name.toLowerCase() === 'ad') {
      return await ad.handle(caller, body)
    }

    // handle request for visma
    if (name.toLowerCase() === 'visma') {
      return await visma.handle(caller, body)
    }

    // handle request for FEIDE
    if (name.toLowerCase() === 'feide') {
      return await feide.handle(caller, body)
    }

    // handle request for School Data Sync
    if (name.toLowerCase() === 'sds') {
      return await sds.handle(caller, body)
    }

    // handle request for ViS
    if (name.toLowerCase() === 'vis') {
      return await vis.handle(body)
    }

    // handle request for Azure AD
    if (name.toLowerCase() === 'aad') {
      return await aad.handle(body)
    }

    // handle request for Sync
    if (name.toLowerCase() === 'sync') {
      return await sync.handle(caller)
    }

    // handle request for Equitrac
    if (name.toLowerCase() === 'equitrac') {
      return await equitrac.handle(caller, body)
    }

    throw new HTTPError(404, 'no matching system found', {
      message: 'no matching system found',
      system: name
    })
  } catch (error) {
    const message = getErrorMessage(error) || 'An unknown error occured'
    const statusCode = getStatusCode(error) || 500
    logger('error', ['call-handlers', name, 'error', statusCode, message.error || message])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(statusCode, message, error).toJSON()
  }
}
