const { prompt } = require('inquirer')
const { log, runNpm } = require('gem-mine-helper')
const { checkUIVersion } = require('../../../utils/project/version')

const CHOICES = [
  {
    name: '更新到最新版',
    value: true
  },
  {
    name: '不更新',
    value: false
  }
]

module.exports = function (context) {
  const { ui } = context
  if (ui) {
    let message, shouldReturn
    checkUIVersion(context, function (localVersion, remoteVersion) {
      if (localVersion) {
        if (localVersion === remoteVersion) {
          log.info(`UI 库 ${ui} 已经是最新版本 ${remoteVersion}，无须更新`)
          shouldReturn = true
        } else {
          message = `UI 库 ${ui} 发现新版本：${remoteVersion}，当前版本：${localVersion}，建议更新`
        }
      } else {
        if (remoteVersion) {
          message = `UI 库 ${ui} 本地版本丢失，建议更新到线上最新版：${remoteVersion}`
        } else {
          log.info(`UI 库 ${ui} 无法获取版本信息，暂不处理`)
          shouldReturn = true
        }
      }
    })
    if (shouldReturn) {
      return
    }

    return prompt({
      type: 'list',
      name: 'ui',
      message,
      choices: CHOICES
    }).then(function (params) {
      const choice = params.ui
      if (choice) {
        const { root, ui, remote_ui_version: remoteVersion } = context
        context.set('ui_version', remoteVersion)
        runNpm(`npm i ${ui} --save`, { cwd: root }, true)
        log.info(`更新 UI库 ${ui} 成功`)
      }
    })
  }
}
