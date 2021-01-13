module.exports = body => {
  return {
    // ad params
    samAccountName = undefined,
    employeeNumber = undefined, // also used for visma
    userPrincipalName = undefined,
    displayName = undefined,
    domain = undefined,
    properties = undefined,
    // visma params
    firstName = undefined,
    lastName = undefined
  } = body
}
