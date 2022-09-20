module.exports = {
  ad: {
    handle: require('./ad/handler'),
    validate: require('./ad/validator')
  },
  feide: {
    handle: require('./feide/handler'),
    validate: require('./feide/validator')
  },
  vis: {
    handle: require('./vis/handler'),
    validate: require('./vis/validator')
  },
  sds: {
    handle: require('./sds/handler'),
    validate: require('./sds/validator')
  },
  visma: {
    handle: require('./visma/handler'),
    validate: require('./visma/validator')
  },
  aad: {
    handle: require('./aad/handler'),
    validate: require('./aad/validator')
  },
  sync: {
    handle: require('./sync/handler'),
    validate: require('./sync/validator')
  },
  equitrac: {
    handle: require('./equitrac/handler'),
    validate: require('./equitrac/validator')
  },
  vigoot: {
    handle: require('./vigoot/handler'),
    validate: require('./vigoot/validator')
  },
  vigolaerling: {
    handle: require('./vigolaerling/handler'),
    validate: require('./vigolaerling/validator')
  },
  p360: {
    handle: require('./p360/handler'),
    validate: require('./p360/validator')
  }
}
