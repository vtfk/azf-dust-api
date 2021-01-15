//const withTokenAuth = require('../lib/with-token-auth')
const { logger } = require('@vtfk/logger')
const HTTPError = require('../lib/http-error')
const getResponse = require('../lib/get-response-object')
const getBodyParams = require('../lib/get-body-params')
const getData = require('../lib/get-data')
const { SCRIPT_SERVICE_URL, DEFAULT_CALLER } = require('../config')

const handleData = async (caller, method, fileName, args) => {
  logger('info', ['handle-data', 'method', method, 'url', SCRIPT_SERVICE_URL])
  const data = await getData(caller, method, SCRIPT_SERVICE_URL, {
    fileName,
    args
  })

  if (data instanceof HTTPError) {
    logger('error', ['handle-data', 'error', data])
    throw data
  }

  logger('info', ['handle-data', 'data', 'received'])
  return data
}

const handleSystem = async (context, req) => {
  const { system } = req.params
  const { params } = req.body
  const user = (req.token && req.token.upn) || DEFAULT_CALLER
  
  try {
    // handle request for Active Directory
    if (system.toLowerCase() === 'ad') {
      const method = 'get'
      const fileName = 'Get-DUSTUser.ps1'
      
      if (params.domain === undefined) {
        throw new HTTPError(422, `Missing required paramater 'Domain'`)
      }

      if (params.samAccountName !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'samAccountName', params.samAccountName])
        const data = await handleData(user, method, fileName, {
          samAccountName: params.samAccountName,
          domain: params.domain,
          properties: params.properties
        })
        logger('info', ['handle-systems', 'system', system, 'samAccountName', params.samAccountName, 'data', 'received'])
        return getResponse(data)
      }

      if (params.employeeNumber !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'employeeNumber', params.employeeNumber])
        const data = await handleData(user, method, fileName, {
          employeeNumber: params.employeeNumber,
          domain: params.domain,
          properties: params.properties
        })
        logger('info', ['handle-systems', 'system', system, 'employeeNumber', params.employeeNumber, 'data', 'received'])
        return getResponse(data)
      }

      if (params.userPrincipalName !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'userPrincipalName', params.userPrincipalName])
        const data = await handleData(user, method, fileName, {
          userPrincipalName: params.userPrincipalName,
          domain: params.domain,
          properties: params.properties
        })
        logger('info', ['handle-systems', 'system', system, 'userPrincipalName', params.userPrincipalName, 'data', 'received'])
        return getResponse(data)
      }

      if (params.displayName !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'displayName', params.displayName])
        const data = await handleData(user, method, fileName, {
          displayName: params.displayName,
          domain: params.domain,
          properties: params.properties
        })
        logger('info', ['handle-systems', 'system', system, 'displayName', params.displayName, 'data', 'received'])
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

    // handle request for Visma
    if (system.toLowerCase() === 'visma') {
      const method = 'get'
      const fileName = 'Get-DUSTVisma.ps1'

      if (params.employeeNumber !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'employeeNumber', params.employeeNumber])
        const data = await handleData(user, method, fileName, {
          employeeNumber: params.employeeNumber
        })
        logger('info', ['handle-systems', 'system', system, 'employeeNumber', params.employeeNumber, 'data', 'received'])
        return getResponse(data)
      }

      if (params.firstName !== undefined && params.lastName !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'firstName', params.firstName, 'lastName', params.lastName])
        const data = await handleData(user, method, fileName, {
          firstName: params.firstName,
          lastName: params.lastName
        })
        logger('info', ['handle-systems', 'system', system, 'firstName', params.firstName, 'lastName', params.lastName, 'data', 'received'])
        return getResponse(data)
      }

      throw new HTTPError(422, 'Missing required parameter(s). One of the following parameter sets are required', {
        paramSetOne: [
          'employeeNumber'
        ],
        paramSetTwo: [
          'firstName',
          'lastName'
        ]
      });
    }

    throw new HTTPError(404, 'No matching method found', { system })
  } catch (error) {
    logger('error', ['handle-systems', 'system', system, 'error', error.message])
    if (error instanceof HTTPError) return error.toJSON()
    return new HTTPError(500, 'An unknown error occured', error).toJSON()
  }
}

module.exports = (context, req) => handleSystem(context, req)
