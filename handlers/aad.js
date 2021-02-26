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
  logger('info', ['aad', 'graph-url', graphOptions.url])
  const graphData = await getGraphData(graphOptions, token)
  return getResponse(graphData)
}
