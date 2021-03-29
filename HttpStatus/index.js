const df = require('durable-functions')
const withTokenAuth = require('../lib/auth/with-token-auth')
const getStatusResponse = require('../lib/get-status-response')
const { getRequest } = require('../lib/mongo/handle-mongo')
const { RETRY_WAIT } = require('../config')

const status = async function (context, req) {
  const client = df.getClient(context)
  const { instanceId } = req.params
  const status = await client.getStatus(instanceId, true, true)
  const customStatus = status.customStatus

  // remove input from status object if everything is fine
  if (status && status.input && status.runtimeStatus !== 'Failed') {
    delete status.input
  }

  let res
  if (status) {
    // orchestrator could be finished. Set res.body to status.output. If it's not finished yet res.body will be replaced further down
    res = {
      body: status.output,
      headers: {}
    }
  } else if (instanceId) {
    // instanceId is given but not found in StorageAccount. Try finding it in the DB
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
      // instanceId not found in the DB either
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
    // instanceId not given
    res = {
      status: 404,
      body: {
        error: 'InstanceId not set',
        instanceId
      },
      headers: {}
    }
  }

  // orchestrator is pending or running - return 202
  if (status && ['Running', 'Pending'].includes(status.runtimeStatus)) {
    res = getStatusResponse(client, instanceId, RETRY_WAIT)
    if (customStatus && customStatus.user && customStatus.systems) {
      res.body = {
        ...res.body,
        user: customStatus.user,
        systems: customStatus.systems
      }
    }
  }

  // add shared header to all calls
  res.headers['Content-Type'] = 'application/json; charset=utf-8'

  return res
}

module.exports = (context, req) => withTokenAuth(context, req, status)
