const { GRAPH: { URL, DEFAULT_USER_PROPERTIES, DEFAULT_USER_EXPANDS } } = require('../../config')
const HTTPError = require('../http-error')

module.exports = params => {
  const { query, userPrincipalName, search, expand, filter, properties, orderBy } = params

  const options = {
    url: '',
    params: {}
  }

  if (query !== undefined) {
    options.url = `${URL}/${query.toLowerCase()}`

    if (userPrincipalName !== undefined) {
      options.url += `/${userPrincipalName}`
    } else if (query !== 'me') {
      options.params.$count = true
    }

    // TODO: Getting syntax error from Graph when ':' is present in $search
    if (search !== undefined && userPrincipalName === undefined) {
      options.params.$search = search
    }
    if (filter !== undefined && search !== undefined && userPrincipalName === undefined) {
      options.params.$filter = filter
    } else if (filter !== undefined && search === undefined && userPrincipalName === undefined) {
      throw new HTTPError(400, 'Missing required parameter', {
        message: 'Missing required parameter',
        params: [
          'search'
        ]
      })
    }
    if (orderBy !== undefined && userPrincipalName === undefined) {
      options.params.$orderBy = orderBy
    }
    if (properties !== undefined) {
      options.params.$select = Array.isArray(properties) ? properties.join(',') : properties
    } else if (properties === undefined && userPrincipalName !== undefined && DEFAULT_USER_PROPERTIES !== undefined) {
      options.params.$select = Array.isArray(DEFAULT_USER_PROPERTIES) ? DEFAULT_USER_PROPERTIES.join(',') : DEFAULT_USER_PROPERTIES
    }
    if (expand !== undefined) {
      options.params.$expand = Array.isArray(expand) ? expand.join(',') : expand
    } else if (expand === undefined && userPrincipalName !== undefined && DEFAULT_USER_EXPANDS !== undefined) {
      options.params.$expand = Array.isArray(DEFAULT_USER_EXPANDS) ? DEFAULT_USER_EXPANDS.join(',') : DEFAULT_USER_EXPANDS
    }

    return options
  }

  throw new HTTPError(400, 'Missing required parameter', {
    message: 'Missing required parameter',
    params: [
      'query'
    ]
  })
}
