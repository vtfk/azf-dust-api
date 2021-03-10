const df = require('durable-functions')
const { SOURCE_DATA_SYSTEMS } = require('../config')

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
  const instanceId = context.df.instanceId
  const parallelTasks = []
  let { body: { systems, user } } = context.df.getInput()

  // lowercase all system names
  systems = systems.map(system => system.toLowerCase())

  // add source data systems to systems if not already present
  SOURCE_DATA_SYSTEMS.forEach(system => {
    if (!systems.includes(system.toLowerCase())) systems.push(system.toLowerCase())
  })

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
  const failedValidation = systemsValidation.filter(validation => !validation.execute).map(validation => validation.system)
  const succeededValidation = systemsValidation.filter(validation => validation.execute).map(validation => validation.system)

  if (failedValidation.length === 0) {
    // start all system requests
    yield context.df.callActivity('WorkerActivity', {
      type: 'logger',
      variant: 'info',
      query: ['orchestrator', 'All systems succeeded validation', 'Starting all systems', systems]
    })
    parallelTasks.push(...callSystems(context, instanceId, systems, user, token))
  } else if (succeededValidation.length > 0) {
    // start validated systems first
    yield context.df.callActivity('WorkerActivity', {
      type: 'logger',
      variant: 'info',
      query: ['orchestrator', 'Some systems failed validation', 'Starting validated systems first and then the failed systems afterwards', succeededValidation, failedValidation]
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

    // start systems which failed validation
    parallelTasks.push(...callSystems(context, instanceId, failedValidation, user, token))
  } else {
    // all systems failed validation
    return {
      statusCode: 400,
      user,
      data: {
        systems,
        error: 'All systems failed validation'
      }
    }
  }

  // wait for all system requests to finish
  yield context.df.Task.all(parallelTasks)

  // run all tests on all systems
  yield context.df.callActivity('WorkerActivity', {
    type: 'test',
    variant: 'all',
    query: {
      instanceId,
      results: parallelTasks.filter(task => task.result.data).map(task => task.result),
      user
    }
  })

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
        data: task.result.data || undefined,
        test: task.result.test || undefined,
        statusCode: task.result.status || 200,
        error: task.result.error || undefined,
        innerError: task.result.innerError || undefined,
        timestamp: task.timestamp
      }
    })
  }
})
