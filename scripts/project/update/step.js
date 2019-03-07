const { prompt } = require('inquirer')
const chalk = require('chalk')
const { runNpm, checkTemplateVersion } = require('@gem-mine/sapphire-helper')
const choice = require('../../../utils/choice')
const updateBabelrc = require('../../../utils/project/babelrc')
const { cloneTemplate, copyTemplate } = require('../../../utils/project/git')
const { updateProjectPackages, getPackageJson, getPackageVersion, updatePackage } = require('../../../utils/project/package')
const { ANTD_MOBILE, FISH_MOBILE } = require('../../../constant/ui')
const { diffVersion } = require('./helper')
const report = require('../../../utils/project/report')
const forsakeIE8 = require('./forsake-ie8')

async function _checkAndUpdateUI(context, pkg) {
  const { ui } = context
  if (ui) {
    const latest = runNpm(`npm show ${ui} version`)
    const now = getPackageVersion(pkg, ui)
    if (latest !== now) {
      const { goon } = await prompt(
        choice.goon({
          message: `UI库 ${ui} 发现新版本 ${chalk.gray(now)} → ${chalk.yellow(latest)}，是否更新？`,
          defaults: true
        })
      )
      if (goon) {
        return latest
      }
    }
  }
}

module.exports = async function (context) {
  try {
    const { root, ui, ie8, fromGemMine } = context

    const pkg = getPackageJson(root, true)
    const { localVersion, remoteVersion } = await checkTemplateVersion(context)
    const { message, flag } = diffVersion(localVersion, remoteVersion, ie8)
    // 脚手架升级提示
    const { goon: shouldUpdateTemplate } = await prompt(choice.goon({ message, defaults: flag, tip: true }))
    if (shouldUpdateTemplate) {
      // UI 库检测
      const uiVersion = await _checkAndUpdateUI(context, pkg)
      const { goon } = await prompt(
        choice.goon({
          message: '选择完毕，准备进行项目升级',
          defaults: true
        })
      )
      if (goon) {
        // 从 IE8 升级的项目需要进行清理
        if (fromGemMine && ie8) {
          forsakeIE8(context)
        }

        // 进行模板更新
        cloneTemplate(context) // 获取模板
        copyTemplate(context, true) // 拷贝脚手架
        context.set({
          template_version: remoteVersion
        })
        if (ui) {
          updateBabelrc(context)
        }

        // 进行 UI 库更新
        if (uiVersion) {
          updatePackage({ root, pkg, name: ui, uiVersion })
          if (ui === ANTD_MOBILE || ui === FISH_MOBILE) {
            updatePackage({ root, pkg, name: 'rc-form' })
          }
          context.set('ui_version', uiVersion)
        }

        // 更新 package 依赖
        updateProjectPackages(context)
        runNpm(`npm i --loglevel=error`)

        report.success(context)
      }
    }
  } catch (e) {
    report.catchError(context, e)
  }
}
