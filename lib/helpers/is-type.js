const { hasData } = require('./system-data')

/**
 * Checks if user is an Apprentice (@larling.vtfk.no)
 * @returns {boolean} Is an apprentice or not
 */
module.exports.isApprentice = user => hasData(user) && hasData(user.userPrincipalName) && user.userPrincipalName.includes('@larling.vtfk.no')

/**
 * Checks if user is an employee (@vtfk.no)
 * @returns {boolean} Is an employee or not
 */
module.exports.isEmployee = user => hasData(user) && hasData(user.userPrincipalName) && user.userPrincipalName.includes('@vtfk.no')

/**
 * Checks if user is an Oppfølgingstjeneste Ungdom (@ot.vtfk.no)
 * @returns {boolean} Is an OT Ungdom or not
 */
module.exports.isOT = user => hasData(user) && hasData(user.userPrincipalName) && user.userPrincipalName.includes('@ot.vtfk.no')

/**
 * Checks if user is a student (@skole.vtfk.no)
 * @returns {boolean} Is a student or not
 */
module.exports.isStudent = user => hasData(user) && hasData(user.userPrincipalName) && user.userPrincipalName.includes('@skole.vtfk.no')

/**
 * Checks if user is a teacher
 * @returns {boolean} Is a teacher or not
 */
module.exports.isTeacher = user => hasData(user) && hasData(user.feide) && !!user.feide
