const { hasData } = require('./helpers/system-data')

module.exports = data => {
  const enrollmentsArray = data.filter(obj => hasData(obj.enrollments)).map(obj => obj.enrollments.map(enrollment => enrollment.sectionId))
  const enrollments = []
  enrollmentsArray.forEach(arr => enrollments.push(...arr))
  return enrollments
}
