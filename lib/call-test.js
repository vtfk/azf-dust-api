const { logger } = require('@vtfk/logger')
const { hasData } = require('./helpers/system-data')

module.exports = (system, data, user, allData = false) => {
  const { validate } = require('../systems')[system]
  if (typeof validate === 'function') {
    if (hasData(data)) {
      logger('info', ['call-test', system, `executing ${allData ? 'all' : 'system'} tests`])
      return !allData ? validate(data, user) : validate(data, user, allData)
    } else {
      logger('warn', ['call-test', system, 'no data to test'])
      return []
    }
  } else {
    logger('warn', ['call-test', system, 'no tests implemented'])
    return []
  }
}
