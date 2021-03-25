const { logger, logConfig } = require('@vtfk/logger')
const { DEFAULT_CALLER } = require('../config')
const { generate } = require('../lib/user-query')
const { updateRequest } = require('../lib/mongo/handle-mongo')
const callHandler = require('../lib/call-handlers')
const test = require('../lib/call-test')

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

    logger('info', ['dust-activity', system, 'data', 'start'])
    const { body } = await callHandler(caller, result.query, system)
    logger('info', ['dust-activity', system, 'data', 'finish'])
    if (body && body.statusCode && (body.statusCode / 100 | 0) > 2) {
      result.status = body.statusCode
      result.error = body.message
      logger('error', ['dust-activity', system, 'error', result.status, result.error])
    } else {
      result.data = body
      result.tests = test(system, body, user)
    }
  } catch (error) {
    result.status = error.statusCode || 400
    result.error = error.message
    logger('error', ['dust-activity', system, 'error', result.status, result.error])
  }

  try {
    logger('info', ['dust-activity', system, 'request-update', result.data ? 'data' : 'error', 'start'])
    await updateRequest({ instanceId, ...result })
    logger('info', ['dust-activity', system, 'request-update', result.data ? 'data' : 'error', 'finish'])
  } catch (error) {
    logger('error', ['dust-activity', system, 'request-update', 'error', error.message])
    result.status = 500
    result.error = error.message
  }

  return result
}
