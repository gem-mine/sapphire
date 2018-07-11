const url = require('url')
const chalk = require('chalk')
const { exec } = require('gem-mine-helper')
const { GEM_MINE_DOC_VERSION } = require('../../constant/core')
const { printBox, log } = require('./print')
const { getVersionFromGithub, getTemplateBranch } = require('./git')
const { getUIName } = require('../project/sdp')
const runNpm = require('./npm')

function checkCliVersion(context, pkg) {
  let remoteVersion
  const localVersion = context.get('cli_version')
  try {
    remoteVersion = exec(`npm show gem-mine version`)
  } catch (e) {}
  if (remoteVersion) {
    if (localVersion !== remoteVersion) {
      printBox({
        text: `
gem-mine 发现新版本：${chalk.grey(localVersion)} → ${chalk.green(remoteVersion)}
执行：${chalk.yellow('npm i -g gem-mine')} 进行更新
版本履历：${chalk.green(GEM_MINE_DOC_VERSION)}
`
      })
    }
  }
}

function checkTemplateVersion(context) {
  console.log('\n正在获取工程代码骨架版本...')
  const localVersion = context.get('template_version')
  const remoteVersion = getVersionFromGithub({
    project: 'gem-mine-template',
    branch: `master-${getTemplateBranch(context)}`
  })
  if (remoteVersion) {
    context.set({
      local_template_version: localVersion,
      remote_template_version: remoteVersion,
      template_version: remoteVersion
    })
    const versionFlag = localVersion !== remoteVersion
    if (versionFlag) {
      const msg = localVersion ? `本地代码骨架版本为 ${chalk.red(localVersion)}` : '本地未获取到工程代码骨架版本'
      console.log(`${msg}，当前最新代码工程代码骨架版本为 ${chalk.green(remoteVersion)}`)
      console.log(`版本履历可以通过此链接查看：${chalk.green(`${GEM_MINE_DOC_VERSION}`)}\n`)
    } else {
      console.log(`工程代码骨架已经是最新版本：${chalk.green(localVersion)}\n`)
    }
  } else {
    log.error(`网络异常，未能获取到工程代码骨架`)
  }
}

function checkUILib(context, callback) {
  const { ui, ui_version: localVersion } = context
  const uiName = getUIName(ui)
  console.log(`正在获取 ${uiName} 最新版本号...`)
  try {
    const remoteVersion = runNpm(`npm show ${ui} version`)
    context.set({
      local_ui_version: localVersion,
      remote_ui_version: remoteVersion
    })
    if (remoteVersion === localVersion) {
      console.log(`${uiName} 已经是最新版本：${chalk.green(remoteVersion)}\n`)
    }
    callback(localVersion, remoteVersion)
  } catch (e) {
    log.error(`网络异常，未能获取到 ${ui} 版本`)
  }
}

function checkClassicVersion(context, callback) {
  const classicGit = context.get('classic_git').replace(/\.git$/, '')
  if (classicGit) {
    const git = url.parse(classicGit)
    const branch = context.get('classic_branch')
    console.log('\n项目中使用了经典代码骨架，正在获取经典代码骨架版本...')
    const info = git.pathname.split('/')
    const username = info[1]
    const project = info[2]

    const localVersion = context.get('classic_version')
    const remoteVersion = getVersionFromGithub({
      username,
      project,
      branch
    })
    context.set({
      local_classic_version: localVersion,
      remote_classic_version: remoteVersion
    })
    const versionFlag = localVersion !== remoteVersion
    if (versionFlag) {
      const msg = localVersion ? `本地经典代码骨架版本为 ${chalk.red(localVersion)}` : '本地未获取到经典代码骨架版本'
      console.log(`${msg}，当前最新代码经典代码骨架版本为 ${chalk.green(remoteVersion)}`)
      console.log(`具体信息可以通过此链接查看：${chalk.green(`${git.href}/tree/${branch}`)}\n`)
    } else {
      context.set('classic_version', remoteVersion)
      console.log(`经典代码骨架已经是最新版本：${chalk.green(localVersion)}\n`)
    }
    callback(localVersion, remoteVersion)
  }
}

module.exports = {
  checkCliVersion,
  checkTemplateVersion,
  checkUILib,
  checkClassicVersion
}
