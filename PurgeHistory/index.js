const df = require('durable-functions')
const { PURGE_HISTORY_DAYS } = require('../config')

module.exports = async function (context, myTimer) {
  const client = df.getClient(context)

  const createdTimeFrom = new Date(0) // find instances from 1970
  const createdTimeTo = new Date(new Date().setDate(new Date().getDate() - PURGE_HISTORY_DAYS)) // up to PURGE_HISTORY_DAYS ago

  context.log('Purging instances between:', createdTimeFrom, 'and', createdTimeTo)
  return client.purgeInstanceHistoryBy(createdTimeFrom, createdTimeTo)
}
