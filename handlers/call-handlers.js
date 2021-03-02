const handleAD = require('./ad')
const handleVisma = require('./visma')
const handleFeide = require('./feide')
const handleSDS = require('./sds')
const handlePIFU = require('./pifu')
const handleAAD = require('./aad')
const HTTPError = require('../lib/http-error')

module.exports = async (caller, body, name) => {
  try {
    // handle request for Active Directory
    if (name.toLowerCase() === 'ad') {
      return await handleAD(caller, body)
    }

    // handle request for Visma
    if (name.toLowerCase() === 'visma') {
      return await handleVisma(caller, body)
    }

    // handle request for FEIDE
    if (name.toLowerCase() === 'feide') {
      return await handleFeide(caller, body)
    }

    // handle request for School Data Sync
    if (name.toLowerCase() === 'sds') {
      return await handleSDS(caller, body)
    }

    // handle request for PIFU
    if (name.toLowerCase() === 'pifu') {
      return await handlePIFU(caller, body)
    }

    // handle request for Azure AD
    if (name.toLowerCase() === 'aad') {
      return await handleAAD(body)
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
