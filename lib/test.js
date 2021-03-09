const { logger } = require('@vtfk/logger')

module.exports = (id, title, description, validator) => {
  logger('verbose', ['testing', id])

  if (typeof validator !== 'function') throw new Error(`No validator was provided for test: ${id} (${title})`)
  const result = validator()

  return {
    id,
    title,
    description,
    result
  }
}
