module.exports = (results, user) => {
  const requiredProperties = [
    {
      source: 'UserPrincipalName',
      output: 'userPrincipalName'
    },
    {
      source: 'SamAccountName',
      output: 'samAccountName'
    },
    {
      source: 'givenName',
      output: 'givenName'
    },
    {
      source: 'sn',
      output: 'surName'
    },
    {
      source: 'employeeNumber',
      output: 'employeeNumber'
    }
  ]
  results.forEach(result => {
    requiredProperties.forEach(prop => {
      const { source, output } = prop
      if (!Object.getOwnPropertyNames(user).map(p => p.toLowerCase()).includes(source.toLowerCase()) && result.data && result.data[source]) {
        user[output] = result.data[source]
      }
    })
  })

  return user
}
