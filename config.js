const TENANT_ID = process.env.TENANT_ID || '08f3813c-9f29-482f-9aec-16ef7cbf477a'

module.exports = {
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
    URL: process.env.GRAPH_API || 'https://graph.microsoft.com/v1.0/users',
    DEFAULT_USER_PROPERTIES: (process.env.GRAPH_USER_PROPERTIES && process.env.GRAPH_USER_PROPERTIES.split(',')) || '*'
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
  SYSTEMS: {
    VISMA: {
      COMPANY_ID: process.env.VISMA_COMPANY_ID || '1',
      CATEGORIES: process.env.VISMA_CATEGORIES || 'O,SE,TK,X,XA,XB,FW'
    },
    FEIDE: {
      PRINCIPAL_NAME: process.env.FEIDE_PRINCIPAL_NAME,
      ORGANIZATION_DN: process.env.FEIDE_ORGANIZATION_DN,
      MFA_SMS: process.env.FEIDE_MFA_SMS,
      MFA_GA: process.env.FEIDE_MFA_GA
    },
    PIFU: {
      PERSON_EMPLOYEE_TYPE: process.env.PIFU_PERSON_EMPLOYEE_TYPE,
      PERSON_STUDENT_TYPE: process.env.PIFU_PERSON_STUDENT_TYPE,
      MEMBERSHIP_EMPLOYEE_ROLETYPE: process.env.PIFU_MEMBERSHIP_EMPLOYEE_ROLETYPE,
      MEMBERSHIP_STUDENT_ROLETYPE: process.env.PIFU_MEMBERSHIP_STUDENT_ROLETYPE
    }
  },
  SOURCE_DATA_SYSTEMS: (process.env.SOURCE_DATA_SYSTEMS && process.env.SOURCE_DATA_SYSTEMS.split(',')) || [],
  SCRIPT_SERVICE_URL: process.env.SCRIPT_SERVICE_URL || 'http://localhost:3000',
  DUST_JWT_SECRET: process.env.DUST_JWT_SECRET || false,
  DEFAULT_CALLER: 'NoenAndré',
  DEMO: (process.env.DEMO === 'true') || false,
  DEMO_USER: process.env.DEMO_USER || undefined,
  DEMO_SKIP_DB: (process.env.DEMO_SKIP_DB === 'true') || false,
  PAPERTRAIL_HOST: process.env.PAPERTRAIL_HOST || undefined,
  PAPERTRAIL_PORT: process.env.PAPERTRAIL_PORT || undefined,
  PAPERTRAIL_HOSTNAME: process.env.PAPERTRAIL_HOSTNAME || undefined,
  PAPERTRAIL_DISABLE_LOGGING: process.env.PAPERTRAIL_DISABLE_LOGGING || false
}
