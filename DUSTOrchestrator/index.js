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
  const input = context.df.getInput()
  const { token } = input
  const instanceId = context.df.instanceId
  let parallelTasks = []
  let { body: { systems, user } } = input

  // get correct systems based on user's userPrincipalName and/or type
  systems = yield context.df.callActivity('WorkerActivity', {
    type: 'systems',
    query: {
      systems, user
    }
  })

  // set current user object and systems to customStatus
  context.df.setCustomStatus({
    user,
    systems
  })

  // create a new request in the db
  const newEntry = yield context.df.callActivity('WorkerActivity', {
    type: 'db',
    variant: 'new',
    query: {
      instanceId,
      user,
      systems,
      caller: token.upn
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
  const failedValidation = systemsValidation.filter(validation => !validation.execute).map(validation => validation.system)
  const succeededValidation = systemsValidation.filter(validation => validation.execute).map(validation => validation.system)

  if (failedValidation.length === 0) {
    // start all system requests
    yield context.df.callActivity('WorkerActivity', {
      type: 'logger',
      variant: 'info',
      query: ['orchestrator', 'Expected user type', user.expectedType, 'All systems succeeded validation', 'Starting all systems', systems]
    })
    parallelTasks.push(...callSystems(context, instanceId, systems, user, token))
  } else if (succeededValidation.length > 0) {
    // start validated systems first
    yield context.df.callActivity('WorkerActivity', {
      type: 'logger',
      variant: 'info',
      query: ['orchestrator', 'Expected user type', user.expectedType, 'Some systems failed validation', 'Starting validated systems first and then the failed systems afterwards', succeededValidation, failedValidation]
    })
    parallelTasks.push(...callSystems(context, instanceId, succeededValidation, user, token))

    // wait for validated system requests to finish
    yield context.df.Task.all(parallelTasks)

    // update user object with missing properties
    user = yield context.df.callActivity('WorkerActivity', {
      type: 'user',
      variant: 'update',
      query: {
        results: parallelTasks.filter(task => task.result.data).map(task => task.result),
        user
      }
    })

    // set current user object and systems to customStatus
    context.df.setCustomStatus({
      user,
      systems
    })

    // start systems which failed validation
    parallelTasks.push(...callSystems(context, instanceId, failedValidation, user, token))
  } else {
    // all systems failed validation
    yield context.df.callActivity('WorkerActivity', {
      type: 'logger',
      variant: 'error',
      query: ['orchestrator', 'Expected user type', user.expectedType, 'All systems failed validation']
    })

    // update request with a finish timestamp, user object and set error on all systems
    const updatedEntry = []
    for (let i = 0; i < systems.length; i++) { // this needs to be a for loop because of scoping
      updatedEntry.push(yield context.df.callActivity('WorkerActivity', {
        type: 'db',
        variant: 'update',
        query: {
          instanceId,
          timestamp: new Date().toISOString(),
          user,
          name: systems[i],
          error: { error: 'System failed validation' }
        }
      }))
    }

    return {
      status: 400,
      user,
      started: newEntry.started,
      finished: updatedEntry[0].$set.finished,
      data: systems.map(system => ({
        name: system,
        timestamp: new Date().toISOString(),
        error: {
          error: 'System failed validation'
        },
        status: 400,
        tests: []
      }))
    }
  }

  // wait for all system requests to finish
  yield context.df.Task.all(parallelTasks)

  // run all tests on all systems
  parallelTasks = yield context.df.callActivity('WorkerActivity', {
    type: 'test',
    variant: 'all',
    query: {
      instanceId,
      tasks: parallelTasks,
      user
    }
  })

  // update request with a finish timestamp and user object
  const finishedTimestamp = new Date().toISOString()
  const updatedEntry = yield context.df.callActivity('WorkerActivity', {
    type: 'db',
    variant: 'update',
    query: {
      instanceId,
      timestamp: finishedTimestamp,
      runtimeRequest: (new Date(finishedTimestamp) - new Date(newEntry.started)) / 1000,
      user
    }
  })

  return {
    user,
    started: newEntry.started,
    finished: updatedEntry.$set.finished,
    data: parallelTasks.map(task => {
      return {
        name: task.result.name,
        timestamp: task.timestamp,
        data: task.result.data || undefined,
        error: task.result.error || undefined,
        status: task.result.status || 200,
        innerError: task.result.innerError || undefined,
        tests: task.result.tests || undefined
      }
    })
  }
})
