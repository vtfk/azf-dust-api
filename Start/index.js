const df = require('durable-functions')
const getStatusResponse = require('../lib/get-status-response')
const { RETRY_WAIT } = require('../config')
const withTokenAuth = require('../lib/auth/with-token-auth')

const start = async function (context, req) {
  const client = df.getClient(context)
  const instanceId = await client.startNew('DUSTOrchestrator', context.invocationId, req)

  return {
    body: getStatusResponse(client, instanceId, RETRY_WAIT),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }
}

module.exports = (context, req) => withTokenAuth(context, req, start)
