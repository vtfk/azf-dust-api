const TENANT_ID = process.env.TENANT_ID || '08f3813c-9f29-482f-9aec-16ef7cbf477a'
const CLIENT_ID = process.env.CLIENT_ID

module.exports = {
  TOKEN_AUTH: {
    jwksUri: process.env.TOKEN_AUTH_JWK_URI || `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
    issuer: process.env.TOKEN_AUTH_ISS || undefined,
    audience: process.env.TOKEN_AUTH_AUD || CLIENT_ID || undefined // Application Client ID
  },
  SCRIPT_SERVICE_URL: process.env.SCRIPT_SERVICE_URL || 'http://localhost:3000',
  PIFU_API_URL: process.env.PIFU_API_URL || 'https://pifu.api.no',
  PIFU_API_JWT: process.env.PIFU_API_JWT || 'Super secret jwt secret'
}
