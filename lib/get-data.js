const axios = require('axios').default

const HTTPError = require('./http-error')

module.exports = async (method, url, body) => {
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
