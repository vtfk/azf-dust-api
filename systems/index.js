module.exports = {
  AD: {
    handle: require('./ad/handler'),
    validate: require('./ad/validator')
  },
  Feide: {
    handle: require('./feide/handler'),
    validate: require('./feide/validator')
  },
  PIFU: {
    handle: require('./pifu/handler'),
    validate: require('./pifu/validator')
  },
  SDS: {
    handle: require('./sds/handler'),
    validate: require('./sds/validator')
  },
  Visma: {
    handle: require('./visma/handler'),
    validate: require('./visma/validator')
  },
  AAD: {
    handle: require('./aad/handler'),
    validate: require('./aad/validator')
  }
}
