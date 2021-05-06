const { getActiveData: getActiveVismaData } = require('../../systems/visma/validator')
const { getActiveData: getActivePifuData } = require('../../systems/pifu/validator')

module.exports = (data, user) => {
  if (user.expectedType === 'employee') {
    const visma = getActiveVismaData(data, user)
    return {
      person: visma.person.message,
      activePosition: visma.activePosition.message,
      activePositionCategory: {
        message: visma.activePositionCategory.message,
        description: visma.activePositionCategory.raw.description
      },
      active: visma.activePosition.raw.employment.active
    }
  } else {
    const pifu = getActivePifuData(data, user)
    return {
      message: pifu.person.message,
      active: pifu.person.message === 'Har et person-objekt'
    }
  }
}
