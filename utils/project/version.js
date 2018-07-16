const chalk = require('chalk')
const {
  printBox,
  log,
  checkCliVersion: _checkCliVersion,
  checkTemplateVersion: _checkTemplateVersion,
  checkUIVersion: _checkUIVersion,
  checkClassicVersion: _checkClassicVersion
} = require('gem-mine-helper')
const { GEM_MINE_DOC_VERSION } = require('../../constant/core')
const { UI_DOC } = require('../../constant/ui')

function checkCliVersion() {
  // gem-mine 中使用，必然存在 localVerison，因此只需要考虑是否升级问题
  _checkCliVersion(function ({ localVersion, remoteVersion }) {
    // 如果没有拿到 remoteVersion，则不提示
    if (remoteVersion) {
      if (localVersion !== remoteVersion) {
        printBox({
          text: `
  gem-mine 发现新版本：${chalk.grey(localVersion)} → ${chalk.yellow(remoteVersion)}
  执行：${chalk.yellow('npm i -g gem-mine')} 进行更新
  版本履历：${chalk.green(GEM_MINE_DOC_VERSION)}
  `
        })
      }
    }
  })
}

function checkTemplateVersion(context, callback) {
  console.log('\n正在获取工程代码骨架版本...')

  _checkTemplateVersion(context, function ({ localVersion, remoteVersion }) {
    if (remoteVersion) {
      context.set({
        local_template_version: localVersion,
        remote_template_version: remoteVersion,
        template_version: remoteVersion
      })
      const versionFlag = localVersion !== remoteVersion
      if (versionFlag) {
        const msg = localVersion ? `本地代码骨架版本为 ${chalk.red(localVersion)}` : '本地未获取到工程代码骨架版本'
        console.log(`${msg}，当前最新代码工程代码骨架版本为 ${chalk.yellow(remoteVersion)}`)
        console.log(`版本履历可以通过此链接查看：${chalk.green(`${GEM_MINE_DOC_VERSION}`)}\n`)
      } else {
        console.log(`工程代码骨架已经是最新版本：${chalk.yellow(localVersion)}\n`)
      }
      callback(localVersion, remoteVersion)
    } else {
      log.error(`网络异常，未能获取到工程代码骨架`)
    }
  })
}

function checkUIVersion(context, callback) {
  const { ui } = context
  console.log(`正在获取 ${ui} 最新版本号...`)
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

function checkClassicVersion(context, callback) {
  _checkClassicVersion(context, function ({ localVersion, remoteVersion, git, branch }) {
    context.set({
      local_classic_version: localVersion,
      remote_classic_version: remoteVersion
    })
    const versionFlag = localVersion !== remoteVersion
    if (versionFlag) {
      const msg = localVersion ? `本地经典代码骨架版本为 ${chalk.red(localVersion)}` : '本地未获取到经典代码骨架版本'
      console.log(`${msg}，当前最新代码经典代码骨架版本为 ${chalk.yellow(remoteVersion)}`)
      if (git && branch) {
        console.log(`具体信息可以通过此链接查看：${chalk.green(`${git}/tree/${branch}`)}\n`)
      }
    } else {
      context.set('classic_version', remoteVersion)
      console.log(`经典代码骨架已经是最新版本：${chalk.yellow(localVersion)}\n`)
    }
    callback(localVersion, remoteVersion)
  })
}

module.exports = {
  checkCliVersion,
  checkTemplateVersion,
  checkUIVersion,
  checkClassicVersion
}
