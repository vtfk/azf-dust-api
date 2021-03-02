const { logger } = require('@vtfk/logger')
const mongo = require('./get-mongo')

module.exports.newRequest = async request => {
  const db = await mongo()
  const { instanceId, systems } = request

  logger('info', ['handle-mongo', 'new-request', 'start'])
  const result = await db.insertOne({
    instanceId,
    systems
  })
  logger('info', ['handle-mongo', 'new-request', 'finish'])

  return result
}

module.exports.updateRequest = async request => {
  const db = await mongo()
  const { instanceId, name, data, status, test } = request

  logger('info', ['handle-mongo', 'update-request', 'start'])
  const result = await db.findOne({ instanceId })
  logger('info', ['handle-mongo', 'update-request', 'instanceId found'])

  result.systems = result.systems.map(system => {
    if (system.name !== name) { return system }

    if (data !== undefined) system.data = data
    if (status !== undefined) system.status = status
    if (test !== undefined) {
      if (system.test) system.test.push(test)
      else system.test = [test]
    }

    return system
  })

  const replaceResult = await db.replaceOne({ instanceId }, result)
  logger('info', ['handle-mongo', 'update-request', 'finish'])

  return replaceResult
}
