const df = require('durable-functions')
const withTokenAuth = require('../lib/auth/with-token-auth')
const getStatusResponse = require('../lib/get-status-response')
const { RETRY_WAIT } = require('../config')

const status = async function (context, req) {
  const client = df.getClient(context)
  const { instanceId } = req.params
  const status = await client.getStatus(instanceId, true)

  // remove input from status object if everything is fine
  if (status.input && !([status.runtimeStatus, status.customStatus].includes('Failed'))) {
    delete status.input
  }

  let res = status
    ? ({
        body: status,
        headers: {}
      })
    : ({
        status: 404,
        body: {
          error: 'InstanceId not found',
          instanceId
        },
        headers: {}
      })

  // orchestrator is pending or running - return 202
  if (status && ['Running', 'Pending'].includes(status.runtimeStatus)) {
    res = {
      ...getStatusResponse(client, instanceId, RETRY_WAIT),
      body: {
        user: status.customStatus,
        started: status.createdTime,
        lastUpdated: status.lastUpdatedTime,
        data: status.historyEvents.filter(event => event.Result && event.Result.name).map(event => event.Result)
      }
    }
  }

  if (status && status.output && status.output.statusCode) res.status = status.output.statusCode
  res.headers['Content-Type'] = 'application/json; charset=utf-8'

  return res
}

module.exports = (context, req) => withTokenAuth(context, req, status)
