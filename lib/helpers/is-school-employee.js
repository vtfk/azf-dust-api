const { hasData } = require('./system-data')
const schools = require('../../systems/data/schools.json').map(school => school.toLowerCase())

module.exports = company => hasData(company) && schools.includes(company.toLowerCase())
