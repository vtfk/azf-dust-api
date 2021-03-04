const { logger } = require('@vtfk/logger')
const handleData = require('../lib/handle-data')
const getResponse = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')

const getData = async (caller, data) => {
  const method = 'get'
  const fileName = 'Get-DUSTFeide.ps1'

  return await handleData(caller, method, fileName, data)
}

module.exports = async (caller, params) => {
  const { samAccountName, employeeNumber, userPrincipalName, displayName } = params

  if (samAccountName !== undefined) {
    logger('info', ['feide', 'samAccountName', samAccountName])
    const data = await getData(caller, {
      samAccountName
    })
    logger('info', ['feide', 'samAccountName', samAccountName, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  if (employeeNumber !== undefined) {
    logger('info', ['feide', 'employeeNumber', employeeNumber])
    const data = await getData(caller, {
      employeeNumber
    })
    logger('info', ['feide', 'employeeNumber', employeeNumber, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  if (userPrincipalName !== undefined) {
    logger('info', ['feide', 'userPrincipalName', userPrincipalName])
    const data = await getData(caller, {
      userPrincipalName
    })
    logger('info', ['feide', 'userPrincipalName', userPrincipalName, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  if (displayName !== undefined) {
    logger('info', ['feide', 'displayName', displayName])
    const data = await getData(caller, {
      displayName
    })
    logger('info', ['feide', 'displayName', displayName, 'data', 'received', Array.isArray(data) ? data.length : 1])
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
