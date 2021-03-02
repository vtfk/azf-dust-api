const { STATUS_PAGE } = require('../config')
const getAuthCode = require('./auth/get-auth-code')

module.exports = (req, client, instanceId, retryAfter = 10) => {
  const managementUrls = client.createHttpManagementPayload(instanceId)
  const oldStatus = managementUrls.statusQueryGetUri

  const hostname = STATUS_PAGE.URL || oldStatus.match(/(^(?:(?:.*?)?\/\/)?[^/?#;]*)/)[0]
  const code = getAuthCode(req)

  const statusUrl = `${hostname}/${STATUS_PAGE.ENDPOINT}/${instanceId}${code.query}`
  managementUrls.statusQueryGetUri = statusUrl

  return {
    status: 202,
    headers: {
      Location: statusUrl,
      'Retry-After': retryAfter
    },
    body: managementUrls
  }
}
