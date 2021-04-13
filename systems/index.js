module.exports = {
  ad: {
    handle: require('./ad/handler'),
    validate: require('./ad/validator')
  },
  feide: {
    handle: require('./feide/handler'),
    validate: require('./feide/validator')
  },
  pifu: {
    handle: require('./pifu/handler'),
    validate: require('./pifu/validator')
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
  vigobas: {
    handle: require('./vigobas/handler'),
    validate: require('./vigobas/validator')
  }
}
