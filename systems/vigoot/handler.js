const { logger } = require('@vtfk/logger')
const { getVigoUser } = require('../../lib/mongo/handle-mongo')
const { hasData } = require('../../lib/helpers/system-data')
const getResponse = require('../../lib/get-response-object')
const HTTPError = require('../../lib/http-error')

module.exports = async params => {
  const { employeeNumber, type } = params

  if (type === null || type === undefined) {
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameter',
      params: [
        'Type'
      ]
    })
  }

  if (employeeNumber === null || employeeNumber === undefined) {
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameter',
      params: [
        'EmployeeNumber'
      ]
    })
  }

  logger('info', [type, 'employeeNumber', employeeNumber])
  const user = await getVigoUser({ fnr: employeeNumber }, type)
  logger('warn', [type, 'employeeNumber', employeeNumber, hasData(user) ? 'data received' : 'data not found'])
  return getResponse(hasData(user) ? user : {})
}
