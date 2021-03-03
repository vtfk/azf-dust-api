const { logger } = require('@vtfk/logger')
const mongo = require('./get-mongo')

module.exports.newRequest = async request => {
  const db = await mongo()
  const { instanceId, systems, user } = request

  logger('info', ['handle-mongo', 'new-request', 'start'])
  const result = await db.insertOne({
    instanceId,
    systems: systems.map(system => { return { name: system, tests: [] } }),
    user
  })
  logger('info', ['handle-mongo', 'new-request', 'finish'])

  return result
}

module.exports.updateRequest = async request => {
  const db = await mongo()
  const { instanceId, name, data, status, error, innerError, test } = request
  let setQuery = { $set: {} }
  let pushQuery = { $push: {} }

  logger('info', ['handle-mongo', 'update-request', 'start'])

  if (data !== undefined) setQuery.$set["systems.$.data"] = data
  if (status !== undefined) setQuery.$set["systems.$.status"] = status
  if (error !== undefined) setQuery.$set["systems.$.error"] = error
  if (innerError !== undefined) setQuery.$set["systems.$.innerError"] = innerError
  if (test !== undefined) {
    pushQuery.$push["systems.$.tests"] = test
  }

  if (Object.getOwnPropertyNames(setQuery.$set).length === 0) setQuery = {}
  if (Object.getOwnPropertyNames(pushQuery.$push).length === 0) pushQuery = {}

  const result = await db.updateOne(
    { instanceId, 'systems.name': name },
    {
      ...setQuery,
      ...pushQuery
    }
  )

  logger('info', ['handle-mongo', 'update-request', 'finish', result.modifiedCount])

  return result
}
