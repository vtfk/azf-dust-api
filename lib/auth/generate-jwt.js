const jwt = require('jsonwebtoken')
const pkg = require('../../package.json')

module.exports = (secret, caller) => {
  const payload = {
    system: pkg.name,
    version: pkg.version,
    caller
  }

  const options = {
    expiresIn: '1m',
    issuer: 'https://auth.vtfk.no'
  }

  const token = jwt.sign(payload, secret, options)
  return token
}
