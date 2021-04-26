const { hasData } = require('./system-data')
const schools = require('../../systems/data/schools.json')
const teacherTitles = require('../../systems/data/teacher-titles.json')

module.exports = (company = null, title = null) => hasData(company) && hasData(title) && schools.includes(company) && teacherTitles.includes(title.toLowerCase())
