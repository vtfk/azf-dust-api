const { logger } = require('@vtfk/logger')
const getGraphToken = require('../../lib/graph/get-graph-token')
const getGraphOptions = require('../../lib/graph/get-graph-options')
const getGraphData = require('../../lib/graph/get-graph-data')
const getResponse = require('../../lib/get-response-object')

module.exports = async (params) => {
  // get token
  logger('info', ['aad', 'get graph token'])
  const token = await getGraphToken()
  logger('info', ['aad', 'get graph token', 'length', token.length])

  // build queries
  const graphUserOptions = getGraphOptions(params)
  const graphUserGroupsOptions = getGraphOptions({
    ...params,
    subQuery: 'transitiveMemberOf',
    properties: undefined
  })
  const graphUserAuthOptions = getGraphOptions({
    ...params,
    subQuery: 'authentication/methods',
    properties: undefined
  })

  logger('info', ['aad', 'graph-user', params.userPrincipalName, 'start'])
  const graphUser = await getGraphData(graphUserOptions, token)
  logger('info', ['aad', 'graph-user', params.userPrincipalName, 'finish'])

  logger('info', ['aad', 'graph-user-groups', params.userPrincipalName, 'start'])
  const graphUserGroups = await getGraphData(graphUserGroupsOptions, token)
  logger('info', ['aad', 'graph-user-groups', params.userPrincipalName, 'finish', 'received', (graphUserGroups && graphUserGroups.value && graphUserGroups.value.length) || 0])

  logger('info', ['aad', 'graph-user-mfa', params.userPrincipalName, 'start'])
  const graphUserAuth = await getGraphData(graphUserAuthOptions, token)
  logger('info', ['aad', 'graph-user-mfa', params.userPrincipalName, 'finish', 'received', (graphUserAuth && graphUserAuth.value && graphUserAuth.value.length) || 0])

  return getResponse({
    ...graphUser,
    transitiveMemberOf: graphUserGroups.value,
    authenticationMethods: graphUserAuth.value
  })
}
