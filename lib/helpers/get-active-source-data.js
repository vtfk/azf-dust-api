const { getActiveData: getVismaData } = require('../../systems/visma/validator')
const { getActiveData: getViSData } = require('../../systems/vis/validator')

module.exports = (data, user) => {
  if (user.expectedType === 'employee') {
    const visma = getVismaData(data, user)
    return {
      person: visma.person.message,
      activePosition: visma.activePosition.message,
      activePositionCategory: {
        message: visma.activePositionCategory.message,
        description: visma.activePositionCategory.raw.description
      },
      active: visma.activePosition.raw.employment.active
    }
  } else return getViSData(data)
}
