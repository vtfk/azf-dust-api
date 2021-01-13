const { logConfig, logger } = require('@vtfk/logger')
const { verify } = require('azure-ad-verify-token')
const { TOKEN_AUTH } = require('../config')
const HTTPError = require('./http-error')

module.exports = async (context, request, next) => {
  logConfig({ azure: { context } })

  const bearerToken = request.headers.authorization
  if (!bearerToken) {
    logger('warn', ['with-token-auth', request.url, 'no-authorization-header'])
    return new HTTPError(400, 'Authorization header is missing').toJSON()
  }

  try {
    const token = bearerToken.replace('Bearer ', '')
    const validatedToken = await verify(token, TOKEN_AUTH)
    request.token = validatedToken

    return next(context, request)
  } catch (error) {
    logger('error', ['with-token-auth', request.url, 'invalid-token', error])
    return new HTTPError(401, 'Authorization token is invalid').toJSON()
  }
}
