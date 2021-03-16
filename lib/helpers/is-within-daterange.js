const parseDate = (date) => {
  try {
    date = new Date(date)
    if (!(date instanceof Date) || isNaN(date)) return false
    return date
  } catch (error) {
    return false
  }
}

/**
 * Validerer at en dato er innenfor en start- og sluttdato.
 *
 * @param {string|Date} startDate Startdato. Dersom dette er tomt vil det sjekkes at datoen ikke har passert sluttdatoen.
 * @param {string|Date} endDate Sluttdato. Dersom denne er tom vil det sjekkes at startdatoen er passert.
 * @param {Date} [now] Datoen som skal sjekkes. Dersom denne ikke er angitt brukes nåværende dato
 * @returns {Boolean} `true` = datoen er innenfor dateoene | `false` = datoen er ikke innenfor datoene
 */
module.exports = (startDate, endDate, now) => {
  startDate = parseDate(startDate)
  endDate = parseDate(endDate)

  if (!now) now = new Date()
  if (!startDate && !endDate) return false

  // Ingen startdato - sjekk om sluttdato har passert
  if (!startDate) {
    if (now.getTime() < endDate.getTime()) return true
    return false
  }

  // Ingen sluttdato - sjekk om startdato er passert
  if (!endDate) {
    if (now.getTime() > startDate.getTime()) return true
    return false
  }

  // Sjekk om vi er innenfor start og sluttdatoen
  return now.getTime() > startDate.getTime() && now.getTime() < endDate.getTime()
}
