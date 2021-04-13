const { logger } = require('@vtfk/logger')
const { MONGO } = require('../../config')
const mongo = require('./get-mongo')
const { DEMO, DEMO_SKIP_DB } = require('../../config')

module.exports.newRequest = async request => {
  const { instanceId, systems, user, caller } = request
  const data = {
    instanceId,
    user,
    started: new Date().toISOString(),
    finished: null,
    vigobas: null,
    caller,
    systems: systems.map(system => { return { name: system, tests: [] } })
  }

  if (DEMO && DEMO_SKIP_DB) {
    logger('warn', ['handle-mongo', 'new-request', 'DEMO'])
    return data
  }

  const db = await mongo()
  logger('info', ['handle-mongo', 'new-request', 'start'])
  const result = await db.insertOne(data)
  logger('info', ['handle-mongo', 'new-request', 'finish'])
  return result ? data : false
}

module.exports.updateRequest = async request => {
  const { instanceId, name, data, user, status, error, innerError, tests, timestamp, vigobas } = request
  const setQuery = { $set: {} }
  const filter = { instanceId }

  if (data !== undefined) setQuery.$set['systems.$.data'] = data
  if (status !== undefined) setQuery.$set['systems.$.status'] = status
  if (error !== undefined) setQuery.$set['systems.$.error'] = error
  if (innerError !== undefined) setQuery.$set['systems.$.innerError'] = innerError
  if (user !== undefined) setQuery.$set.user = user
  if (timestamp !== undefined) setQuery.$set.finished = timestamp
  if (tests !== undefined) setQuery.$set['systems.$.tests'] = tests
  if (name !== undefined) filter['systems.name'] = name
  if (vigobas !== undefined) setQuery.$set.vigobas = vigobas

  if (Object.getOwnPropertyNames(setQuery.$set).length === 0) {
    logger('warn', ['handle-mongo', 'update-request', 'finish', 'nothing to do...'])
    return false
  }

  if (DEMO && DEMO_SKIP_DB) {
    logger('warn', ['handle-mongo', 'update-request', 'DEMO'])
    return setQuery
  }

  const db = await mongo()
  logger('info', ['handle-mongo', 'update-request', 'start'])
  const result = await db.updateOne(
    filter,
    {
      ...setQuery
    }
  )
  logger('info', ['handle-mongo', 'update-request', 'finish', result.modifiedCount])
  return result.modifiedCount > 0 ? setQuery : false
}

module.exports.getRequest = async instanceId => {
  const db = await mongo()
  logger('info', ['handle-mongo', 'get-request', 'start'])
  const result = await db.findOne({ instanceId })
  logger('info', ['handle-mongo', 'get-request', 'finish'])
  return result
}

module.exports.search = async (query, limit) => {
  const db = await mongo(MONGO.COLLECTION_USERS)
  return await db.aggregate([
    {
      $search: {
        text: {
          query,
          path: ['employeeNumber', 'samAccountName', 'userPrincipalName', 'displayName']
        }
      }
    },
    {
      $limit: parseInt(limit) || 10
    }
  ]).toArray()
}
