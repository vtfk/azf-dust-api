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
  const { domain, properties, samAccountName, employeeNumber, userPrincipalName, displayName } = params

  if (domain === null || domain === undefined) {
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameter',
      params: [
        'Domain'
      ]
    })
  }

  if (samAccountName !== undefined) {
    logger('info', ['ad', 'samAccountName', samAccountName])
    const data = await getData(caller, {
      samAccountName,
      domain,
      properties
    })
    logger('info', ['ad', 'samAccountName', samAccountName, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  if (employeeNumber !== undefined) {
    logger('info', ['ad', 'employeeNumber', employeeNumber])
    const data = await getData(caller, {
      employeeNumber,
      domain,
      properties
    })
    logger('info', ['ad', 'employeeNumber', employeeNumber, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  if (userPrincipalName !== undefined) {
    logger('info', ['ad', 'userPrincipalName', userPrincipalName])
    const data = await getData(caller, {
      userPrincipalName,
      domain,
      properties
    })
    logger('info', ['ad', 'userPrincipalName', userPrincipalName, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  if (displayName !== undefined) {
    logger('info', ['ad', 'displayName', displayName])
    const data = await getData(caller, {
      displayName,
      domain,
      properties
    })
    logger('info', ['ad', 'displayName', displayName, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  throw new HTTPError(400, 'Missing required parameters', {
    message: 'Missing required parameters. One of the following parameters are required',
    params: [
      'samAccountName',
      'employeeNumber',
      'userPrincipalName',
      'displayName'
    ]
  })
}
