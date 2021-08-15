const axios = require('axios').default
const { logger } = require('@vtfk/logger')
const generateJwt = require('./auth/generate-jwt')
const { PIFU_API_URL, PIFU_JWT_SECRET } = require('../config')

const getData = async (url, teacher) => {
  const token = generateJwt(PIFU_JWT_SECRET, teacher)
  axios.defaults.headers.common.Authorization = `Bearer ${token}`
  const { data } = await axios.get(url)
  return data
}

const getTeacherContactClasses = async teacher => {
  try {
    logger('info', ['get-pifu-data', 'get-teacher-contact-classes', 'start'])
    const data = await getData(`${PIFU_API_URL}/teachers/${teacher}/contactclasses?kontaktlarergruppe=true`, teacher)
    logger('info', ['get-pifu-data', 'get-teacher-contact-classes', 'finish', 'received data', Array.isArray(data) ? data.length : 1])
    return data
  } catch (error) {
    const { status, statusText } = error.response
    logger('error', ['get-pifu-data', 'get-teacher-contact-classes', 'error', status, statusText])
    return []
  }
}

module.exports = { getTeacherContactClasses }
