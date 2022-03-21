const { logger } = require('@vtfk/logger')
const { getSDSUser } = require('../../lib/mongo/handle-mongo')
const getResponse = require('../../lib/get-response-object')
const HTTPError = require('../../lib/http-error')

module.exports = async (caller, params) => {
  const { samAccountName, userPrincipalName, type } = params

  if (type === null || type === undefined) {
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameter',
      params: [
        'Type'
      ]
    })
  }

  if (samAccountName !== undefined) {
    logger('info', ['sds', 'samAccountName', samAccountName, type])
    const data = await getSDSUser({ samAccountName })
    const sds = data ? data.sds : []
    logger('info', ['sds', 'samAccountName', samAccountName, type, 'data', 'received', sds.length])
    return getResponse(sds)
  }

  if (userPrincipalName !== undefined) {
    logger('info', ['sds', 'userPrincipalName', userPrincipalName, type])
    const data = await getSDSUser({ userPrincipalName })
    const sds = data ? data.sds : []
    logger('info', ['sds', 'userPrincipalName', userPrincipalName, type, 'data', 'received', sds.length])
    return getResponse(sds)
  }

  throw new HTTPError(400, 'Missing required parameter(s)', {
    message: 'Missing required parameter(s). One of the following parameter sets are required',
    params: {
      paramSetOne: [
        'samAccountName',
        'type'
      ],
      paramSetTwo: [
        'userPrincipalName',
        'type'
      ]
    }
  })
}
