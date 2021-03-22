const { logger, logConfig } = require('@vtfk/logger')
const { newRequest, updateRequest } = require('../lib/mongo/handle-mongo')
const { validate } = require('../lib/user-query')
const updateUser = require('../lib/update-user')
const test = require('../lib/call-test')

const getSystems = results => {
  const data = {}
  results.forEach(result => {
    if (result.data) data[result.name] = result.data
  })
  return data
}

module.exports = async function (context) {
  const { type, variant, query } = context.bindings.request

  logConfig({
    azure: {
      context,
      excludeInvocationId: true
    }
  })

  if (type === 'db' && variant === 'new') {
    return await newRequest(query)
  } else if (type === 'db' && variant === 'update') {
    return await updateRequest(query)
  } else if (type === 'user' && variant === 'validate') {
    return validate(query.systems, query.user)
  } else if (type === 'user' && variant === 'update') {
    return updateUser(query.results, query.user)
  } else if (type === 'logger') {
    logger(variant, query)
  } else if (type === 'test') {
    const { instanceId, tasks, user } = query
    const systems = getSystems(tasks.map(task => task.result))
    logger('info', ['worker-activity', 'final tests', 'systems', Object.getOwnPropertyNames(systems).length])

    return await Promise.all(tasks.map(async task => {
      task.result.tests = test(task.result.name, task.result.data, user, systems)
      await updateRequest({ instanceId, ...task.result })

      return task
    }))
  }
}
