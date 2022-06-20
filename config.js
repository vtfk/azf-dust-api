const TENANT_ID = process.env.TENANT_ID || '08f3813c-9f29-482f-9aec-16ef7cbf477a'

module.exports = {
  PURGE_HISTORY_DAYS: (process.env.PURGE_HISTORY_DAYS && Number.parseInt(process.env.PURGE_HISTORY_DAYS)) || 7,
  TOKEN_AUTH: {
    jwksUri: process.env.TOKEN_AUTH_JWK_URI || `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
    issuer: process.env.TOKEN_AUTH_ISS || `https://login.microsoftonline.com/${TENANT_ID}/v2.0`
  },
  GRAPH: {
    AUTH: {
      URL: process.env.GRAPH_AUTH_URL || 'https://login.microsoftonline.com/vtfk.onmicrosoft.com/oauth2/v2.0/token',
      CLIENT_ID: process.env.CLIENT_ID,
      CLIENT_SECRET: process.env.CLIENT_SECRET,
      GRANT_TYPE: process.env.GRAPH_GRANT_TYPE || 'client_credentials',
      SCOPE: process.env.GRAPH_SCOPE || 'https://graph.microsoft.com/.default'
    },
    URL: process.env.GRAPH_API || 'https://graph.microsoft.com/v1.0',
    URL_BETA: process.env.GRAPH_API_BETA || 'https://graph.microsoft.com/beta',
    DEFAULT_USER_PROPERTIES: (process.env.GRAPH_USER_PROPERTIES && process.env.GRAPH_USER_PROPERTIES.split(',')) || '*'
  },
  RETRY_WAIT: (process.env.RETRY_WAIT && Number.parseInt(process.env.RETRY_WAIT)) || 3000,
  STATUS_PAGE: {
    URL: process.env.STATUS_URL || 'http://localhost:7071/api',
    ENDPOINT: process.env.STATUS_ENDPOINT || 'status'
  },
  MONGO: {
    CONNECTION: process.env.MONGODB_CONNECTION,
    COLLECTION: process.env.MONGODB_COLLECTION,
    COLLECTION_USERS: process.env.MONGODB_COLLECTION_USERS,
    COLLECTION_SDS: process.env.MONGODB_COLLECTION_SDS,
    COLLECTION_VIGO_OT: process.env.MONGODB_COLLECTION_VIGO_OT,
    COLLECTION_VIGO_LAERLING: process.env.MONGODB_COLLECTION_VIGO_LAERLING,
    NAME: process.env.MONGODB_NAME,
    NAME_SDS: process.env.MONGODB_NAME_SDS,
    NAME_VIGO_OT: process.env.MONGODB_NAME_VIGO_OT,
    NAME_VIGO_LAERLING: process.env.MONGODB_NAME_VIGO_LAERLING
  },
  SYSTEMS: {
    AD: {
      OU_AUTO_USERS: process.env.AD_AUTO_USERS || '',
      OU_AUTO_DISABLED_USERS: process.env.AD_AUTO_DISABLED_USERS || ''
    },
    FEIDE: {
      PRINCIPAL_NAME: process.env.FEIDE_PRINCIPAL_NAME || '@vtfk.no',
      ORGANIZATION_DN: process.env.FEIDE_ORGANIZATION_DN || 'O=Vestfold og Telemark fylkeskommune,DC=vtfk,DC=no',
      MFA_SMS: process.env.FEIDE_MFA_SMS || 'urn:mace:feide.no:auth:method:sms',
      MFA_GA: process.env.FEIDE_MFA_GA || 'urn:mace:feide.no:auth:method:ga',
      MFA_AAD: process.env.FEIDE_MFA_AAD || 'urn:mace:feide.no:auth:method:azuread'
    },
    VIS: {
      FINT_API_URL: process.env.FINT_API_URL || '',
      FINT_BETA: (process.env.FINT_BETA && process.env.FINT_BETA === 'true') || false,
      FINT_JWT_SECRET: process.env.FINT_JWT_SECRET || false,
      FINT_TIMEOUT: (process.env.FINT_TIMEOUT && Number.parseInt(process.env.FINT_TIMEOUT)) || 0
    },
    VISMA: {
      COMPANY_ID: process.env.VISMA_COMPANY_ID || '1',
      CATEGORIES: process.env.VISMA_CATEGORIES || 'O,SE,TK,X,XA,XB,FW'
    }
  },
  SOURCE_DATA_SYSTEMS: (process.env.SOURCE_DATA_SYSTEMS && process.env.SOURCE_DATA_SYSTEMS.split(',')) || [],
  SCRIPT_SERVICE_URL: process.env.SCRIPT_SERVICE_URL || 'http://localhost:3000',
  DUST_JWT_SECRET: process.env.DUST_JWT_SECRET || false,
  DEFAULT_CALLER: 'NoenAndré',
  DEMO: (process.env.DEMO === 'true') || false,
  DEMO_USER: process.env.DEMO_USER || undefined,
  DEMO_SKIP_DB: (process.env.DEMO_SKIP_DB === 'true') || false,
  USER_SEARCH_LIMIT: (process.env.USER_SEARCH_LIMIT && Number.parseInt(process.env.USER_SEARCH_LIMIT)) || 10,
  PAPERTRAIL_HOST: process.env.PAPERTRAIL_HOST || undefined,
  PAPERTRAIL_PORT: process.env.PAPERTRAIL_PORT || undefined,
  PAPERTRAIL_HOSTNAME: process.env.PAPERTRAIL_HOSTNAME || undefined,
  PAPERTRAIL_DISABLE_LOGGING: process.env.PAPERTRAIL_DISABLE_LOGGING || false
}
