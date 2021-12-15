const { MongoClient } = require('mongodb')
const { logger } = require('@vtfk/logger')
const { MONGO: { CONNECTION, COLLECTION, NAME } } = require('../../config')

const db = {
  connected: false
}

const initializeClient = async collectionName => {
  db.client = new MongoClient(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  await db.client.connect()
  db.connected = true
  return db.client.db(NAME).collection(collectionName)
}

module.exports = async collectionName => {
  if (!CONNECTION) {
    logger('error', ['get-mongo', 'missing CONNECTION'])
    throw new Error('Missing CONNECTION')
  }

  if (!db.connected) {
    logger('warn', ['get-mongo', 'client not connected, initializing client'])
    return await initializeClient(collectionName || COLLECTION)
  } else {
    try {
      return db.client.db(NAME).collection(collectionName || COLLECTION)
    } catch (error) {
      logger('warn', ['get-mongo', 'client connectin broken. Initializing new one'])
      return await initializeClient(collectionName || COLLECTION)
    }
  }
}
