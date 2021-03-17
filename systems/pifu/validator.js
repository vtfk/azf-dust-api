const { test, success, error } = require('../../lib/test')

module.exports = (systemData, user, allData = false) => ([
  test('pifu-01', 'Har et person-objekt', 'Sjekker at det finnes et person-objekt', () => {
    if (!systemData.person) return error('Person-objekt mangler 🤭', systemData)
    const data = {
      enabled: systemData.enabled
    }
    if (systemData.enabled) return success('Kontoen er aktivert', data)
    return error('Kontoen er deaktivert', data)
  })
])

// hvis det er flere person-objekter i PIFU-filen bør dette være en warning da det er kun første person-objektet som brukes (dette skal ikke skje, og om det har skjedd vil det ikke komme tilbake fra backend)
