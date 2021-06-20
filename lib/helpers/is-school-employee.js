const { hasData } = require('./system-data')
const { SYSTEMS: { AD: { SCHOOL_EMPLOYEE_PROPERTY_NAME, SCHOOL_EMPLOYEE_PROPERTY_VALUE } } } = require('../../config')

module.exports = user => hasData(user) && hasData(user[SCHOOL_EMPLOYEE_PROPERTY_NAME]) && user[SCHOOL_EMPLOYEE_PROPERTY_NAME] === SCHOOL_EMPLOYEE_PROPERTY_VALUE
