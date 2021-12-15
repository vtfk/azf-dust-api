const { hasData } = require('./system-data')

module.exports = user => hasData(user) && hasData(user.feide) && !!user.feide
