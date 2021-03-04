const df = require('durable-functions')

module.exports = df.orchestrator(function * (context) {
  const { body: { systems, user }, token } = context.df.getInput()
  const instanceId = context.df.instanceId
  const parallelTasks = []

  // create a new request in the db
  yield context.df.callActivity('DatabaseActivity', {
    type: 'new',
    query: {
      instanceId,
      user,
      systems
    }
  })

  // start all system requests
  systems.forEach(system => {
    parallelTasks.push(context.df.callActivity('DUSTActivity', { instanceId, system, user, token }))
  })

  // wait for all system requests to finish
  yield context.df.Task.all(parallelTasks)

  // update request with a finish timestamp
  const timestamp = new Date().toISOString()
  yield context.df.callActivity('DatabaseActivity', {
    type: 'update',
    query: {
      instanceId,
      finishTimestamp: timestamp
    }
  })

  return {
    user,
    data: parallelTasks.map(task => {
      return {
        name: task.result.name,
        data: task.result.data,
        statusCode: task.result.status || 200,
        error: task.result.error || undefined,
        innerError: task.result.innerError || undefined,
        timestamp: task.timestamp
      }
    })
  }
})
