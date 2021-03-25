const df = require('durable-functions')
const withTokenAuth = require('../lib/auth/with-token-auth')
const getStatusResponse = require('../lib/get-status-response')
const { getRequest } = require('../lib/mongo/handle-mongo')
const { RETRY_WAIT } = require('../config')

const status = async function (context, req) {
  const client = df.getClient(context)
  const { instanceId } = req.params
  const status = await client.getStatus(instanceId, true, true)

  // remove input from status object if everything is fine
  if (status.input && !([status.runtimeStatus, status.customStatus].includes('Failed'))) {
    delete status.input
  }

  let res
  if (status) {
    res = {
      body: status.output,
      headers: {}
    }
  } else if (instanceId) {
    const entry = await getRequest(instanceId)
    if (entry) {
      res = {
        body: {
          user: entry.user,
          started: entry.started,
          finished: entry.finished,
          data: entry.systems
        },
        headers: {}
      }
    } else {
      res = {
        status: 404,
        body: {
          error: 'Database entry not found',
          instanceId
        },
        headers: {}
      }
    }
  } else {
    res = {
      status: 404,
      body: {
        error: 'InstanceId not found',
        instanceId
      },
      headers: {}
    }
  }

  // orchestrator is pending or running - return 202
  if (status && ['Running', 'Pending'].includes(status.runtimeStatus)) {
    const runtimeResponse = getStatusResponse(client, instanceId, RETRY_WAIT)
    res = {
      body: {
        status: runtimeResponse.status,
        headers: runtimeResponse.headers
      },
      headers: {}
    }
  }

  if (status && status.output && status.output.statusCode) res.status = status.output.statusCode
  res.headers['Content-Type'] = 'application/json; charset=utf-8'

  return res
}

module.exports = (context, req) => withTokenAuth(context, req, status)
