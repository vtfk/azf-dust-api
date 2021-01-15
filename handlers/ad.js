const { logger } = require('@vtfk/logger')
const handleData = require('../lib/handle-data')
const getResponse = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')

module.exports = async (caller, params) => {
  const method = 'get'
  const fileName = 'Get-DUSTUser.ps1'
  
  if (params.domain === undefined) {
    throw new HTTPError(422, `Missing required paramater 'Domain'`)
  }

  if (params.samAccountName !== undefined) {
    logger('info', ['ad', 'samAccountName', params.samAccountName])
    const data = await handleData(caller, method, fileName, {
      samAccountName: params.samAccountName,
      domain: params.domain,
      properties: params.properties
    })
    logger('info', ['ad', 'samAccountName', params.samAccountName, 'data', 'received'])
    return getResponse(data)
  }

  if (params.employeeNumber !== undefined) {
    logger('info', ['ad', 'employeeNumber', params.employeeNumber])
    const data = await handleData(caller, method, fileName, {
      employeeNumber: params.employeeNumber,
      domain: params.domain,
      properties: params.properties
    })
    logger('info', ['ad', 'employeeNumber', params.employeeNumber, 'data', 'received'])
    return getResponse(data)
  }

  if (params.userPrincipalName !== undefined) {
    logger('info', ['ad', 'userPrincipalName', params.userPrincipalName])
    const data = await handleData(caller, method, fileName, {
      userPrincipalName: params.userPrincipalName,
      domain: params.domain,
      properties: params.properties
    })
    logger('info', ['ad', 'userPrincipalName', params.userPrincipalName, 'data', 'received'])
    return getResponse(data)
  }

  if (params.displayName !== undefined) {
    logger('info', ['ad', 'displayName', params.displayName])
    const data = await handleData(caller, method, fileName, {
      displayName: params.displayName,
      domain: params.domain,
      properties: params.properties
    })
    logger('info', ['ad', 'displayName', params.displayName, 'data', 'received'])
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
