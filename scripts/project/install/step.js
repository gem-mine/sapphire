const { prompt } = require('inquirer')
const context = require('../../../context')
const { MOBILE, PC } = require('../../../constant/core')
const { cloneTemplate, copyTemplate } = require('../../../utils/project/git')
const { installDeps, initPackageJson } = require('../../../utils/project/package')
const report = require('../../../utils/project/report')
const choice = {
  platform: require('./choice/platform'),
  pcUI: require('./choice/pc-ui'),
  mobileUI: require('./choice/mobile-ui'),
  goon: require('./choice/goon')
}

module.exports = async function () {
  try {
    const { platform } = await prompt(choice.platform())
    context.set('platform', platform)
    if (platform === MOBILE) {
      const { ui } = await prompt(choice.mobileUI())
      if (ui) {
        context.set('ui', ui)
      }
    } else if (platform === PC) {
      const { ui } = await prompt(choice.pcUI())
      if (ui) {
        context.set('ui', ui)
      }
    }

    const { goon } = await prompt(choice.goon())

    if (goon) {
      cloneTemplate(context) // 获取模板
      copyTemplate(context) // 拷贝脚手架
      initPackageJson(context) // 初始化 package.json 的 一些字段
      installDeps(context) // 安装依赖

      report.success(context)
    }
  } catch (e) {
    report.catchError(context, e)
  }
}
