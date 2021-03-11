module.exports = (results, user) => {
  const requiredProperties = [
    'userPrincipalName',
    'samAccountName',
    'givenName',
    'surName',
    'employeeNumber'
  ]

  results.forEach(result => {
    requiredProperties.forEach(prop => {
      if (!Object.getOwnPropertyNames(user).includes(prop) && result.data && result.data[prop]) {
        user[prop] = result.data[prop]
      }
    })
  })
  
  return user
}
