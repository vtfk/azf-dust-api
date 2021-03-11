const { logger } = require('@vtfk/logger')

const success = (message, raw) => ({ status: 'ok', message, raw })
const error = (message, raw) => ({ status: 'error', message, raw })
const noData = message => ({ status: 'no-data', message })

const test = (id, title, description, validator) => {
  logger('verbose', ['testing', id, title])

  if (typeof validator !== 'function') throw new Error(`No validator was provided for test: ${id} (${title})`)
  const result = validator()
  logger('verbose', ['testing', id, title, result])

  return {
    id,
    title,
    description,
    result
  }
}

module.exports.test = test
module.exports.success = success
module.exports.error = error
module.exports.noData = noData
