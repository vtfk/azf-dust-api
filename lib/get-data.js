const axios = require('axios').default

const HTTPError = require('./http-error')
const generateJwt = require('./generate-jwt')

const { DUST_JWT_SECRET } = require('../config')

module.exports = async (caller, method, url, body) => {
  const token = generateJwt(DUST_JWT_SECRET, caller)
  axios.defaults.headers.common.Authorization = `Bearer ${token}`

  return await axios({
    method,
    url,
    data: body || undefined,
    responseType: "json"
  })
  .then(data => {
    return data.data
  })
  .catch(error => {
    return new HTTPError(418, 'Failed to fetch data', error)
  })
}
