const { test, success, error, noData, warn } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')
const isWithinTimeRange = require('../../lib/helpers/is-within-timerange')
const { prettifyDateToLocaleString } = require('../../lib/helpers/date-time-output')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('sync-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    return dataPresent ? success('Har data') : error('Mangler data...')
  }),
  test('sync-02', 'Har vigobas lastRunTime', 'Sjekker siste kjøringstidspunkt for Vigobas', () => {
    if (!dataPresent) return noData()
    if (!systemData.vigobas || !systemData.vigobas.lastRunTime) return warn('Mangler kjøretidspunkt for Vigobas 😬')

    const lastRunTimeCheck = isWithinTimeRange(new Date(systemData.vigobas.lastRunTime), new Date(), (24 * 60 * 60)) // is last run performed less than 24 hours ago?
    const data = {
      lastRunTime: systemData.vigobas.lastRunTime,
      check: lastRunTimeCheck
    }
    return lastRunTimeCheck.result ? success(`Vigobas sist kjørt ${prettifyDateToLocaleString(new Date(systemData.vigobas.lastRunTime))}`, data) : warn('Det er mer enn 24 timer siden siste kjøring av Vigobas', data)
  }),
  test('sync-03', 'Har aad lastAzureADSyncTime', 'Sjekker siste synkroniseringstidspunkt for Azure AD', () => {
    if (!dataPresent) return noData()
    if (!systemData.aadSync || !systemData.aadSync.lastAzureADSyncTime) return warn('Mangler synkroniseringstidspunkt for Azure AD 😬')

    const lastRunTimeCheck = isWithinTimeRange(new Date(systemData.aadSync.lastAzureADSyncTime), new Date(), (40 * 60)) // is last run performed less than 40 minutes ago?
    const data = {
      lastAzureADSyncTime: systemData.aadSync.lastAzureADSyncTime,
      check: lastRunTimeCheck
    }
    return lastRunTimeCheck.result ? success(`AAD sist synkronisert: ${prettifyDateToLocaleString(new Date(systemData.aadSync.lastAzureADSyncTime))}`, data) : warn('Det er mer enn 40 minutter siden siste synkronisering av Azure AD', data)
  }),
  test('sync-04', 'Har sds lastSdsSyncTime', 'Sjekker siste synkroniseringstidspunkt for School Data Sync', () => {
    if (!dataPresent) return noData()
    if (!systemData.sdsSync || !systemData.sdsSync.lastSdsSyncTime) return warn('Mangler synkroniseringstidspunkt for School Data Sync 😬')

    const lastRunTimeCheck = isWithinTimeRange(new Date(systemData.sdsSync.lastSdsSyncTime), new Date(), (12 * 60 * 60)) // is last run performed less than 12 hour ago?
    const data = {
      lastSdsSyncTime: systemData.sdsSync.lastSdsSyncTime,
      check: lastRunTimeCheck
    }
    return lastRunTimeCheck.result ? success(`SDS sist synkronisert: ${prettifyDateToLocaleString(new Date(systemData.sdsSync.lastSdsSyncTime))}`, data) : warn('Det er mer enn 12 timer siden siste synkronisering av School Data Sync', data)
  })
])
