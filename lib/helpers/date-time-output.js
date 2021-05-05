const padDate = num => {
  return num >= 10 ? num : `0${num}`
}

module.exports.prettifyDate = date => {
  return `${padDate(date.getDate())}.${padDate(date.getMonth() + 1)}.${date.getFullYear()} ${padDate(date.getHours())}:${padDate(date.getMinutes())}:${padDate(date.getSeconds())}`
}

module.exports.azureADDate = (date = new Date()) => {
  return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`
}
