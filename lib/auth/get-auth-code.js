module.exports = req => {
  const subscriptionKey = req.query['subscription-key'] || req.headers['Ocp-Apim-Subscription-Key']
  const functionKey = req.query.statusCode || req.query.code || req.headers['x-functions-key']
  const code = subscriptionKey || functionKey

  return {
    code,
    query: subscriptionKey ? `?subscription-key=${subscriptionKey}` : `?code=${functionKey}`
  }
}
