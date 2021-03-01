const { logger } = require('@vtfk/logger')
const getGraphToken = require('../lib/graph/get-graph-token')
const getGraphOptions = require('../lib/graph/get-graph-options')
const getGraphData = require('../lib/graph/get-graph-data')
const getResponse = require('../lib/get-response-object')

module.exports = async (params) => {
  logger('info', ['aad', 'get graph token'])
  const token = await getGraphToken()
  logger('info', ['aad', 'get graph token', 'length', token.length])

  const graphOptions = getGraphOptions(params)
  logger('info', ['aad', 'graph-user', graphOptions.url])
  const graphUser = await getGraphData(graphOptions, token)

  const graphOptionsMFA = getGraphOptions({ ...params,
    subQuery: 'authentication/methods',
    properties: undefined,
    expand: undefined
  })
  logger('info', ['aad', 'graph-user-mfa', graphOptionsMFA.url])
  const graphAuth = await getGraphData(graphOptionsMFA, token)
  
  return getResponse({ ...graphUser, ...graphAuth})
}
