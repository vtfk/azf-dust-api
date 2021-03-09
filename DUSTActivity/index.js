const { logger, logConfig } = require('@vtfk/logger')
const { DEFAULT_CALLER } = require('../config')
const { generate } = require('../lib/user-query')
const callHandler = require('../lib/call-handlers')
const { updateRequest } = require('../lib/mongo/handle-mongo')

const test = (system, data, user) => {
  const { validate } = require('../systems')[system]
  if (typeof validate === 'function') return validate(data, user)
}

module.exports = async function (context) {
  const { instanceId, system, user, token } = context.bindings.request
  const caller = (token && token.upn) || DEFAULT_CALLER
  const result = { name: system }

  logConfig({
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  try {
    result.query = generate(system, user)

    logger('info', ['dust-activity', system, user.userPrincipalName || user.samAccountName || user.displayName || '', 'data', 'start'])
    const { body } = await callHandler(caller, result.query, system)
    logger('info', ['dust-activity', system, user.userPrincipalName || user.samAccountName || user.displayName || '', 'data', 'finish'])
    result.data = body
    const tests = test(system, body, user)
    if (tests) result.test = tests.filter(t => t.result)
  } catch (error) {
    result.status = error.statusCode || 400
    result.error = error.message
    result.innerError = error.innerError || error.stack
    logger('error', ['dust-activity', system, 'error', result.status, error.message])
  }

  try {
    logger('info', ['dust-activity', system, user.userPrincipalName || user.samAccountName || user.displayName || '', 'request-update', result.data ? 'data' : 'error', 'start'])
    await updateRequest({ instanceId, ...result })
    logger('info', ['dust-activity', system, user.userPrincipalName || user.samAccountName || user.displayName || '', 'request-update', result.data ? 'data' : 'error', 'finish'])
  } catch (error) {
    logger('error', ['dust-activity', system, user.userPrincipalName || user.samAccountName || user.displayName || '', 'request-update', 'error', error.message])
    result.status = 500
    result.error = error.message
    result.innerError = error.stack
  }

  return result
}
