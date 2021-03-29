const { logger } = require('@vtfk/logger')
const withTokenAuth = require('../lib/auth/with-token-auth')
const getResponseObject = require('../lib/get-response-object')
const { search } = require('../lib/mongo/handle-mongo')
const { USER_SEARCH_LIMIT } = require('../config')

const handleSearch = async (context, req) => {
  const { q, top } = req.query
  const query = decodeURIComponent(q)
  const searchLimit = (top && Number.parseInt(top)) || USER_SEARCH_LIMIT

  logger('info', ['handle-search', 'limit', searchLimit, 'search term', `'${query}'`])

  const searchRes = q ? await search(query, searchLimit) : []
  return getResponseObject({
    result: searchRes // Workaround for axios som ikke takler at body kun er et array
  })
}

module.exports = (context, req) => withTokenAuth(context, req, handleSearch)
