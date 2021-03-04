const { newRequest } = require('../lib/mongo/handle-mongo')

module.exports = async function (context) {
  return await newRequest(context.bindings.request)
}
