const chalk = require('chalk')
const commandExists = require('command-exists').sync
const helper = require('./helper')

function checkNodeVersion() {
  const s = process.versions
  const nodeVersion = s.node.split('.')[0]
  if (nodeVersion < 6) {
    console.error(`当前运行的 node 版本 ${chalk.cyan(s.node)} 版本太低，此项目至少要求 ${chalk.red('node 版本 >= 6')}`)
    process.exit(1)
  }
}

function checkGit() {
  if (!commandExists('git')) {
    console.log(chalk.cyan('没有检测到 git，请先安装 git 工具，安装参考：https://git-scm.com/book/zh/v1/起步-安装-Git'))
    process.exit(1)
  }

  try {
    helper.exec('git config user.email', false)
  } catch (e) {
    console.log(`git 工具未正确配置，请进行 user.email/user.name 配置，参考：https://git-scm.com/book/zh/v1/起步-初次运行-Git-前的配置`)
    process.exit(1)
  }
}

function initCheck() {
  checkNodeVersion()
  checkGit()
}

module.exports = initCheck
