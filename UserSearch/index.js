const { logger } = require('@vtfk/logger')
const withTokenAuth = require('../lib/auth/with-token-auth')
const getResponseObject = require('../lib/get-response-object')
const { search } = require('../lib/mongo/handle-mongo')

const handleSearch = async (context, req) => {
  const { q, top } = req.query
  const query = decodeURIComponent(q)
  const searchLimit = parseInt(top)

  logger('info', ['handle-search', 'limit', top, 'search term', query])

  const searchRes = q ? await search(query, searchLimit) : []
  return getResponseObject(searchRes)
}

module.exports = (context, req) => withTokenAuth(context, req, handleSearch)
