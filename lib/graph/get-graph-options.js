const { GRAPH: { URL, URL_BETA, DEFAULT_USER_PROPERTIES } } = require('../../config')
const HTTPError = require('../http-error')

module.exports = (params, beta = false) => {
  const { userPrincipalName, subQuery, rootQuery, properties } = params

  if (userPrincipalName === undefined) {
    throw new HTTPError(400, 'Missing required parameter', {
      message: 'Missing required parameter',
      params: [
        'userPrincipalName'
      ]
    })
  }

  const options = {
    url: rootQuery === undefined ? `${beta ? URL_BETA : URL}/users/${userPrincipalName}` : beta ? URL_BETA : URL,
    params: {}
  }

  if (subQuery === undefined && rootQuery === undefined) {
    options.params.$select = properties !== undefined ? (Array.isArray(properties) ? properties.join(',') : properties) : DEFAULT_USER_PROPERTIES !== undefined ? (Array.isArray(DEFAULT_USER_PROPERTIES) ? DEFAULT_USER_PROPERTIES.join(',') : DEFAULT_USER_PROPERTIES) : undefined
  } else {
    options.url += `/${subQuery || rootQuery}`
  }

  return options
}
