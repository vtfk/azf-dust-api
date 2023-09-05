const { MongoClient } = require('mongodb')
const { logger } = require('@vtfk/logger')
const { MONGO: { CONNECTION, COLLECTION, NAME } } = require('../../config')

const db = {
  client: null
}

const initializeClient = (collectionName, name) => {
  if (db.client === null) {
    logger('info', ['get-mongo', 'client not created, initializing client'])
    db.client = new MongoClient(CONNECTION)
  }
  return db.client.db(name).collection(collectionName)
}

module.exports = async (collectionName, name) => {
  if (!CONNECTION) {
    logger('error', ['get-mongo', 'missing CONNECTION'])
    throw new Error('Missing CONNECTION')
  }

  return await initializeClient(collectionName || COLLECTION, name || NAME)
}
