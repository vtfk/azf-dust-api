const df = require('durable-functions')
const { logger } = require('@vtfk/logger')
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
    // orchestrator is pending or running - return 202
    if (['Running', 'Pending'].includes(status.runtimeStatus)) {
      res = getStatusResponse(client, instanceId, RETRY_WAIT)
      if (customStatus && customStatus.user && customStatus.systems) {
        res.body = {
          ...res.body,
          user: customStatus.user,
          systems: customStatus.systems
        }
      }
    } else {
      // orchestrator is either (Canceled, Completed, ContinuedAsNew, Failed, Terminated or Unknown) - return 200
      const httpStatus = status.output.status || 200
      if (status.output.status) delete status.output.status
      res = {
        status: httpStatus,
        body: status.output,
        headers: {}
      }
    }
  } else if (instanceId) {
    logger('info', 'InstanceID not found in DurableFunctionsHistory. Fetching from mongo')
    // instanceId is given but not found in StorageAccount. Try finding it in the DB
    const entry = await getRequest(instanceId)
    if (entry) {
      res = {
        body: {
          user: entry.user,
          started: entry.started,
          finished: entry.finished,
          vigobas: entry.vigobas || undefined,
          data: entry.systems
        },
        headers: {}
      }
    } else {
      logger('error', 'InstanceID not found in DurableFunctionsHistory nor in mongo !!')
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

  // add shared header to all calls
  res.headers['Content-Type'] = 'application/json; charset=utf-8'

  return res
}

module.exports = (context, req) => withTokenAuth(context, req, status)
