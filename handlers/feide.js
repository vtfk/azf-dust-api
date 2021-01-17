const { logger } = require('@vtfk/logger')
const handleData = require('../lib/handle-data')
const getResponse = require('../lib/get-response-object')
const HTTPError = require('../lib/http-error')

module.exports = async (caller, params) => {
  const method = 'get'
  const fileName = 'Get-DUSTFeide.ps1'

  if (params.samAccountName !== undefined) {
    logger('info', ['feide', 'samAccountName', params.samAccountName])
    const data = await handleData(caller, method, fileName, {
      samAccountName: params.samAccountName
    })
    logger('info', ['feide', 'samAccountName', params.samAccountName, 'data', 'received'])
    return getResponse(data)
  }

  throw new HTTPError(422, 'Missing required parameter', {
    params: [
      'samAccountName'
    ]
  })
}
