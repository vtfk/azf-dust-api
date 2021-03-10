const { logger } = require('@vtfk/logger')
const handleData = require('../../lib/handle-data')
const getResponse = require('../../lib/get-response-object')
const HTTPError = require('../../lib/http-error')

const getData = async (caller, data) => {
  const method = 'get'
  const fileName = 'Get-DUSTSds.ps1'

  return await handleData(caller, method, fileName, data)
}

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
    const data = await getData(caller, {
      samAccountName,
      type
    })
    logger('info', ['sds', 'samAccountName', samAccountName, type, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  if (userPrincipalName !== undefined) {
    logger('info', ['sds', 'userPrincipalName', userPrincipalName, type])
    const data = await getData(caller, {
      userPrincipalName,
      type
    })
    logger('info', ['sds', 'userPrincipalName', userPrincipalName, type, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
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
