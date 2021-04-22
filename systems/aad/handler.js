const { logger } = require('@vtfk/logger')
const getGraphToken = require('../../lib/graph/get-graph-token')
const getGraphOptions = require('../../lib/graph/get-graph-options')
const getGraphData = require('../../lib/graph/get-graph-data')
const getResponse = require('../../lib/get-response-object')

const padDate = num => {
  return num >= 10 ? num : `0${num}`
}

const getYesterdaysDate = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${padDate(d.getMonth() + 1)}-${padDate(d.getDate())}`
}

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
  const graphUserAuthPhoneOptions = getGraphOptions({
    ...params,
    subQuery: 'authentication/phoneMethods',
    properties: undefined
  }, true)
  const graphSignInsOptions = getGraphOptions({
    ...params,
    rootQuery: `auditLogs/signIns?$filter=userPrincipalName eq '${params.userPrincipalName}' and createdDateTime gt ${getYesterdaysDate()} and status/errorCode eq 50126`,
    properties: undefined
  })

  logger('info', ['aad', 'graph-user', params.userPrincipalName, 'start'])
  const graphUser = await getGraphData(graphUserOptions, token)
  logger('info', ['aad', 'graph-user', params.userPrincipalName, 'finish'])

  logger('info', ['aad', 'graph-user-groups', params.userPrincipalName, 'start'])
  const graphUserGroups = await getGraphData(graphUserGroupsOptions, token)
  logger('info', ['aad', 'graph-user-groups', params.userPrincipalName, 'finish', 'received', (graphUserGroups && graphUserGroups.value && graphUserGroups.value.length) || 0])

  logger('info', ['aad', 'graph-user-mfa-methods', params.userPrincipalName, 'start'])
  const graphUserAuth = await getGraphData(graphUserAuthOptions, token)
  logger('info', ['aad', 'graph-user-mfa-methods', params.userPrincipalName, 'finish', 'received', (graphUserAuth && graphUserAuth.value && graphUserAuth.value.length) || 0])

  logger('info', ['aad', 'graph-user-mfa-phone', params.userPrincipalName, 'start'])
  const graphUserAuthPhone = await getGraphData(graphUserAuthPhoneOptions, token)
  logger('info', ['aad', 'graph-user-mfa-phone', params.userPrincipalName, 'finish', 'received', (graphUserAuthPhone && graphUserAuthPhone.value && graphUserAuthPhone.value.length) || 0])

  logger('info', ['aad', 'graph-user-signin-errors', params.userPrincipalName, 'start'])
  const graphUserSignIns = await getGraphData(graphSignInsOptions, token)
  logger('info', ['aad', 'graph-user-signin-errors', params.userPrincipalName, 'finish', 'received', (graphUserSignIns && graphUserSignIns.value && graphUserAuth.value.length) || 0])

  return getResponse({
    ...graphUser,
    transitiveMemberOf: graphUserGroups.value,
    authenticationMethods: [
      ...graphUserAuth.value,
      ...graphUserAuthPhone.value
    ],
    userSignInErrors: graphUserSignIns.value
  })
}
