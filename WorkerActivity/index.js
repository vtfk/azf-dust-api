const { logger, logConfig } = require('@vtfk/logger')
const { newRequest, updateRequest } = require('../lib/mongo/handle-mongo')
const { validate } = require('../lib/user-query')
const updateUser = require('../lib/update-user')

const getSystems = results => {
  const data = {}
  results.forEach(result => { data[result.name] = result.data })
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
    const { instanceId, results, user } = query
    const systems = getSystems(results)
    logger('info', ['worker-activity', 'Starting final tests', 'Systems', Object.getOwnPropertyNames(systems).length])

    results.forEach(async result => {
      const { validate } = require('../systems')[result.name]
      if (typeof validate === 'function') {
        if (result.data) result.test = validate(result.data, user, systems)
        else {
          logger('warn', ['worker-activity', 'final tests', result.name, 'no data to test'])
          result.test = []
        }
      } else {
        logger('warn', ['worker-activity', 'final tests', result.name, 'no tests found'])
        result.test = []
      }
      await updateRequest({ instanceId, ...result })
    })
  }
}
