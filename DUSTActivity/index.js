const { logger } = require('@vtfk/logger')
const { DEFAULT_CALLER } = require('../config')
const { generate } = require('../lib/user-query')
const callHandler = require('../handlers/call-handlers')
const { updateRequest } = require('../lib/mongo/handle-mongo')

module.exports = async function (context) {
  const { instanceId, system, user, token } = context.bindings.request
  const caller = (token && token.upn) || DEFAULT_CALLER
  const result = { name: system }

  try {
    result.query = generate(system, user)

    logger('info', ['dust-activity', system, user.userPrincipalName || user.samAccountName || user.displayName || `${user.givenName} ${user.surName}`, 'start'])
    const { body } = await callHandler(caller, result.query, system)
    logger('info', ['dust-activity', system, user.userPrincipalName || user.samAccountName || user.displayName || `${user.givenName} ${user.surName}`, 'finish'])
    result.data = body
  } catch (error) {
    result.status = error.statusCode || 400
    result.error = error.message
    result.innerError = error.innerError || error.stack
    logger('error', ['dust-activity', system, 'error', error.statusCode, error.message])
  }

  try {
    await updateRequest({ instanceId, ...result })
  } catch (error) {
    logger('error', ['dust-activity', system, 'request-update', 'error', error.message])
    result.status = 500
    result.error = error.message
    result.innerError = error.stack
  }

  return result
}
