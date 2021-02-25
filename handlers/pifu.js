const { logger } = require('@vtfk/logger')
const handleData = require('../lib/handle-data')
const getResponse = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')

const getData = async (caller, data) => {
  const method = 'get'
  const fileName = 'Get-DUSTPifu.ps1'

  return await handleData(caller, method, fileName, data)
}

module.exports = async (caller, params) => {
  const { employeeNumber } = params

  if (employeeNumber !== undefined) {
    logger('info', ['pifu', 'employeeNumber', employeeNumber])
    const data = await getData(caller, {
      employeeNumber
    })
    logger('info', ['pifu', 'employeeNumber', employeeNumber, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  throw new HTTPError(400, 'Missing required parameter', {
    message: 'Missing required parameter',
    params: [
      'employeeNumber'
    ]
  })
}
