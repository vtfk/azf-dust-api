const { logger } = require('@vtfk/logger')
const { SOURCE_DATA_SYSTEMS } = require('../config')
const { newRequest, updateRequest } = require('../lib/mongo/handle-mongo')
const { validate } = require('../lib/user-query')
const updateUser = require('../lib/update-user')
const { isApprentice, isOT } = require('../lib/helpers/is-type')
const test = require('../lib/call-test')

const getSystemsData = results => {
  const data = {}
  results.forEach(result => {
    if (result.data) data[result.name] = result.data
  })
  return data
}

module.exports = async function (context) {
  const { type, variant, query } = context.bindings.request

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
    const systemsData = getSystemsData(tasks.map(task => task.result))
    logger('info', ['worker-activity', 'final tests', 'systems with data', Object.getOwnPropertyNames(systemsData).length])

    return await Promise.all(tasks.map(async task => {
      if (task.result.error) {
        logger('error', ['worker-activity', 'final tests', 'system', task.result.name, 'Tests will not be executed due to error present'])
        task.result.tests = []
        return task
      }
      task.result.tests = test(task.result.name, task.result.data, user, systemsData)
      await updateRequest({ instanceId, ...task.result })

      return task
    }))
  } else if (type === 'systems') {
    const { user } = query
    let { systems } = query

    // systems to remove from query based on user's userPrincipalName (override)
    const removeSystems = {
      vigoUsers: [
        'sds',
        'vis',
        'visma'
      ],
      otherUsers: [
        'vigolaerling',
        'vigoot'
      ]
    }

    // lowercase all system names
    systems = systems.map(system => system.toLowerCase())

    // add source data systems to systems if not already present
    SOURCE_DATA_SYSTEMS.forEach(system => {
      if (!systems.includes(system.toLowerCase())) systems.push(system.toLowerCase())
    })

    // should user be overridden
    if (isApprentice(user)) {
      logger('info', ['worker-activity', 'systems', `overriding systems for VIGO Opplæring (${user.title})`])
      removeSystems.vigoUsers.push('vigoot')
      return systems.filter(system => !removeSystems.vigoUsers.includes(system))
    } else if (isOT(user)) {
      logger('info', ['worker-activity', 'systems', `overriding systems for VIGO OT (${user.title})`])
      removeSystems.vigoUsers.push('vigolaerling')
      return systems.filter(system => !removeSystems.vigoUsers.includes(system))
    }
    return systems.filter(system => !removeSystems.otherUsers.includes(system))
  }
}
