const df = require('durable-functions')

module.exports = df.orchestrator(function * (context) {
  const { body: { systems, user }, token } = context.df.getInput()
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
  const failValidated = systemsValidation.filter(validation => !validation.execute)
  const successValidated = systemsValidation.filter(validation => validation.execute)
  let updatedUser = null

  if (failValidated.length === 0) {
    // start all system requests
    systems.forEach(system => {
      parallelTasks.push(context.df.callActivity('DUSTActivity', { instanceId, system, user, token }))
    })
  } else {
    // start validated systems first
    successValidated.forEach(validation => {
      parallelTasks.push(context.df.callActivity('DUSTActivity', {
        instanceId,
        system: validation.system,
        user,
        token
      }))
    })

    // wait for validated system requests to finish
    yield context.df.Task.all(parallelTasks)

    // update user object with missing properties
    updatedUser = yield context.df.callActivity('WorkerActivity', {
      type: 'user',
      variant: 'update',
      query: {
        results: parallelTasks.map(task => task.result),
        user
      }
    })

    // start systems which fail-validated
    failValidated.forEach(validation => {
      parallelTasks.push(context.df.callActivity('DUSTActivity', {
        instanceId,
        system: validation.system,
        user: updatedUser,
        token
      }))
    })
  }

  // wait for all system requests to finish
  yield context.df.Task.all(parallelTasks)

  // update request with a finish timestamp and update user object with updatedUser
  const timestamp = new Date().toISOString()
  yield context.df.callActivity('WorkerActivity', {
    type: 'db',
    variant: 'update',
    query: {
      instanceId,
      finishTimestamp: timestamp,
      user: updatedUser || user
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
