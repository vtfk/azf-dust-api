(() => {
  const { validate } = require('../systems').ad // ['ad']
  const sak = validate({ enabled: true, lockedOut: false }, { expectedType: 'student' })
  console.log(JSON.stringify(sak, null, 2))
})()
