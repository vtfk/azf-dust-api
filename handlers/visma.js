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
  const { employeeNumber, firstName, lastName } = params

  if (employeeNumber !== undefined) {
    logger('info', ['visma', 'employeeNumber', employeeNumber])
    const data = await getData(caller, {
      employeeNumber
    })
    logger('info', ['visma', 'employeeNumber', employeeNumber, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  if (firstName !== undefined && lastName !== undefined) {
    logger('info', ['visma', 'firstName', firstName, 'lastName', lastName])
    const data = await getData(caller, {
      firstName,
      lastName
    })
    logger('info', ['visma', 'firstName', firstName, 'lastName', lastName, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  throw new HTTPError(400, 'Missing required parameter(s)', {
    message: 'Missing required parameter(s). One of the following parameter sets are required',
    params: {
      paramSetOne: [
        'employeeNumber'
      ],
      paramSetTwo: [
        'firstName',
        'lastName'
      ]
    }
  })
}
