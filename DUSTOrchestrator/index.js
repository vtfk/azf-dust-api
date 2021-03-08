const df = require('durable-functions')

const callSystems = (context, instanceId, systems, user, token) => {
  return systems.map(system => {
    return context.df.callActivity('DUSTActivity', {
      instanceId,
      system,
      user,
      token
    })
  })
}
module.exports = df.orchestrator(function * (context) {
  const { token } = context.df.getInput()
  let { body: { systems, user } } = context.df.getInput()
  const instanceId = context.df.instanceId
  const parallelTasks = []

  // create a new request in the db
  yield context.df.callActivity('WorkerActivity', {
    type: 'db',
    variant: 'new',
    query: {
      instanceId,
      user,
      systems
    }
  })

  // determine if enough data is present to call all systems at once
  const systemsValidation = yield context.df.callActivity('WorkerActivity', {
    type: 'user',
    variant: 'validate',
    query: {
      systems,
      user
    }
  })
  const succeededValidation = systemsValidation.filter(validation => validation.execute).map(validation => validation.system)

  if (failValidated.length === 0) {
    // start all system requests
    logger('info', ['orchestrator', 'All systems succeeded validation', 'Starting all systems', systems])
    parallelTasks.push(...callSystems(context, instanceId, systems, user, token))
    // start validated systems first
    logger('info', ['orchestrator', 'Some systems failed validation', 'Starting validated systems first and then the failed validation systems afterwards'])
    parallelTasks.push(...callSystems(context, instanceId, succeededValidation, user, token))

    // wait for validated system requests to finish
    yield context.df.Task.all(parallelTasks)

    // update user object with missing properties
    user = yield context.df.callActivity('WorkerActivity', {
      type: 'user',
      variant: 'update',
      query: {
        results: parallelTasks.map(task => task.result),
        user
      }
    })

    // start systems which failed validation
    parallelTasks.push(...callSystems(context, instanceId, failedValidation, user, token))
  }

  // wait for all system requests to finish
  yield context.df.Task.all(parallelTasks)

  // update request with a finish timestamp and user object
  const timestamp = new Date().toISOString()
  yield context.df.callActivity('WorkerActivity', {
    type: 'db',
    variant: 'update',
    query: {
      instanceId,
      timestamp,
      user
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
