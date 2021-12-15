const { SYSTEMS } = require('../../config')
const { test, success, warn, error, noData } = require('../../lib/test')
const isWithinDaterange = require('../../lib/helpers/is-within-daterange')
const isValidFnr = require('../../lib/helpers/is-valid-fnr')
const { hasData, getArray, getArrayData } = require('../../lib/helpers/system-data')
const { prettifyDateToLocaleString } = require('../../lib/helpers/date-time-output')

const employeePositionActiveDaysAhead = 30

const getEmployment = hrm => {
  if (!hasData(hrm) || !hrm.employments || !hrm.employments.employment) return null
  const employment = getArray(hrm.employments.employment).find(employment => employment.company && employment.company.companyId === SYSTEMS.VISMA.COMPANY_ID)
  const dateDaysAhead = new Date(new Date().setDate(new Date().getDate() + employeePositionActiveDaysAhead))
  if (hasData(employment)) employment.active = isWithinDaterange(employment.startDate, employment.endDate) || isWithinDaterange(employment.startDate, employment.endDate, dateDaysAhead)

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
    return error({ message: 'Personen ble ikke funnet i HRM', raw: { hrm }, solution: 'Rettes i Visma HRM' })
  }

  return success({ message: 'Personen ble funnet i HRM', raw: { personIdHRM } })
}

const getActivePosition = (data, user) => {
  const hrm = getArrayData(data)
  const employment = hasData(hrm) && getEmployment(hrm)
  if (!employment) {
    return error({ message: 'Ingen ansettelsesforhold ble funnet i HRM', raw: { hrm } })
  }

  const positions = getPositions(employment)
  if (!positions && !employment.active) {
    return error({ message: 'Ingen stillinger ble funnet i HRM', raw: { employment, positions: (positions || null) } })
  } else if (!positions && employment.active) {
    if (new Date(employment.startDate) > new Date()) {
      return warn({ message: `Bruker begynner ikke før ${prettifyDateToLocaleString(new Date(employment.startDate))}`, raw: { employment, positions: (positions || null) }, solution: 'Vent til bruker har startet da vel' })
    } else {
      return error({ message: 'Bruker har ingen aktive stillinger', raw: { employment, positions: (positions || null) }, solution: 'Rettes i Visma HRM' })
    }
  }

  const primaryPositions = positions.filter(position => position['@isPrimaryPosition'] === 'true')
  const activePrimaryPositions = primaryPositions.map(position => position.active)
  const activePrimaryPosition = activePrimaryPositions.includes(true)

  const activePositions = positions.map(position => position.active)
  const activePosition = activePositions.includes(true)

  // Sjekk at det finnes et aktivt ansettelsesforhold og minst én aktiv stilling
  if (employment.active && activePrimaryPosition) {
    // Sjekk at primærstilling ikke er Sluttet
    const primaryPosition = primaryPositions[0]
    if (primaryPosition.positionInfo && primaryPosition.positionInfo.positionType && primaryPosition.positionInfo.positionType['@name'] && primaryPosition.positionInfo.positionType['@name'].toLowerCase() === 'sluttet') {
      return error({ message: 'Primærstilling er avsluttet 😱', raw: primaryPosition.positionInfo.positionType, solution: 'Rettes i Visma HRM' })
    } else return success({ message: 'Fant aktivt ansettelsesforhold og stilling i HRM', raw: { employment, positions } })
  }

  // Fant kun et ansettelsesforhold
  if (employment.active) {
    // Krøss i taket om dette noen gang skjer, men..
    if (!activePrimaryPosition && activePosition) {
      return error({ message: 'Fant et aktivt ansettelsesforhold i HRM, men ingen av de aktive stillingene er en hovedstilling', raw: { employment, positions }, solution: 'Rettes i Visma HRM' })
    }

    return error({ message: 'Fant et aktivt ansettelsesforhold i HRM, men ingen aktiv hovedstilling', raw: { employment, positions }, solution: 'Rettes i Visma HRM' })
  }

  // Fant kun aktiv(e) stilling(er)
  if (activePrimaryPosition) {
    return error({ message: `Fant ${activePrimaryPositions.length > 1 ? 'flere aktive hovedstillinger' : 'én aktiv hovedstilling'}, men ikke noe ansettelsesforhold`, raw: { employment, positions }, solution: 'Rettes i Visma HRM' })
  }

  // Verken aktive stillinger eller ansettelsesforhold ble funnet
  return error({ message: 'Det ble ikke funnet noe aktivt ansettelsesforhold eller stillinger i HRM', raw: { employment, positions }, solution: 'Rettes i Visma HRM' })
}

const getActivePositionCategory = (data, user) => {
  const hrm = getArrayData(data)
  const employment = hasData(hrm) && getEmployment(hrm)
  if (!employment) {
    return error({ message: 'Ingen ansettelsesforhold ble funnet i HRM', raw: { hrm }, solution: 'Rettes i Visma HRM' })
  }

  if (!employment.category || !employment.category['@id']) return error({ message: 'Ingen kategori ble funnet i HRM', raw: { employment }, solution: 'Rettes i Visma HRM' })
  const category = employment.category['@id'].toUpperCase()
  const description = employment.category.description || ''
  const excludedCategories = SYSTEMS.VISMA.CATEGORIES.split(',').filter(cat => !!cat).map(cat => cat.toUpperCase())

  if (excludedCategories.includes(category)) {
    return warn({ message: `Kategorien på ansettelsesforholdet (${category}) er ekskludert, som tilsier at det ikke skal opprettes noen brukerkonto`, raw: { category, description }, solution: 'Rettes i Visma HRM' })
  }

  return success({ message: `Kategorien på ansettelsesforholdet (${category}) er ikke ekskludert, som tilsier at det skal opprettes brukerkonto`, raw: { category, description } })
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
    if (user.expectedType === 'student') dataPresent = false

    if (dataPresent) return user.expectedType === 'employee' ? success('Har data') : warn('Har data til tross for at dette er en elev')
    else return user.expectedType === 'employee' ? error({ message: 'Mangler data 😬', solution: 'Rettes i Visma HRM' }) : success('Bruker har ikke data i dette systemet. Elever registreres i Visma InSchool')
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
      if (user.expectedType === 'student') return success({ message: 'Ingen person ble funnet i HRM', raw: { hrm } })
      return warn({ message: 'Ingen person ble funnet i HRM', raw: { hrm } })
    }

    const validationResult = isValidFnr(hrm.ssn)
    if (!validationResult.valid) return error({ message: validationResult.error, raw: { hrm: { ssn: hrm.ssn }, validationResult } })

    if (validationResult.type !== 'Fødselsnummer') return warn({ message: `Fødselsnummeret som er registrert er et ${validationResult.type}. Dette kan skape problemer i enkelte systemer`, raw: { hrm: { ssn: hrm.ssn }, validationResult } })
    return success({ message: 'Fødselsnummeret registrert i HRM er gyldig', raw: { hrm: { ssn: hrm.ssn }, validationResult } })
  }),
  test('visma-06', 'Har organisasjonstilknytning', 'Sjekker at bruker har en organisasjonstilknytning', () => {
    if (!dataPresent) return noData()

    const { raw: { positions } } = getActivePosition(systemData, user)
    if (positions === null || positions === undefined) return noData()

    const missingOrg = positions.filter(position => !position.chart)
    return hasData(missingOrg) ? error({ message: 'Mangler organisasjonstilknytning. Må rettes i Visma HRM', raw: missingOrg, solution: 'Rettes i Visma HRM' }) : success({ message: 'Har organisasjonstilknytning', raw: positions })
  }),
  test('visma-07', 'Har mobilePhone satt', 'Sjekker at bruker har satt mobilePhone i Visma HRM', () => {
    if (!dataPresent) return noData()
    return hasData(systemData.contactInfo.mobilePhone) ? success('Bruker har fylt ut ☎️ på MinSide') : warn({ message: 'Bruker har ikke fylt ut ☎️ på MinSide og vil ikke kunne motta informasjon på SMS', solution: 'Bruker må selv sette telefonnummer på MinSide i HRM' })
  }),
  test('visma-08', 'Navn har ropebokstaver', 'Sjekker om navnet er skrevet med ropebokstaver', () => {
    if (!dataPresent) return noData()

    const data = {
      givenName: systemData.givenName,
      familyName: systemData.familyName
    }
    return (systemData.givenName === systemData.givenName.toUpperCase() || systemData.familyName === systemData.familyName.toUpperCase()) ? warn({ message: 'NAVN ER SKREVET MED ROPEBOKSTAVER 📣', raw: data, solution: 'RETTES I VISMA HRM' }) : noData()
  })
])

module.exports.getActiveData = getActiveData
