const { logger } = require('@vtfk/logger')

const isNonEmptyArray = obj => Array.isArray(obj) && obj.length > 0
const isNonEmptyObject = obj => typeof obj === 'object' && Object.getOwnPropertyNames(obj).filter(prop => prop !== 'length').length > 0

module.exports = (system, data, user, allData = false) => {
  const { validate } = require('../systems')[system]
  if (typeof validate === 'function') {
    if (data && (isNonEmptyArray(data) || isNonEmptyObject(data))) {
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
