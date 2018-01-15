const execSync = require('child_process').execSync
const os = require('os')

function exec(cmd, ext) {
  if (ext === false) {
    return execSync(cmd, {})
      .toString()
      .trim()
  } else {
    if (ext && ext.silent) {
      const params = Object.assign({}, ext)
      execSync(cmd, params)
    } else {
      const params = Object.assign({ stdio: [process.stdin, process.stdout, process.stderr] }, ext)
      execSync(cmd, params)
    }
  }
}

exports.exec = exec
