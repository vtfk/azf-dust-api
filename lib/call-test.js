const { logger } = require('@vtfk/logger')

module.exports = (system, data, user, allData = false) => {
  const { validate } = require('../systems')[system]
  if (typeof validate === 'function') {
    logger('info', ['call-test', system, `executing ${allData ? 'all' : 'system'} tests`])
    return validate(data, user, allData)
  } else {
    logger('warn', ['call-test', system, 'no tests implemented'])
    return []
  }
}
