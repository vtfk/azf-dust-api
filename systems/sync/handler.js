const { logger } = require('@vtfk/logger')
const handleData = require('../../lib/handle-data')
const getGraphToken = require('../../lib/graph/get-graph-token')
const getGraphOptions = require('../../lib/graph/get-graph-options')
const getGraphData = require('../../lib/graph/get-graph-data')
const getResponse = require('../../lib/get-response-object')

const getData = async caller => {
  const method = 'get'
  const fileName = 'Get-DUSTVigoBas.ps1'

  return await handleData(caller, method, fileName)
}

module.exports = async caller => {
  //
  // VIGOBAS
  //
  logger('info', ['sync', 'vigobas', 'start'])
  const vigobas = await getData(caller)
  logger('info', ['sync', 'vigobas', 'data', 'received', Array.isArray(vigobas) ? vigobas.length : 1])

  //
  // AAD
  //
  logger('info', ['sync', 'aad', 'get graph token'])
  const token = await getGraphToken()
  logger('info', ['sync', 'aad', 'get graph token', 'length', token.length])

  const graphAadSyncOptions = getGraphOptions({
    userPrincipalName: caller,
    rootQuery: 'organization?$select=onPremisesLastSyncDateTime',
    properties: undefined
  })

  logger('info', ['sync', 'aad', 'graph-aadsync', caller, 'start'])
  const graphAadSync = await getGraphData(graphAadSyncOptions, token)
  logger('info', ['sync', 'aad', 'graph-aadsync', caller, 'finish', 'received', (graphAadSync && graphAadSync.value && graphAadSync.value.length) || 0])

  return getResponse({
    vigobas,
    aadSync: {
      lastAzureADSyncTime: (graphAadSync && graphAadSync.value && graphAadSync.value.length > 0 && graphAadSync.value[0].onPremisesLastSyncDateTime) || null
    }
  })
}
