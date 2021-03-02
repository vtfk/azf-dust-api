const { logger } = require('@vtfk/logger')
const { DEFAULT_CALLER } = require('../config')
const { updateRequest } = require('../lib/mongo/handle-mongo')
const callHandler = require('../handlers/call-handlers')

module.exports = async function (context) {
  const { instanceId, system, token } = context.bindings.request
  const caller = (token && token.upn) || DEFAULT_CALLER

  logger('info', ['dust-activity', system.name, 'start'])
  const { body } = await callHandler(caller, system.params, system.name)
  logger('info', ['dust-activity', system.name, 'finish'])
  const result = { ...system, data: body }
  await updateRequest({ instanceId, ...result })
  return result
}
