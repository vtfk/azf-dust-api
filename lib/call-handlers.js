const { logger } = require('@vtfk/logger')
const { ad, aad, feide, pifu, sds, visma, sync } = require('../systems')
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

    // handle request for Extens
    if (name.toLowerCase() === 'pifu') {
      return await pifu.handle(caller, body)
    }

    // handle request for Azure AD
    if (name.toLowerCase() === 'aad') {
      return await aad.handle(body)
    }

    // handle request for Sync
    if (name.toLowerCase() === 'sync') {
      return await sync.handle(caller)
    }

    throw new HTTPError(404, 'no matching system found', {
      message: 'no matching system found',
      system: name
    })
  } catch (error) {
    logger('error', ['call-handlers', name, 'error', error.statusCode, error.name])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, 'An unknown error occured', error).toJSON()
  }
}
