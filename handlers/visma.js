const { logger } = require('@vtfk/logger')
const handleData = require('../lib/handle-data')
const getResponse = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')

const getData = async (caller, data) => {
  const method = 'get'
  const fileName = 'Get-DUSTVisma.ps1'

  return await handleData(caller, method, fileName, data)
}

module.exports = async (caller, params) => {
  if (params.employeeNumber !== undefined) {
    logger('info', ['visma', 'employeeNumber', params.employeeNumber])
    const data = await getData(caller, {
      employeeNumber: params.employeeNumber
    })
    logger('info', ['visma', 'employeeNumber', params.employeeNumber, 'data', 'received', data.length || 1])
    return getResponse(data)
  }

  if (params.firstName !== undefined && params.lastName !== undefined) {
    logger('info', ['visma', 'firstName', params.firstName, 'lastName', params.lastName])
    const data = await getData(caller, {
      firstName: params.firstName,
      lastName: params.lastName
    })
    logger('info', ['visma', 'firstName', params.firstName, 'lastName', params.lastName, 'data', 'received', data.length || 1])
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
  })
}
