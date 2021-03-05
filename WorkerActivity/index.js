const { newRequest, updateRequest } = require('../lib/mongo/handle-mongo')
const { validate } = require('../lib/user-query')
const updateUser = require('../lib/update-user')

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
  }
}
