const padDate = num => {
  return num >= 10 ? num : `0${num}`
}

module.exports.prettifyDateToLocaleString = date => {
  if (date instanceof Date) {
    date = date.toLocaleString('no-NO', {
      timeZone: 'Europe/Oslo',
      hour12: false,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  date = date.replace(',', '')

  if (date.includes('/')) {
    const split = date.split('/')
    return `${split[1]}.${split[0]}.${split[2]}`
  } else return date
}

module.exports.azureADDate = (date = new Date()) => {
  return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`
}
