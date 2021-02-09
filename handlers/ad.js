const { logger } = require('@vtfk/logger')
const handleData = require('../lib/handle-data')
const getResponse = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')

const getData = async (caller, data) => {
  const method = 'get'
  const fileName = 'Get-DUSTUser.ps1'

  return await handleData(caller, method, fileName, data)
}

module.exports = async (caller, params) => {
  if (params.domain === undefined) {
    throw new HTTPError(422, 'Missing required paramater \'Domain\'')
  }

  if (params.samAccountName !== undefined) {
    logger('info', ['ad', 'samAccountName', params.samAccountName])
    const data = await getData(caller, {
      samAccountName: params.samAccountName,
      domain: params.domain,
      properties: params.properties
    })
    logger('info', ['ad', 'samAccountName', params.samAccountName, 'data', 'received', data.length || 1])
    return getResponse(data)
  }

  if (params.employeeNumber !== undefined) {
    logger('info', ['ad', 'employeeNumber', params.employeeNumber])
    const data = await getData(caller, {
      employeeNumber: params.employeeNumber,
      domain: params.domain,
      properties: params.properties
    })
    logger('info', ['ad', 'employeeNumber', params.employeeNumber, 'data', 'received', data.length || 1])
    return getResponse(data)
  }

  if (params.userPrincipalName !== undefined) {
    logger('info', ['ad', 'userPrincipalName', params.userPrincipalName])
    const data = await getData(caller, {
      userPrincipalName: params.userPrincipalName,
      domain: params.domain,
      properties: params.properties
    })
    logger('info', ['ad', 'userPrincipalName', params.userPrincipalName, 'data', 'received', data.length || 1])
    return getResponse(data)
  }

  if (params.displayName !== undefined) {
    logger('info', ['ad', 'displayName', params.displayName])
    const data = await getData(caller, {
      displayName: params.displayName,
      domain: params.domain,
      properties: params.properties
    })
    logger('info', ['ad', 'displayName', params.displayName, 'data', 'received', data.length || 1])
    return getResponse(data)
  }

  throw new HTTPError(422, 'Missing required parameters. One of the following parameters are required', {
    params: [
      'samAccountName',
      'employeeNumber',
      'userPrincipalName',
      'displayName'
    ]
  })
}
