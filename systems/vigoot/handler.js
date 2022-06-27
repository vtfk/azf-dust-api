const { logger } = require('@vtfk/logger')
const { getVigoUser } = require('../../lib/mongo/handle-mongo')
const { hasData } = require('../../lib/helpers/system-data')
const getResponse = require('../../lib/get-response-object')
const HTTPError = require('../../lib/http-error')

module.exports = async params => {
  const { employeeNumber, title } = params

  if (title === null || title === undefined) {
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameter',
      params: [
        'Title'
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

  logger('info', [title, 'employeeNumber', employeeNumber])
  const user = await getVigoUser({ fnr: employeeNumber }, title)
  logger('warn', [title, 'employeeNumber', employeeNumber, hasData(user) ? 'data received' : 'data not found'])
  return getResponse(hasData(user) ? user : {})
}
