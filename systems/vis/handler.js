const { logger } = require('@vtfk/logger')
const getResponse = require('../../lib/get-response-object')
const { isStudent, isTeacher } = require('../../lib/helpers/is-type')
const getFintData = require('../../lib/get-fint-data')
const getPifuData = require('../../lib/get-pifu-data')
const HTTPError = require('../../lib/http-error')
const { SYSTEMS: { VIS: { FINT_BETA, FINT_TIMEOUT }, FEIDE: { PRINCIPAL_NAME } } } = require('../../config')

module.exports = async params => {
  const { employeeNumber, samAccountName, domain, title, feide = false } = params
  const isAStudent = isStudent({ domain, title })
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
  } else if (!isAStudent && !isATeacher) {
    logger('info', ['vis', 'no need to query FINT and PIFU for regular employees'])
    return {}
  }

  const template = isATeacher ? 'schoolEmployee' : 'student'
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

  let vis = {}
  let pifu = {}

  try {
    logger('info', ['vis', template, isATeacher ? 'samAccountName' : 'employeeNumber', identity, 'start'])
    vis = await getFintData(template, identity, query)
    logger('info', ['vis', template, isATeacher ? 'samAccountName' : 'employeeNumber', identity, 'finish', 'data received', Array.isArray(vis) ? vis.length : 1])
  } catch (error) {
    logger('error', ['vis', template, isATeacher ? 'samAccountName' : 'employeeNumber', identity, error.response.data.message])
    if (/Cannot return null for non-nullable type: 'Personnavn' within parent 'Person'/.exec(error.response.data.message)) return getResponse({})
    else throw error
  }

  try {
    const type = isATeacher ? 'teacher' : 'student'
    logger('info', ['pifu', 'samAccountName', type, samAccountName, 'start'])
    pifu = await getPifuData(samAccountName, type)
    logger('info', ['pifu', 'samAccountName', type, samAccountName, 'finish', 'data received', Array.isArray(pifu) ? pifu.length : 1])
    return getResponse({ ...vis, pifu })
  } catch (error) {
    logger('error', ['pifu', 'samAccountName', samAccountName, error.response.data.message])
    throw error
  }
}
