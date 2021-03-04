const { newRequest, updateRequest } = require('../lib/mongo/handle-mongo')

module.exports = async function (context) {
  const { type, query } = context.bindings.request

  return await (type === 'new' ? newRequest(query) : updateRequest(query))
}
