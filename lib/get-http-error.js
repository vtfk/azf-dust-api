const getErrorMessage = error => (error.response && error.response.data && error.response.data.message) || error.message
const getStatusCode = error => (error.response && error.response.data && error.response.data.statusCode) || error.statusCode

module.exports = {
  getErrorMessage,
  getStatusCode
}
