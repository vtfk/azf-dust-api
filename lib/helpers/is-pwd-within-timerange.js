module.exports = (one, two, seconds = 15) => {
  // should be last set between 0 and given seconds
  if (one.toString() === 'Invalid Date' || two.toString() === 'Invalid Date') {
    return {
      result: false,
      seconds: -1
    }
  }

  // make sure given seconds isn't a negative number
  if (seconds < 0) seconds = -seconds

  const pwdLastDiff = (two - one) / 1000
  return {
    result: pwdLastDiff <= seconds && pwdLastDiff >= -seconds,
    seconds: pwdLastDiff
  }
}
