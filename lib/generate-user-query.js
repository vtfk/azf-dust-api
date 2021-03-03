module.exports = (system, user) => {
  system = system.toLowerCase()
  const propPriority = []
  const query = {}
  let queryFinished = false

  if (system === 'ad') {
    propPriority.push('userPrincipalName','samAccountName','employeeNumber','displayName')
    if (user.domain) query.domain = user.domain
    else throw new Error("Missing required user property 'domain'")
  }
  else if (system === 'visma') propPriority.push('employeeNumber',['givenName','surName'])
  else if (system === 'feide') propPriority.push('samAccountName')
  else if (system === 'sds') {
    propPriority.push('userPrincipalName','samAccountName')
    if (user.domain) query.type = user.domain === 'login' ? 'Teacher' : 'Student'
    else throw new Error("Missing required user property 'domain' to identify 'type'")
  }
  else if (system === 'pifu') propPriority.push('employeeNumber')
  else if (system === 'aad') propPriority.push('userPrincipalName')

  if (propPriority.length === 0) throw new Error(`System '${system}' not found`)

  propPriority.forEach(prop => {
    if (queryFinished) return

    if (Array.isArray(prop)) {
      if (prop.filter(p => user[p] !== null && user[p] !== undefined).length !== prop.length) return

      prop.forEach(p => {
        query[p] = user[p]
      })
      queryFinished = true
      return
    }

    if (user[prop] === null || user[prop] === undefined) return

    query[prop] = user[prop]
    queryFinished = true
  })

  if (Object.getOwnPropertyNames(query).filter(prop => !['domain','type'].includes(prop)).length === 0) throw new Error(`Missing property to identify user: ${JSON.stringify(query, null, 2)}`)

  return query
}
