const { logger } = require('@vtfk/logger')
const handleData = require('../../lib/handle-data')
const getResponse = require('../../lib/get-response-object')
const HTTPError = require('../../lib/http-error')

const getData = async (caller, data) => {
  const method = 'get'
  const fileName = 'Get-DUSTEquitrac.ps1'

  return await handleData(caller, 'equitrac', method, fileName, data)
}

module.exports = async (caller, params) => {
  const { samAccountName } = params

  if (samAccountName !== undefined) {
    logger('info', ['equitrac', 'samAccountName', samAccountName])
    const data = await getData(caller, {
      samAccountName
    })
    logger('info', ['equitrac', 'samAccountName', samAccountName, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  }

  throw new HTTPError(400, 'Missing required parameter', {
    message: 'Missing required parameter',
    params: [
      'samAccountName'
    ]
  })
}
