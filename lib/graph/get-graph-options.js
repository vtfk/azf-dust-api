const { GRAPH: { URL, DEFAULT_USER_PROPERTIES } } = require('../../config')
const HTTPError = require('../http-error')

module.exports = params => {
  const { userPrincipalName, subQuery, properties } = params

  if (userPrincipalName === undefined) {
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameter',
      params: [
        'userPrincipalName'
      ]
    })
  }

  const options = {
    url: `${URL}/${userPrincipalName}`,
    params: {}
  }

  if (subQuery === undefined) {
    options.params.$select = properties !== undefined ? (Array.isArray(properties) ? properties.join(',') : properties) : DEFAULT_USER_PROPERTIES !== undefined ? (Array.isArray(DEFAULT_USER_PROPERTIES) ? DEFAULT_USER_PROPERTIES.join(',') : DEFAULT_USER_PROPERTIES) : undefined
  } else {
    options.url += `/${subQuery}`
  }

  return options
}
