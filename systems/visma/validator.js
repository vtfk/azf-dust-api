const { SYSTEMS } = require('../../config')
const { test, success, warn, error, waitForData, noData } = require('../../lib/test')
const isWithinDaterange = require('../../lib/helpers/is-within-daterange')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const { hasData, getArray, getArrayData } = require('../../lib/helpers/system-data')

const getEmployment = hrm => {
  if (!hasData(hrm) || !hrm.employments || !hrm.employments.employment) return null
  const employment = getArray(hrm.employments.employment).find(employment => employment.company && employment.company.companyId === SYSTEMS.VISMA.COMPANY_ID)
  if (hasData(employment)) employment.active = isWithinDaterange(employment.startDate, employment.endDate)

  return employment
}

const getPositions = employment => {
  if (!hasData(employment) || !employment.positions || !employment.positions.position) return null
  return getArray(employment.positions.position).map(position => ({
    ...position,
    active: isWithinDaterange(position.positionStartDate, position.positionEndDate)
  }))
}

const getPerson = (data, user) => {
  const hrm = getArrayData(data)
  const personIdHRM = hasData(hrm) && hrm['@personIdHRM']
  if (!personIdHRM) {
    if (user.expectedType === 'student') return success('Personen ble ikke funnet i HRM, men siden dette er en elev er det helt normalt', { hrm })
    return error('Personen ble ikke funnet i HRM', { hrm })
  }

  if (user.expectedType === 'student') return warn('Personen ble funnet i HRM', { personIdHRM })
  return success('Personen ble funnet i HRM', { personIdHRM })
}

const getActivePosition = (data, user) => {
  const hrm = getArrayData(data)
  const employment = hasData(hrm) && getEmployment(hrm)
  if (!employment) {
    if (user.expectedType === 'student') return success('Ingen ansettelsesforhold ble funnet i HRM, og siden dette er en elev er det helt normalt', { hrm })
    return error('Ingen ansettelsesforhold ble funnet i HRM', { hrm })
  }

  const positions = getPositions(employment)
  if (!positions) {
    if (user.expectedType === 'student') return warn('Ansettelsesforhold ble funnet i HRM, men ingen aktive stillinger ble funnet', { employment, positions: (positions || null) })
    return error('Ingen stillinger ble funnet i HRM', { employment, positions: (positions || null) })
  }

  const primaryPositions = positions.filter(position => position['@isPrimaryPosition'] === 'true')
  const activePrimaryPositions = primaryPositions.map(position => position.active)
  const activePrimaryPosition = activePrimaryPositions.includes(true)

  const activePositions = positions.map(position => position.active)
  const activePosition = activePositions.includes(true)

  // Sjekk at det finnes et aktivt ansettelsesforhold og minst én aktiv stilling
  if (employment.active && activePrimaryPosition) {
    if (user.expectedType === 'student') return warn('Fant aktivt ansettelsesforhold og stilling i HRM', { employment, positions })
    return success('Fant aktivt ansettelsesforhold og stilling i HRM', { employment, positions })
  }

  // Fant kun et ansettelsesforhold
  if (employment.active) {
    // Krøss i taket om dette noen gang skjer, men..
    if (!activePrimaryPosition && activePosition) {
      if (user.expectedType === 'student') return warn('Fant et aktivt ansettelsesforhold i HRM, men ingen av de aktive stillingene er en hovedstilling', { employment, positions })
      return error('Fant et aktivt ansettelsesforhold i HRM, men ingen av de aktive stillingene er en hovedstilling', { employment, positions })
    }

    if (user.expectedType === 'student') return warn('Fant et aktivt ansettelsesforhold i HRM, men ingen aktiv hovedstilling', { employment, positions })
    return error('Fant et aktivt ansettelsesforhold i HRM, men ingen aktiv hovedstilling', { employment, positions })
  }

  // Fant kun aktiv(e) stilling(er)
  if (activePrimaryPosition) {
    const message = `Fant ${activePrimaryPositions.length > 1 ? 'flere aktive hovedstillinger' : 'én aktiv hovedstilling'}, men ikke noe ansettelsesforhold`
    if (user.expectedType === 'student') return warn(message, { employment, positions })
    return error(message, { employment, positions })
  }

  // Verken aktive stillinger eller ansettelsesforhold ble funnet
  if (user.expectedType === 'student') return success('Det ble ikke funnet noe aktivt ansettelsesforhold i HRM', { employment, positions })
  return error('Det ble ikke funnet noe aktivt ansettelsesforhold eller stillinger i HRM', { employment, positions })
}

const getActivePositionCategory = (data, user) => {
  const hrm = getArrayData(data)
  const employment = hasData(hrm) && getEmployment(hrm)
  if (!employment) {
    if (user.expectedType === 'student') return success('Ingen ansettelsesforhold ble funnet i HRM, men siden dette er en elev er det helt normalt', { hrm })
    return error('Ingen ansettelsesforhold ble funnet i HRM', { hrm })
  }

  if (!employment.category || !employment.category['@id']) return error('Ingen kategori ble funnet i HRM', { employment })
  const category = employment.category['@id'].toUpperCase()
  const description = employment.category.description || ''
  const excludedCategories = SYSTEMS.VISMA.CATEGORIES.split(',').filter(cat => !!cat).map(cat => cat.toUpperCase())

  if (excludedCategories.includes(category)) {
    const message = `Kategorien på ansettelsesforholdet (${category}) er ekskludert, som tilsier at det ikke skal opprettes noen brukerkonto`
    if (user.expectedType === 'student') return success(message, { category, description })
    return warn(message, { category, description })
  }

  const message = `Kategorien på ansettelsesforholdet (${category}) er ikke ekskludert, som tilsier at det skal opprettes brukerkonto`
  if (user.expectedType === 'student') return warn(message, { category, description })
  return success(message, { category, description })
}

const getActiveData = (data, user) => {
  const personHrm = getPerson(data, user)
  const activePosition = getActivePosition(data, user)
  const activePositionCategory = getActivePositionCategory(data, user)
  return {
    person: {
      message: personHrm.message,
      raw: personHrm.raw
    },
    activePosition: {
      message: activePosition.message,
      raw: activePosition.raw
    },
    activePositionCategory: {
      message: activePositionCategory.message,
      raw: activePositionCategory.raw
    }
  }
}

let dataPresent = true

module.exports = (systemData, user, allData = false) => ([
  test('visma-01', 'Har data', 'Sjekker at det finnes data her', () => {
    dataPresent = hasData(systemData)
    if (dataPresent) return user.expectedType === 'employee' ? success('Har data') : warn('Har data til tross for at dette er en elev')
    else return user.expectedType === 'employee' ? error('Mangler data 😬') : success('Bruker har ikke data i dette systemet')
  }),
  test('visma-02', 'Personen finnes', 'Sjekker at det ble funnet en person i HRM', () => {
    if (!dataPresent) return noData()
    return getPerson(systemData, user)
  }),
  test('visma-03', 'Aktiv stilling', 'Kontrollerer at personen har en aktiv stilling', () => {
    if (!dataPresent) return noData()
    return getActivePosition(systemData, user)
  }),
  test('visma-04', 'Ansettelsesforholdet har korrekt kategori', 'Kontrollerer at ansettelsesforholdet ikke har en kategori som er unntatt fra å få brukerkonto', () => {
    if (!dataPresent) return noData()
    return getActivePositionCategory(systemData, user)
  }),
  test('visma-05', 'Fødselsnummeret er gyldig', 'Sjekker at fødselsnummeret som er registrert er gyldig', () => {
    if (!dataPresent) return noData()
    const hrm = getArrayData(systemData)
    if (!hasData(hrm) || !hrm.ssn) {
      if (user.expectedType === 'student') return success('Ingen person ble funnet i HRM', { hrm })
      return warn('Ingen person ble funnet i HRM', { hrm })
    }

    const validationResult = isValidFnr(hrm.ssn)
    if (!validationResult.valid) return error(validationResult.error, { hrm: { ssn: hrm.ssn }, validationResult })

    if (validationResult.type !== 'Fødselsnummer') return warn(`Fødselsnummeret som er registrert er et ${validationResult.type}. Dette kan skape problemer i enkelte systemer`, { hrm: { ssn: hrm.ssn }, validationResult })
    return success('Fødselsnummeret registrert i HRM er gyldig', { hrm: { ssn: hrm.ssn }, validationResult })
  }),
  test('visma-06', 'E-postadressen er riktig', 'Sjekker at registrert e-post er lik som i AD', () => {
    if (!dataPresent) return noData()
    if (!allData || !allData.ad) return waitForData()
    if (!allData.ad.mail) return warn('Mail mangler i dataene fra AD', { ad: allData.ad ? { mail: allData.ad.mail || null } : null })

    const hrm = getArrayData(systemData)
    if (!hasData(hrm) || !hrm.contactInfo || !hrm.contactInfo.email) {
      if (user.expectedType === 'student' && !hrm) return success('Ingen profil eller e-postadresse funnet i HRM, men siden dette er en elev er det helt normalt', { hrm })
      return warn('Ingen e-postadresse registrert i HRM', { hrm })
    }

    if (allData.ad.mail.toLowerCase() === hrm.contactInfo.email.toLowerCase()) {
      return success('E-postadressen i AD og HRM er like', { ad: allData.ad.mail, hrm: hrm.contactInfo.email })
    }
    return error('E-postadressen i AD og HRM er ulike', { ad: allData.ad.mail, hrm: hrm.contactInfo.email })
  }),
  test('visma-07', 'Brukernavn er likt brukernavnet i AD', 'Sjekker at brukernavnet i HRM er likt samAccountName i lokalt AD', () => {
    if (!dataPresent) return noData()
    if (!allData || !allData.ad) return waitForData()
    if (!allData.ad.samAccountName) return warn('samAccountName mangler i dataene fra AD', { ad: allData.ad ? { samAccountName: allData.ad.samAccountName || null } : null })

    const hrm = getArrayData(systemData)
    if (!hasData(hrm) || !hrm.authentication || !hrm.authentication.alias) {
      if (user.expectedType === 'student' && !hrm) return success('Ingen profil ble funnet i HRM', { hrm })
      return warn('Brukernavnet er ikke registrert i HRM slik det skal', { hrm })
    }

    if (Array.isArray(hrm.authentication.alias)) {
      const aliases = hrm.authentication.alias.map(alias => ({ name: alias, result: allData.ad.samAccountName.toLowerCase() === alias.toLowerCase() }))
      const aliasesNotEqual = aliases.filter(alias => !alias.result)
      const aliasesEqual = aliases.filter(alias => alias.result)
      if (aliasesEqual.length > 0 && aliasesNotEqual.length === 0) return success('Brukernavnene i AD og HRM er like', { ad: allData.ad.samAccountName, hrm: aliases })
      else if (aliasesEqual.length > 0 && aliasesNotEqual.length > 0) return warn('Noen brukernavn i HRM er like i AD', { ad: allData.ad.samAccountName, hrm: aliases })
    } else {
      if (allData.ad.samAccountName.toLowerCase() === hrm.authentication.alias.toLowerCase()) {
        return success('Brukernavnene i AD og HRM er like', { ad: allData.ad.samAccountName, hrm: hrm.authentication.alias })
      }
    }
    return error('Brukernavnene i AD og HRM er ulike', { ad: allData.ad.samAccountName, hrm: hrm.authentication.alias })
  }),
  test('visma-08', 'Har organisasjonstilknytning', 'Sjekker at bruker har en organisasjonstilknytning', () => {
    if (!dataPresent) return noData()

    const { raw: { positions } } = getActivePosition(systemData, user)
    if (positions === null || positions === undefined) return noData()

    const missingOrg = positions.filter(position => !position.chart)
    return hasData(missingOrg) ? error('Mangler organisasjonstilknytning. Må rettes i Visma', missingOrg) : success('Har organisasjonstilknytning', positions)
  }),
  test('visma-09', 'Har mobilePhone satt', 'Sjekker at bruker har satt mobilePhone i Visma', () => {
    if (!dataPresent) return noData()
    return hasData(systemData.contactInfo.mobilePhone) ? success('Bruker har fylt ut ☎️ på MinSide') : warn('Bruker har ikke fylt ut ☎️ på MinSide og vil ikke kunne motta informasjon på SMS')
  })
])

module.exports.getActiveData = getActiveData
