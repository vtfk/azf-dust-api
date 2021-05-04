const { hasData } = require('./helpers/system-data')

module.exports = data => data.filter(member => member && hasData(member.mailNickname))
