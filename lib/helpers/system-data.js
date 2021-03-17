module.exports.hasData = obj => Array.isArray(obj) ? obj.length > 0 : typeof obj === 'object' ? Object.getOwnPropertyNames(obj).filter(prop => prop !== 'length').length > 0 : typeof obj !== 'undefined'
module.exports.getArray = obj => (Array.isArray(obj) ? obj : [obj]).filter(obj => !!obj)
module.exports.getArrayData = data => this.getArray(data)[0]
