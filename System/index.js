const { DEFAULT_CALLER } = require('../config')
const { logger } = require('@vtfk/logger')
const withTokenAuth = require('../lib/auth/with-token-auth')
const callHandler = require('../handlers/call-handlers')

const handleSystem = async (context, req) => {
  const { system } = req.params
  const { body } = req
  const caller = (req.token && req.token.upn) || DEFAULT_CALLER

  logger('info', ['handle-system', system, 'start'])
  const result = await callHandler(caller, body, system)
  logger('info', ['handle-system', system, 'finish'])
  return result
}

module.exports = (context, req) => withTokenAuth(context, req, handleSystem)
