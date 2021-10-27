const { logConfig, logger } = require('@vtfk/logger')
const { verify } = require('azure-ad-verify-token')
const { TOKEN_AUTH, DEMO, DEMO_USER, PAPERTRAIL_DISABLE_LOGGING } = require('../../config')
const HTTPError = require('../http-error')

module.exports = async (context, request, next) => {
  logConfig({
    remote: {
      disabled: PAPERTRAIL_DISABLE_LOGGING === 'true'
    }
  })

  const instanceId = (request.params && request.params.instanceId) || context.invocationId
  if (DEMO) {
    request.token = { upn: DEMO_USER, DEMO }
    logConfig({ prefix: `${instanceId} -- DEMO -- ${DEMO_USER}` })
    return next(context, request)
  }

  const bearerToken = request.headers.authorization
  if (!bearerToken) {
    logger('warn', ['with-token-auth', request.url, 'no-authorization-header'])
    return new HTTPError(400, 'Authorization header is missing').toJSON()
  }

  try {
    const token = bearerToken.replace('Bearer ', '')
    const validatedToken = await verify(token, TOKEN_AUTH)
    request.token = validatedToken
    logConfig({
      prefix: `${instanceId} -- ${validatedToken.upn}`,
      azure: {
        context,
        excludeInvocationId: true
      }
    })
    return next(context, request)
  } catch (error) {
    logConfig({
      prefix: `${instanceId}`,
      azure: { context }
    })
    logger('error', ['with-token-auth', request.url, 'invalid-token', error && error.message ? typeof error.message === 'object' ? JSON.stringify(error.message, null, 2) : error.message : ''])
    return new HTTPError(401, 'Authorization token is invalid').toJSON()
  }
}
