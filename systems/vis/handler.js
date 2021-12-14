const { logger } = require('@vtfk/logger')
const axios = require('axios').default
const generateJwt = require('../../lib/auth/generate-jwt')
const getResponse = require('../../lib/get-response-object')
const isTeacher = require('../../lib/helpers/is-teacher')
const HTTPError = require('../../lib/http-error')
const { SYSTEMS: { VIS: { FINT_BETA, FINT_API_URL, FINT_JWT_SECRET, FINT_TIMEOUT }, FEIDE: { PRINCIPAL_NAME } } } = require('../../config')

module.exports = async params => {
  const { employeeNumber, samAccountName, feide = false } = params
  const isATeacher = isTeacher({ feide })

  if (employeeNumber === undefined && samAccountName === undefined) {
    logger('error', ['vis', 'missing required parameters'])
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameters. One of the following parameters are required',
      params: [
        'employeeNumber',
        'samAccountName'
      ]
    })
  } else if (samAccountName && !isATeacher) {
    logger('info', ['vis', 'no need to query FINT for regular employees'])
    return {}
  }

  const template = isATeacher ? 'schoolEmployee' : samAccountName ? 'employee' : 'student'
  const identity = isATeacher ? `${samAccountName}${PRINCIPAL_NAME}` : employeeNumber
  const query = {
    template,
    variables: {
      identity
    },
    options: {
      beta: FINT_BETA
    },
    timeout: FINT_TIMEOUT
  }
  const token = generateJwt(FINT_JWT_SECRET)
  axios.defaults.headers.common.Authorization = `Bearer ${token}`

  try {
    logger('info', ['vis', template, isATeacher ? 'samAccountName' : 'employeeNumber', identity, 'start', 'timeout', FINT_TIMEOUT])
    const { data } = await axios.post(FINT_API_URL, query)
    logger('info', ['vis', template, isATeacher ? 'samAccountName' : 'employeeNumber', identity, 'finish', 'data received', Array.isArray(data) ? data.length : 1])
    return getResponse(data)
  } catch (error) {
    logger('error', ['vis', template, isATeacher ? 'samAccountName' : 'employeeNumber', identity, error.response.data.message])
    if (/Cannot return null for non-nullable type: 'Personnavn' within parent 'Person'/.exec(error.response.data.message)) return getResponse({})
    else throw error
  }
}
