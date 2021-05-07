const padDate = num => {
  return num >= 10 ? num : `0${num}`
}

module.exports.prettifyDateToLocaleString = date => {
  if (date instanceof Date) date = date.toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' })
  const split = date.replace(',', '').split(' ')
  return `${split[0].split('.').map(num => padDate(Number.parseInt(num))).join('.')} ${split[1]}`
}

module.exports.prettifyDate = date => {
  return `${padDate(date.getDate())}.${padDate(date.getMonth() + 1)}.${date.getFullYear()} ${padDate(date.getHours())}:${padDate(date.getMinutes())}:${padDate(date.getSeconds())}`
}

module.exports.azureADDate = (date = new Date()) => {
  return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`
}
