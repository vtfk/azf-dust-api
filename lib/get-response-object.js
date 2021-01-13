module.exports = (data, status = 200) => {
  return {
    status,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      data,
      count: data.length
    }
  }
}
