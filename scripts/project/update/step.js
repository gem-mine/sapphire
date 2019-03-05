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

async function _checkAndUpdateReact(context, pkg) {
  const { root, fromGemMine, ie8 } = context
  if (fromGemMine && ie8) {
    const arr = ['react', 'react-dom', 'prop-types', 'create-react-class']
    arr.forEach(name => {
      updatePackage({ root, name, pkg })
    })
  } else {
    const latest = runNpm(`npm show react version`)
    const now = getPackageVersion(pkg, 'react')
    if (latest !== now) {
      const { goon } = await prompt(
        choice.goon({
          message: `react 发现新版本 ${chalk.gray(now)} → ${chalk.yellow(latest)}，是否更新？`,
          defaults: true
        })
      )
      if (goon) {
        updatePackage({ root, pkg, name: 'react', latest })
        const arr = ['react-dom', 'prop-types', 'create-react-class']
        arr.forEach(name => {
          updatePackage({ root, name, pkg })
        })
      }
    }
  }
}

async function _checkAndUpdateUI(context, pkg) {
  const { root, ui } = context
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
        updatePackage({ root, pkg, name: ui, latest })
        if (ui === ANTD_MOBILE || ui === FISH_MOBILE) {
          updatePackage({ root, pkg, name: 'rc-form' })
        }
        context.set('ui_version', latest)
      }
    } else {
      context.set('ui_version', latest)
    }
  }
}

module.exports = async function (context) {
  try {
    const { root, ui, ie8, fromGemMine } = context

    const pkg = getPackageJson(root, true)
    const { localVersion, remoteVersion } = await checkTemplateVersion(context)
    const { message, flag } = diffVersion(localVersion, remoteVersion, ie8)
    const { goon } = await prompt(choice.goon({ message, defaults: flag, tip: true }))
    if (goon) {
      if (fromGemMine) {
        // 从 IE8 升级的项目需要进行清理
        if (ie8) {
          forsakeIE8(context)
        }
      }

      await _checkAndUpdateReact(context, pkg) // 是否更新 react 基础库
      await _checkAndUpdateUI(context, pkg) // 是否更新 UI 库

      cloneTemplate(context) // 获取模板
      copyTemplate(context, true) // 拷贝脚手架
      context.set({
        template_version: remoteVersion
      })
      updateProjectPackages(context) // 更新依赖
      if (ui) {
        updateBabelrc(context)
      }

      report.success(context)
    }
  } catch (e) {
    report.catchError(context, e)
  }
}
