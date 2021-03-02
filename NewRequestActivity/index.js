const { newRequest } = require('../lib/mongo/handle-mongo')

module.exports = async function (context) {
  const { systems, instanceId } = context.bindings.request

  return await newRequest({
    instanceId,
    systems
  })
}
