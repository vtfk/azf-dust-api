const df = require('durable-functions')
const { SOURCE_DATA_SYSTEMS } = require('../config')
const { hasData } = require('../lib/helpers/system-data')

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

  // lowercase all system names
  systems = systems.map(system => system.toLowerCase())

  // add source data systems to systems if not already present
  SOURCE_DATA_SYSTEMS.forEach(system => {
    if (!systems.includes(system.toLowerCase())) systems.push(system.toLowerCase())
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

  // if user not found in ad but is found in one of the source systems, switch users expectedType and do new searches for systems missing data
  const adData = parallelTasks.filter(task => task.result.name === 'ad' && hasData(task.result.data))
  const sourceData = parallelTasks.filter(task => SOURCE_DATA_SYSTEMS.includes(task.result.name) && hasData(task.result.data))
  if (!hasData(adData) && hasData(sourceData)) {
    // switch users expectedType
    user.initialExpectedType = user.expectedType
    user.expectedType = user.initialExpectedType === 'employee' ? 'student' : 'employee'

    // set current user object and systems to customStatus
    context.df.setCustomStatus({
      user,
      systems
    })

    const retrySystems = parallelTasks.filter(task => !hasData(task.result.data) && !task.result.error).map(task => task.result.name)
    parallelTasks = parallelTasks.filter(task => !retrySystems.includes(task.result.name))

    yield context.df.callActivity('WorkerActivity', {
      type: 'logger',
      variant: 'warn',
      query: ['orchestrator', 'Systems missing data', 'Retrying with flipped user.expectedType', user.expectedType, retrySystems]
    })
    parallelTasks.push(...callSystems(context, instanceId, retrySystems, user, token))

    // wait for all retry system requests to finish
    yield context.df.Task.all(parallelTasks)
  }

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
  const updatedEntry = yield context.df.callActivity('WorkerActivity', {
    type: 'db',
    variant: 'update',
    query: {
      instanceId,
      timestamp: new Date().toISOString(),
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
