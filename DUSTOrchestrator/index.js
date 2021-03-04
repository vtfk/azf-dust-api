const df = require('durable-functions')
const { validate } = require('../lib/user-query')
const updateUser = require('../lib/update-user')

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

  // determine if enough data is present to call all systems at once, or if extens and visma needs to be called first
  const systemsValidation = validate(systems, user)
  if (systemsValidation.filter(validation => !validation.execute).length === 0) {
    console.log('Start all systems')
    // start all system requests
    systems.forEach(system => {
      parallelTasks.push(context.df.callActivity('DUSTActivity', { instanceId, system, user, token }))
    })

    // wait for all system requests to finish
    yield context.df.Task.all(parallelTasks)
  } else {
    // start validate systems first, wait for them to finish and update user object with missing properties
    systemsValidation.filter(validation => validation.execute).forEach(validation => {
      parallelTasks.push(context.df.callActivity('DUSTActivity', {
        instanceId,
        system: validation.system,
        user,
        token
      }))
    })
    
    // wait for validated system requests to finish
    yield context.df.Task.all(parallelTasks)

    const updatedUser = updateUser(parallelTasks.map(task => task.result), user)

    systemsValidation.filter(validation => !validation.execute).forEach(validation => {
      parallelTasks.push(context.df.callActivity('DUSTActivity', {
        instanceId,
        system: validation.system,
        user: updatedUser,
        token
      }))
    })

    // wait for non-validated system requests to finish
    yield context.df.Task.all(parallelTasks)
  }

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
