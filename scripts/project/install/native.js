const { prompt } = require('inquirer')
const context = require('../../../context')
const { MOBILE, PC, IE8, MORDEN } = require('../../../constant/core')
const { cloneNative, copyNative } = require('../../../utils/project/git')
const { installDeps, initPackageJson } = require('../../../utils/project/package')
const report = require('../../../utils/project/report')
const choice = {
  platform: require('./choice/platform'),
  pcUI: require('./choice/pc-ui'),
  mobileUI: require('./choice/mobile-ui'),
  ie8: require('./choice/ie8')
}

module.exports = async function () {
  context.set('native', true)
  try {
    const { platform } = await prompt(choice.platform())
    context.set('platform', platform)
    if (platform === MOBILE) {
      context.set('native_branch', MOBILE)
      const { ui } = await prompt(choice.mobileUI())
      if (ui) {
        context.set('ui', ui)
      }
    } else if (platform === PC) {
      const { ie8 } = await prompt(choice.ie8())
      context.set({
        ie8,
        native_branch: ie8 ? IE8 : MORDEN
      })
      const { ui } = await prompt(choice.pcUI(ie8))
      if (ui) {
        context.set('ui', ui)
      }
    }

    cloneNative(context) // 获取模板
    copyNative(context) // 拷贝脚手架
    initPackageJson(context) // 初始化 package.json 的 一些字段
    installDeps(context) // 安装依赖

    report.success(context)
  } catch (e) {
    report.catchError(context, e)
  }
}
