module.exports.hasData = obj => Array.isArray(obj) ? obj.length > 0 : typeof obj === 'object' && Object.getOwnPropertyNames(obj).filter(prop => prop !== 'length').length > 0
module.exports.getArray = obj => (Array.isArray(obj) ? obj : [obj]).filter(obj => !!obj)
module.exports.getSystemData = data => getArray(data)[0]
