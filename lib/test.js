const { logger } = require('@vtfk/logger')

const getResultObject = (options, status) => {
  const result = {
    status: options.status || status,
    solution: options.solution || undefined,
    message: options.message || options,
    raw: options.raw || undefined
  }

  // remove properties without value
  Object.keys(result).forEach(key => { if (!result[key]) delete result[key] })

  return result
}

/**
 * Description of options for success, warn and error
 * @typedef {Object} options
 * @property {string} message Result message to present in UI
 * @property {string} [solution] Optional property to set a probable solution
 * @property {string} [status] Optional property to set status. Usually not set. Default is handled in functions
 * @property {Object} [raw] Optional property to set a data object which will be presented in UI under 'Se data'
 */

/**
 * Generate a success object
 * @param {options} options - Options for success object
 */
const success = options => getResultObject(options, 'ok')
/**
 * Generate a warning object
 * @param {options} options - Options for warning object
 */
const warn = options => getResultObject(options, 'warning')
/**
 * Generate an error object
 * @param {options} options - Options for error object
 */
const error = options => getResultObject(options, 'error')
const waitForData = () => getResultObject({ status: 'waiting-for-data', message: 'Venter på data...' })
const noData = message => getResultObject({ status: 'no-data', message: message || 'Mangler data...' })

const test = (id, title, description, validator) => {
  if (typeof validator !== 'function') {
    logger('error', ['testing', id, title, 'No validator was provided'])
    throw new Error(`No validator was provided for test: ${id} (${title})`)
  }

  const result = validator()
  if (result && ['warning', 'no-data'].includes(result.status)) logger('warn', ['testing', id, title, result.message])
  else if (result && result.status === 'error') logger('error', ['testing', id, title, result.message])

  return {
    id,
    title,
    description,
    result
  }
}

module.exports.test = test
module.exports.success = success
module.exports.warn = warn
module.exports.error = error
module.exports.waitForData = waitForData
module.exports.noData = noData
