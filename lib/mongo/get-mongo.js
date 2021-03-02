const { MongoClient } = require('mongodb')
const { logger } = require('@vtfk/logger')
const { MONGO: { CONNECTION, COLLECTION, NAME } } = require('../../config')

let client = null

module.exports = () => {
  if (!CONNECTION) {
    logger('error', ['get-mongo', 'missing MONGODB_CONNECTION'])
    throw new Error('Missing MONGODB_CONNECTION')
  }

  if (client && !client.isConnected) {
    client = null
    logger('warn', ['get-mongo', 'mongo connection lost', 'client discarded'])
  }

  if (client === null) {
    client = new MongoClient(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  } else if (client.isConnected) {
    return client.db(NAME).collection(COLLECTION)
  }

  return new Promise((resolve, reject) => {
    client.connect(error => {
      if (error) {
        client = null
        logger('error', ['get-mongo', 'client connect error', error])
        return reject(error)
      }

      return resolve(client.db(NAME).collection(COLLECTION))
    })
  })
}
