const execSync = require('child_process').execSync
const fs = require('fs')

function exec(cmd, ext) {
  if (ext === false) {
    return execSync(cmd, {})
      .toString()
      .trim()
  } else {
    if (ext && ext.silent) {
      const params = Object.assign({}, ext)
      return execSync(cmd, params)
    } else {
      const params = Object.assign({ stdio: [process.stdin, process.stdout, process.stderr] }, ext)
      return execSync(cmd, params)
    }
  }
}

function readJSONFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function writeJSONFile(path, content) {
  fs.writeFileSync(path, JSON.stringify(content, null, 2))
}

exports.exec = exec
exports.readJSONFile = readJSONFile
exports.writeJSONFile = writeJSONFile
