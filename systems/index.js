//const withTokenAuth = require('../lib/with-token-auth')
const { logger } = require('@vtfk/logger')
const HTTPError = require('../lib/http-error')
const getResponse = require('../lib/get-response-object')
const getBodyParams = require('../lib/get-body-params')
const getData = require('../lib/get-data')
const { SCRIPT_SERVICE_URL } = require('../config')

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
  const user = req.token.upn
  
  try {
    // get parameters
    getBodyParams(req.body)

    // handle request for Active Directory
    if (system.toLowerCase() === 'ad') {
      const method = 'get'
      const fileName = 'Get-DUSTUser.ps1'
      
      if (domain === undefined) {
        throw new HTTPError(422, `Missing required paramater 'Domain'`)
      }

      if (samAccountName !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'samAccountName', samAccountName])
        const data = await handleData(user, method, fileName, {
          samAccountName,
          domain,
          properties
        })
        logger('info', ['handle-systems', 'system', system, 'samAccountName', samAccountName, 'data', 'received'])
        return getResponse(data)
      }

      if (employeeNumber !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'employeeNumber', employeeNumber])
        const data = await handleData(user, method, fileName, {
          employeeNumber,
          domain,
          properties
        })
        logger('info', ['handle-systems', 'system', system, 'employeeNumber', employeeNumber, 'data', 'received'])
        return getResponse(data)
      }

      if (userPrincipalName !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'userPrincipalName', userPrincipalName])
        const data = await handleData(user, method, fileName, {
          userPrincipalName,
          domain,
          properties
        })
        logger('info', ['handle-systems', 'system', system, 'userPrincipalName', userPrincipalName, 'data', 'received'])
        return getResponse(data)
      }

      if (displayName !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'displayName', displayName])
        const data = await handleData(user, method, fileName, {
          displayName,
          domain,
          properties
        })
        logger('info', ['handle-systems', 'system', system, 'displayName', displayName, 'data', 'received'])
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

      if (employeeNumber !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'employeeNumber', employeeNumber])
        const data = await handleData(user, method, fileName, {
          employeeNumber
        })
        logger('info', ['handle-systems', 'system', system, 'employeeNumber', employeeNumber, 'data', 'received'])
        return getResponse(data)
      }

      if (firstName !== undefined && lastName !== undefined) {
        logger('info', ['handle-systems', 'system', system, 'firstName', firstName, 'lastName', lastName])
        const data = await handleData(user, method, fileName, {
          firstName,
          lastName
        })
        logger('info', ['handle-systems', 'system', system, 'firstName', firstName, 'lastName', lastName, 'data', 'received'])
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
