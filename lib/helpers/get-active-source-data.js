const { getActiveData: getActiveVismaData } = require('../../systems/visma/validator')
const { getActiveData: getActivePifuData } = require('../../systems/pifu/validator')

module.exports = (data, user) => {
  if (user.expectedType === 'employee') return getActiveVismaData(data, user)
  else return getActivePifuData(data, user)
}
