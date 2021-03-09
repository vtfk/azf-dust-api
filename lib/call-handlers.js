const { logger } = require('@vtfk/logger')
const { AD, AAD, Feide, PIFU, SDS, Visma } = require('../systems')
const HTTPError = require('./http-error')

module.exports = async (caller, body, name) => {
  try {
    // handle request for Active Directory
    if (name.toLowerCase() === 'ad') {
      return await AD.handle(caller, body)
    }

    // handle request for Visma
    if (name.toLowerCase() === 'visma') {
      return await Visma.handle(caller, body)
    }

    // handle request for FEIDE
    if (name.toLowerCase() === 'feide') {
      return await Feide.handle(caller, body)
    }

    // handle request for School Data Sync
    if (name.toLowerCase() === 'sds') {
      return await SDS.handle(caller, body)
    }

    // handle request for PIFU
    if (name.toLowerCase() === 'pifu') {
      return await PIFU.handle(caller, body)
    }

    // handle request for Azure AD
    if (name.toLowerCase() === 'aad') {
      return await AAD.handle(body)
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
