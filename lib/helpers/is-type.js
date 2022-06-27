const { hasData } = require('./system-data')

const _hasSkoleDomain = user => (hasData(user.domain) && user.domain === 'skole') || (hasData(user.onPremisesDistinguishedName) && user.onPremisesDistinguishedName.includes('DC=skole'))
const _hasTitle = user => hasData(user.title) || hasData(user.jobTitle)
const _isStudent = user => hasData(user) && _hasTitle(user) && _hasSkoleDomain(user)

/**
 * Checks if user is an Opplæring Lærling (title = 'Lærling')
 * @returns {boolean} Is an apprentice or not
 */
module.exports.isApprentice = user => _isStudent(user) && (user.title === 'Lærling' || user.jobTitle === 'Lærling')

/**
 * Checks if user is an employee (@vtfk.no)
 * @returns {boolean} Is an employee or not
 */
module.exports.isEmployee = user => hasData(user) && hasData(user.userPrincipalName) && user.userPrincipalName.includes('@vtfk.no')

/**
 * Checks if user is an Oppfølgingstjeneste Ungdom (title = 'Elev-OT')
 * @returns {boolean} Is an OT Ungdom or not
 */
module.exports.isOT = user => _isStudent(user) && (user.title === 'Elev-OT' || user.jobTitle === 'Elev-OT')

/**
 * Checks if user is a student (title = 'Elev')
 * @returns {boolean} Is a student or not
 */
module.exports.isStudent = user => _isStudent(user) && (user.title === 'Elev' || user.jobTitle === 'Elev')

/**
 * Checks if user is a teacher
 * @returns {boolean} Is a teacher or not
 */
module.exports.isTeacher = user => hasData(user) && hasData(user.feide) && !!user.feide
