const { STATUS_PAGE } = require('../config')

module.exports = (client, instanceId, retryAfter = 10) => {
  const managementUrls = client.createHttpManagementPayload(instanceId)
  const oldStatus = managementUrls.statusQueryGetUri

  const hostname = STATUS_PAGE.URL || oldStatus.match(/(^(?:(?:.*?)?\/\/)?[^/?#;]*)/)[0]

  const statusUrl = `${hostname}/${STATUS_PAGE.ENDPOINT}/${instanceId}`
  managementUrls.statusQueryGetUri = statusUrl

  return {
    status: 202,
    headers: {
      'Access-Control-Expose-Headers': 'Location,Retry-After', // this MUST be set when CORS is enabled. Otherwise these entries will not be visible in the browser: https://stackoverflow.com/questions/37897523/axios-get-access-to-response-header-fields
      'Content-Type': 'application/json; charset=utf-8',
      Location: statusUrl,
      'Retry-After': retryAfter
    },
    body: managementUrls
  }
}
