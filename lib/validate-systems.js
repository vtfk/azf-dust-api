(() => {
  const { AD } = require('../systems')
  const sak = AD.validate({ enabled: true, lockedOut: false }, { expectedType: 'student' })
  console.log(JSON.stringify(sak, null, 2))
})()
