const TENANT_ID = process.env.TENANT_ID || '08f3813c-9f29-482f-9aec-16ef7cbf477a'
const CLIENT_ID = process.env.CLIENT_ID

module.exports = {
  TOKEN_AUTH: {
    jwksUri: process.env.TOKEN_AUTH_JWK_URI || `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
    issuer: process.env.TOKEN_AUTH_ISS || undefined,
    audience: process.env.TOKEN_AUTH_AUD || CLIENT_ID || undefined // Application Client ID
  },
  GRAPH: {
    AUTH: {
      URL: process.env.GRAPH_AUTH_URL || 'https://login.microsoftonline.com/vtfk.onmicrosoft.com/oauth2/v2.0/token',
      CLIENT_ID: process.env.CLIENT_ID,
      CLIENT_SECRET: process.env.CLIENT_SECRET,
      GRANT_TYPE: process.env.GRAPH_GRANT_TYPE || 'client_credentials',
      SCOPE: process.env.GRAPH_SCOPE || 'https://graph.microsoft.com/.default'
    },
    URL: process.env.GRAPH_API || 'https://graph.microsoft.com/v1.0/users',
    DEFAULT_USER_PROPERTIES: (process.env.GRAPH_USER_PROPERTIES && process.env.GRAPH_USER_PROPERTIES.split(',')) || '*',
    DEFAULT_USER_EXPANDS: (process.env.GRAPH_USER_EXPANDS && process.env.GRAPH_USER_EXPANDS.split(',')) || null
  },
  RETRY_WAIT: (process.env.RETRY_WAIT && Number.parseInt(process.env.RETRY_WAIT)) || 10000,
  STATUS_PAGE: {
    URL: process.env.STATUS_URL,
    ENDPOINT: process.env.STATUS_ENDPOINT || 'api/status'
  },
  MONGO: {
    CONNECTION: process.env.MONGODB_CONNECTION,
    COLLECTION: process.env.MONGODB_COLLECTION,
    NAME: process.env.MONGODB_NAME
  },
  SCRIPT_SERVICE_URL: process.env.SCRIPT_SERVICE_URL || 'http://localhost:3000',
  DUST_JWT_SECRET: process.env.DUST_JWT_SECRET || false,
  DEFAULT_CALLER: 'NoenAndré',
  DEMO: (process.env.DEMO === 'true') || false,
  DEMO_USER: process.env.DEMO_USER || undefined,
  PAPERTRAIL_HOST: process.env.PAPERTRAIL_HOST || undefined,
  PAPERTRAIL_PORT: process.env.PAPERTRAIL_PORT || undefined,
  PAPERTRAIL_HOSTNAME: process.env.PAPERTRAIL_HOSTNAME || undefined,
  PAPERTRAIL_DISABLE_LOGGING: process.env.PAPERTRAIL_DISABLE_LOGGING || false
}
