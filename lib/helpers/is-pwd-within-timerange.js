module.exports = (one, two, seconds = 15) => {
  // should be last set between 0 and given seconds
  const pwdLastDiff = (two - one) / 1000
  return {
    result: (pwdLastDiff >= 0 && pwdLastDiff <= seconds),
    seconds: pwdLastDiff
  }
}
