const { readJsonSync, writeJsonSync } = require('fs-extra')

exports.readJSON = readJsonSync
exports.writeJSON = function (path, object) {
  return writeJsonSync(path, object, {
    spaces: 2
  })
}

exports.getIn = function (obj, path) {
  let result = obj
  if (path) {
    const arr = path.split('.')
    for (let i = 0; i < arr.length; i += 1) {
      const key = arr[i].trim()
      if (result === undefined) {
        return result
      }
      result = result[key]
    }
  }
  return result
}
