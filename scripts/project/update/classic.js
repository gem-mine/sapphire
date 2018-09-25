const { prompt } = require('inquirer')
const { checkClassicVersion } = require('gem-mine-helper')
const choice = require('../../../utils/choice')
const { cloneClassic, copyClassic } = require('../../../utils/project/git')
const { updatePackage } = require('../../../utils/project/package')
const { diffVersion } = require('./helper')
const report = require('../../../utils/project/report')

module.exports = async function (context) {
  try {
    const { localVersion, remoteVersion } = await checkClassicVersion(context)
    const { message, flag } = diffVersion(localVersion, remoteVersion)

    const { goon } = await prompt(choice.goon({ message, defaults: flag, tip: true }))
    if (goon) {
      context.set('native', false)
      cloneClassic(context) // 获取模板
      copyClassic(context, true) // 拷贝代码骨架
      updatePackage(context) // 更新依赖
      report.success(context)
    }
  } catch (e) {
    report.catchError(context, e)
  }
}
