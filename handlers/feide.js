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
  if (params.samAccountName !== undefined) {
    logger('info', ['feide', 'samAccountName', params.samAccountName])
    const data = await getData(caller, {
      samAccountName: params.samAccountName
    })
    logger('info', ['feide', 'samAccountName', params.samAccountName, 'data', 'received', data.length || 1])
    return getResponse(data)
  }

  throw new HTTPError(422, 'Missing required parameter', {
    params: [
      'samAccountName'
    ]
  })
}
