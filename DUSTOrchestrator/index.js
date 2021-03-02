const df = require('durable-functions')

module.exports = df.orchestrator(function * (context) {
  const { body: { systems }, token } = context.df.getInput()
  const instanceId = context.df.instanceId
  const parallelTasks = []

  // create a new request in the db
  yield context.df.callActivity('NewRequestActivity', { instanceId, systems })
  
  // start all system requests
  systems.forEach(system => {
    parallelTasks.push(context.df.callActivity('DUSTActivity', { instanceId, system, token }))
  })

  // wait for all system requests to finish
  yield context.df.Task.all(parallelTasks)

  return {
    status: 200,
    body: parallelTasks.map(task => {
      return {
        name: task.result.name,
        data: task.result.data,
        timestamp: task.timestamp
      }
    })
  }
})
