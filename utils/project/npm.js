const { exec, execWithProcess } = require('gem-mine-helper')
const { SDP_NPM, SDP_PREFIX } = require('../../constant/ui')

const REGISTRY = `--registry=${SDP_NPM}`

function runNpm(command, params = {}, process = false) {
  const registry = command.indexOf(SDP_PREFIX) > -1 ? REGISTRY : ''
  if (process) {
    return execWithProcess(`${command} ${registry}`, params)
  } else {
    return exec(`${command} ${registry}`, params)
  }
}

module.exports = runNpm
