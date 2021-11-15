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
  equitrack: {
    handle: require('./equitrack/handler'),
    validate: require('./equitrack/validator')
  }
}
