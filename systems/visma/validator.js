const { SYSTEMS } = require('../../config')
const isWithinDaterange = require('../../lib/is-within-daterange')
const { test, success, warn, error, noData } = require('../../lib/test')

const getArray = obj => (Array.isArray(obj) ? obj : [obj]).filter(obj => !!obj)

module.exports = (systemData, user, allData = false) => ([
  test('visma-01', 'Personen finnes', 'Sjekker at det ble funnet en person i HRM', () => {
    if (systemData && systemData['@personIdHRM']) {
      if (user.expectedType === 'student') return warn('Personen ble funnet i HRM', { personIdHRM: systemData['@personIdHRM'] })
      return success('Personen ble funnet i HRM', { personIdHRM: systemData['@personIdHRM'] })
    }
    if (user.expectedType === 'student') return success('Personen ble ikke funnet i HRM, men siden dette er en elev er det helt normalt')
    return error('Personen ble ikke funnet i HRM')
  }),
  test('visma-03', 'Aktiv stilling', 'Kontrollerer at personen har en aktiv stilling', () => {
    // Hent ut ansettelsesforholdet i fylkeskommunen
    const employment = getArray(systemData.employments.employment).find(employment => employment.company.companyId === SYSTEMS.VISMA.COMPANY_ID)
    if (!employment) {
      if (user.expectedType === 'student') return warn('Ingen ansettelsesforhold ble funnet i HRM', { employments: (systemData.employments || null) })
      return error('Ingen ansettelsesforhold ble funnet i HRM', { employments: (systemData.employments || null) })
    }

    employment.active = isWithinDaterange(employment.startDate, employment.endDate)

    // Hent stillinger og sjekk om de er aktive
    const positions = getArray(employment.positions && employment.positions.position).map(position => {
      console.log('position', position)
      return {
        ...position,
        active: isWithinDaterange(position.positionStartDate, position.positionEndDate)
      }
    })

    if (!positions) {
      if (user.expectedType === 'student') return warn('Ingen stillinger ble funnet i HRM', { employment, positions: (positions || null) })
      return error('Ingen stillinger ble funnet i HRM', { employment, positions: (positions || null) })
    }

    const activePositions = positions.map(position => position.active)
    const activePosition = activePositions.includes(true)

    // Sjekk at det finnes et aktivt ansettelsesforhold og minst én aktiv stilling
    if (employment.active && activePosition) {
      if (user.expectedType === 'student') return warn('Fant aktivt ansettelsesforhold og stilling i HRM', { employment, positions })
      return success('Fant aktivt ansettelsesforhold og stilling i HRM', { employment, positions })
    }

    // Fant kun et ansettelsesforhold
    if (employment.active) {
      if (user.expectedType === 'student') return warn('Fant et aktivt ansettelsesforhold i HRM, men ingen aktiv stilling', { employment, positions })
      return error('Fant et aktivt ansettelsesforhold i HRM, men ingen aktiv stilling', { employment, positions })
    }

    // Fant kun aktiv(e) stilling(er)
    if (activePosition) {
      const message = `Fant ${activePositions.length > 1 ? 'flere aktive stillinger' : 'en aktiv stilling'}, men ikke noe ansettelsesforhold`
      if (user.expectedType === 'student') return warn(message, { employment, positions })
      return error(message, { employment, positions })
    }

    // Verken aktive stillinger eller ansettelsesforhold ble funnet
    if (user.expectedType === 'student') return success('Det ble ikke funnet noe aktivt ansettelsesforhold i HRM', { employment, positions })
    return error('Det ble ikke funnet noe aktivt ansettelsesforhold eller stillinger i HRM', { employment, positions })
  }),
  test('visma-03', 'Hovedstilling har korrekt kategori', 'Kontrollerer at hovedstillingen ikke har en kategori som er unntatt fra å få brukerkonto', () => {
    const employment = getArray(systemData.employments.employment).find(employment => employment.company.companyId === SYSTEMS.VISMA.COMPANY_ID)
    if (!employment) {
      if (user.expectedType === 'student') return warn('Ingen ansettelsesforhold ble funnet i HRM', { employments: (systemData.employments || null) })
      return error('Ingen ansettelsesforhold ble funnet i HRM', { employments: (systemData.employments || null) })
    }

    if (!employment.category || !employment.category['@id']) return error('Ingen kategori ble funnet i HRM', { employment })
    const category = employment.category['@id'].toUpperCase()
    const description = employment.category.description || ''
    const excludedCategories = SYSTEMS.VISMA.CATEGORIES.split(',').filter(cat => !!cat).map(cat => cat.toUpperCase())

    if (excludedCategories.includes(category)) {
      const message = `Kategorien på ansettelsesforholdet (${category}) er ekskludert, som tilsier at det ikke skal opprettes noen brukerkonto`
      if (user.expectedType === 'student') return success(message, { category, description })
      return error(message, { category, description })
    }

    const message = `Kategorien på ansettelsesforholdet (${category}) er ikke ekskludert, som tilsier at det skal opprettes brukerkonto`
    if (user.expectedType === 'student') return warn(message, { category, description })
    return success(message, { category, description })
  }),
  test('ad-03', 'E-postadressen er riktig', 'Sjekker at registrert e-post er lik som i AD', () => {
    if (!allData || !allData.ad) return noData('Venter på data...')
    if (!allData.ad.mail) return warn('Mail mangler i dataene fra AD', { ad: allData.ad ? { mail: allData.ad.mail || null } : null })
    if (!systemData || !systemData.contactInfo || !systemData.contactInfo.email) {
      if (user.expectedType === 'student' && !systemData) return success('Ingen profil eller e-postadresse funnet i HRM', { systemData })
      return warn('Ingen e-postadresse registrert i HRM', systemData)
    }

    if (allData.ad.mail.toLowerCase() === systemData.contactInfo.email.toLowerCase()) {
      return success('E-postadressen i AD og HRM er like', { ad: allData.ad.mail, hrm: systemData.contactInfo.email })
    } else {
      return error('E-postadressen i AD og HRM er ulike', { ad: allData.ad.mail, hrm: systemData.contactInfo.email })
    }
  }),
  test('ad-04', 'Brukernavn er likt brukernavnet i AD', 'Sjekker at brukernavnet i HRM er likt samAccountName i lokalt AD', () => {
    if (!allData || !allData.ad) return noData('Venter på data...')
    if (!allData.ad.samAccountName) return warn('samAccountName mangler i dataene fra AD', { ad: allData.ad ? { samAccountName: allData.ad.samAccountName || null } : null })
    if (!systemData || !systemData.authentication || !systemData.authentication.alias) {
      if (user.expectedType === 'student' && !systemData) return success('Ingen profil ble funnet i HRM', { systemData })
      return warn('Brukernavnet er ikke registrert i HRM slik det skal', { systemData })
    }

    if (allData.ad.samAccountName.toLowerCase() === systemData.authentication.alias.toLowerCase()) {
      return success('Brukernavnene i AD og HRM er like', { ad: allData.ad.samAccountName, hrm: systemData.authentication.alias })
    } else {
      return error('Brukernavnene i AD og HRM er ulike', { ad: allData.ad.samAccountName, hrm: systemData.authentication.alias })
    }
  })
])
