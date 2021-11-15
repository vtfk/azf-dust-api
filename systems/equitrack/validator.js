const { test, success, error, warn, noData, waitForData } = require('../../lib/test')
const { hasData } = require('../../lib/helpers/system-data')

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('equitrack-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    return dataPresent ? success('Har data') : error({ message: 'Bruker ikke funnet i dette systemet 😬', solution: 'Rettes i EquiTrack' })
  }),
  test('equitrack-02', 'Kontoen er ulåst', 'Sjekker at kontoen er ulåst', () => {
    if (!dataPresent) return noData()

    const data = {
      accountStatus: systemData.AccountStatus,
      previousAccountStatus: systemData.PreviousAccountStatus || undefined
    }

    return data.previousAccountStatus ? warn({ message: 'Bruker var låst i EquiTrack men er nå låst opp! 👌', raw: data }) : success({ message: 'Bruker er ulåst i EquiTrack', raw: data })
  }),
  test('equitrack-03', 'UserEmail er lik UPN', 'Sjekker at UserEmail er lik UserPrincipalName', () => {
    if (!dataPresent) return noData()
    if (!allData || !allData.ad) return waitForData()

    const data = {
      equiTrack: {
        userEmail: systemData.UserEmail
      },
      ad: {
        userPrincipalName: allData.ad.userPrincipalName
      }
    }

    return systemData.UserEmail === allData.ad.userPrincipalName ? success({ message: 'UserEmail er korrekt', raw: data }) : error({ message: 'UserEmail er ikke korrekt', raw: data, solution: 'Sak meldes til arbeidsgruppe print' })
  })
])
