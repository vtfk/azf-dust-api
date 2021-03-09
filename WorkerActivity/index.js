const { logger, logConfig } = require('@vtfk/logger')
const { newRequest, updateRequest } = require('../lib/mongo/handle-mongo')
const { validate } = require('../lib/user-query')
const updateUser = require('../lib/update-user')

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

    results.forEach(async result => {
      const { validate } = require('../systems')[result.name]
      if (typeof validate === 'function') {
        const tests = validate(result.data, user, true)
        if (Array.isArray(result.test)) {
          tests.forEach(test => {
            const testExists = result.test.filter(t => t.id === test.id)
            if (testExists) result.test.push(test)
          })
        } else result.test = tests

        await updateRequest({ instanceId, ...result })
      }
    })
  }
}
