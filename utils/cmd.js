const execSync = require('child_process').execSync
const commandExists = require('command-exists').sync

/**
 * 执行 shell 命令，并且获取其执行的返回值
 */
function exec(cmd, params) {
  return execSync(cmd, Object.assign({}, params))
    .toString()
    .trim()
}

/**
 * 执行 shell 命令，但静默执行
 */
function execWithSilent(cmd, params) {
  return execSync(cmd, Object.assign({}, params))
}

/**
 * 执行 shell 命令，并输出进度等信息
 */
function execWithProcess(cmd, params) {
  return execSync(
    cmd,
    Object.assign(
      {
        stdio: [process.stdin, process.stdout, process.stderr]
      },
      params
    )
  )
}

module.exports = {
  exec,
  execWithSilent,
  execWithProcess,
  commandExists
}
