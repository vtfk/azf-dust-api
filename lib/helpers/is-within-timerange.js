/**
 * Validerer at angitte tidspunkt maks differensierer angitte seconds
 * @param {Date} one Starttidspunkt. Dersom dette ikke er en gyldig Date returneres false
 * @param {Date} two Sluttidspunkt. Dersom dette ikke er en gyldig Date returneres false
 * @param {Number} seconds Antall sekunder tidspunktene kan differensiere. Dersom ikke angitt brukes 15 sekunder som default
 * @returns {object} `seconds` = antall sekunder tidspunktene differensierer. `result` = true dersom `seconds` er mindre eller lik angitt seconds | false dersom `seconds` er større enn angitt seconds
 */
module.exports = (one, two, seconds = 15) => {
  if (one.toString() === 'Invalid Date' || two.toString() === 'Invalid Date') {
    return {
      result: false,
      seconds: -1
    }
  }

  // make sure given seconds isn't a negative number
  if (seconds < 0) seconds = -seconds

  const diff = (two - one) / 1000
  return {
    result: diff <= seconds && diff >= -seconds,
    seconds: diff
  }
}
