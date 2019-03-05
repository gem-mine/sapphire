const chalk = require('chalk')
const { printBox, log, checkCliVersion: _checkCliVersion, checkUIVersion: _checkUIVersion, checkTemplateVersion: _checkTemplateVersion } = require('@gem-mine/sapphire-helper')
const { SAPPHIRE_DOC_VERSION } = require('../../constant/core')
const { UI_DOC } = require('../../constant/ui')

function checkCliVersion() {
  _checkCliVersion(function ({ localVersion, remoteVersion }) {
    // 如果没有拿到 remoteVersion，则不提示
    if (remoteVersion) {
      if (localVersion !== remoteVersion) {
        printBox({
          text: `
  sapphire 发现新版本：${chalk.grey(localVersion)} → ${chalk.yellow(remoteVersion)}
  执行：${chalk.yellow('npm i -g @gem-mine/sapphire')} 进行更新
  版本履历：${chalk.green(SAPPHIRE_DOC_VERSION)}
  `
        })
      }
    }
  })
}

function checkTemplateVersion(context, callback) {
  log.info(`正在获取脚手架最新版本号...`)

  _checkTemplateVersion(context, function ({ localVersion, remoteVersion }) {
    if (remoteVersion) {
      context.set({
        local_version: localVersion,
        template_version: remoteVersion
      })
      const versionFlag = localVersion !== remoteVersion
      if (versionFlag) {
        const msg = localVersion ? `本地脚手架版本为 ${chalk.red(localVersion)}` : '本地未获取到脚手架版本'
        console.log(`${msg}，当前最新脚手架版本为 ${chalk.yellow(remoteVersion)}`)
        console.log(`版本履历可以通过此链接查看：${chalk.green(`${SAPPHIRE_DOC_VERSION}`)}\n`)
      } else {
        console.log(`脚手架已经是最新版本：${chalk.yellow(localVersion)}\n`)
      }
      callback(localVersion, remoteVersion)
    } else {
      log.error(`网络异常，未能获取到脚手架版本`)
    }
  })
}

function checkUIVersion(context, callback) {
  const { ui } = context
  log.info(`正在获取 ${ui} 最新版本号...`)
  _checkUIVersion(context, function ({ localVersion, remoteVersion }) {
    if (remoteVersion) {
      context.set({
        local_ui_version: localVersion,
        remote_ui_version: remoteVersion
      })
      const versionFlag = localVersion !== remoteVersion
      if (versionFlag) {
        const msg = localVersion ? `本地 UI库(${ui}) 版本为 ${chalk.red(localVersion)}` : `本地未获取到UI库(${ui})版本`
        console.log(`${msg}，当前最新版本为 ${chalk.yellow(remoteVersion)}`)
        const doc = UI_DOC[ui]
        if (doc) {
          console.log(`版本履历可以通过此链接查看：${chalk.green(`${doc}`)}\n`)
        }
      } else {
        console.log(`${ui} 已经是最新版本：${chalk.yellow(remoteVersion)}\n`)
      }
      callback(localVersion, remoteVersion)
    } else {
      log.error(`网络异常，未能获取到 ${ui} 版本`)
    }
  })
}

module.exports = {
  checkCliVersion,
  checkTemplateVersion,
  checkUIVersion
}
