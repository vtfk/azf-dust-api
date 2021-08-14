const { logger } = require('@vtfk/logger')
const axios = require('axios').default
const generateJwt = require('../../lib/auth/generate-jwt')
const getResponse = require('../../lib/get-response-object')
const HTTPError = require('../../lib/http-error')
const { SYSTEMS: { VIS: { FINT_BETA, FINT_API_URL, FINT_JWT_SECRET } } } = require('../../config')

module.exports = async params => {
  const { employeeNumber } = params

  if (employeeNumber === undefined) {
    logger('error', ['vis', 'missing required parameter', 'employeeNumber'])
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameter',
      params: [
        'employeeNumber'
      ]
    })
  }

  const query = {
    template: 'person',
    variables: {
      fodselsnummer: employeeNumber
    },
    options: {
      beta: FINT_BETA
    }
  }
  const token = generateJwt(FINT_JWT_SECRET)
  axios.defaults.headers.common.Authorization = `Bearer ${token}`

  try {
    logger('info', ['vis', 'employeeNumber', employeeNumber, 'start'])
    const { data } = await axios.post(FINT_API_URL, query)
    logger('info', ['vis', 'employeeNumber', employeeNumber, 'data', 'received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  } catch (error) {
    logger('error', ['vis', 'employeeNumber', employeeNumber, error.response.data.message])
    if (/Cannot return null for non-nullable type: 'Personnavn' within parent 'Person'/.exec(error.response.data.message)) return getResponse({})
    else throw error
  }
}