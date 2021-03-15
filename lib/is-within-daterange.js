const parseDate = (date) => {
  try {
    date = new Date(date)
    if (!(date instanceof Date) || isNaN(date)) return false
    return date
  } catch (error) {
    return false
  }
}

module.exports = (startDate, endDate) => {
  startDate = parseDate(startDate)
  endDate = parseDate(endDate)

  const now = new Date()
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
