const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const { readJSON, writeJSON } = require('gem-mine-helper')

/**
 * ~/.gem-mine/${id}.json
 * {
 *   "master": {
 *     "git": "https://github.com/gem-mine/xxx.git",
 *     "token": "dafdasfdasfdsfdafafasfs"
 *   }
 * }
 */
function getCache(id) {
  const home = os.homedir()
  const p = path.resolve(home, `.gem-mine/${id}.json`)
  if (fs.existsSync(p)) {
    return readJSON(p)
  }
  return {}
}
exports.getCache = getCache

exports.setCache = function (id, cache, data) {
  const home = os.homedir()
  const { git, branch, token } = data
  const parent = path.join(home, '.gem-mine')
  if (!fs.existsSync(parent)) {
    fs.mkdirpSync(parent)
  }
  const p = path.join(parent, `${id}.json`)

  if (Object.keys(cache).length) {
    const item = cache[branch] || {}
    item.git = git
    if (token) {
      item.token = token
    }
    cache[branch] = item
    writeJSON(p, cache)
  } else {
    writeJSON(p, {
      [branch]: { git, token }
    })
  }
}

exports.getBranchCache = function (cache) {
  const arr = Object.keys(cache)
  if (arr.length) {
    const branch = arr[arr.length - 1]
    const data = cache[branch]
    data.branch = branch
    return data
  }
  return {}
}
