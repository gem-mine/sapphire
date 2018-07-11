const chalk = require('chalk')
const { exec, commandExists } = require('gem-mine-helper')
const { NODE_VERSION, EXIT_CODE } = require('../constant/core')

/**
 * 检测 node 版本，版本太低直接退出程序
 */
function checkNodeVersion() {
  const s = process.versions
  const nodeVersion = s.node.split('.')[0]
  if (nodeVersion < NODE_VERSION) {
    console.error(
      `当前运行的 node 版本 ${chalk.cyan(s.node)} 版本太低，gem-mine 要求 node 版本 >= ${chalk.red(NODE_VERSION)}`
    )
    process.exit(EXIT_CODE.ENV_INVALID)
  }
}

/**
 * 检测 git 是否安装，未安装直接退出程序
 */
function checkGit() {
  if (!commandExists('git')) {
    console.log(chalk.cyan('没有检测到 git，请先安装 git 工具，安装参考：https://git-scm.com/book/zh/v1/起步-安装-Git'))
    process.exit(EXIT_CODE.ENV_INVALID)
  }

  try {
    exec('git config user.email')
  } catch (e) {
    console.log(
      `git 工具未正确配置，请进行 user.email/user.name 配置，参考：https://git-scm.com/book/zh/v1/起步-初次运行-Git-前的配置`
    )
    process.exit(EXIT_CODE.ENV_INVALID)
  }
}

/**
 * 检测使用的 npm 源，如果使用的是官方源，自动切换为淘宝源
 */
function checkNpmRegistry() {
  const registry = exec('npm config get registry')
  if (registry.indexOf('registry.npmjs.org') > -1) {
    exec('npm config set registry https://registry.npm.taobao.org')
  }
}

module.exports = {
  checkNodeVersion,
  checkGit,
  checkNpmRegistry
}
