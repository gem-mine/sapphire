const { prompt } = require('inquirer')
const chalk = require('chalk')
const { runNpm, checkNativeVersion } = require('gem-mine-helper')
const choice = require('../../../utils/choice')
const updateBabelrc = require('../../../utils/project/babelrc')
const { cloneNative, copyNative } = require('../../../utils/project/git')
const { updatePackage, getPackageJson, getPkgVersion, updatePkg } = require('../../../utils/project/package')
const { REACT_IE8_VERSION } = require('../../../constant/core')
const { ANTD_MOBILE, FISH_MOBILE } = require('../../../constant/ui')
const { diffVersion } = require('./helper')
const report = require('../../../utils/project/report')

async function checkAndUpdateReact(context, pkg) {
  const { root, ie8 } = context
  if (ie8) {
    context.set('react_version', REACT_IE8_VERSION)
  } else {
    const latest = runNpm(`npm show react version`)
    const now = getPkgVersion(pkg, 'react')
    if (latest !== now) {
      const { goon } = await prompt(
        choice.goon({
          message: `react 发现新版本 ${chalk.gray(now)} → ${chalk.yellow(latest)}，是否更新？`,
          defaults: true
        })
      )
      if (goon) {
        updatePkg({ root, pkg, name: 'react', latest })
        const arr = ['react-dom', 'prop-types', 'create-react-class']
        arr.forEach(name => {
          updatePkg({ root, name, pkg })
        })
        context.set('react_version', latest)
      }
    } else {
      context.set('react_version', latest)
    }
  }
}

async function checkAndUpdateUI(context, pkg) {
  const { root, ui } = context
  if (ui) {
    const latest = runNpm(`npm show ${ui} version`)
    const now = getPkgVersion(pkg, ui)
    if (latest !== now) {
      const { goon } = await prompt(
        choice.goon({
          message: `UI库 ${ui} 发现新版本 ${chalk.gray(now)} → ${chalk.yellow(latest)}，是否更新？`,
          defaults: true
        })
      )
      if (goon) {
        updatePkg({ root, pkg, name: ui, latest })
        if (ui === ANTD_MOBILE || ui === FISH_MOBILE) {
          updatePkg({ root, pkg, name: 'rc-form' })
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
    const { root, ui } = context
    const pkg = getPackageJson(root, true)
    const { localVersion, remoteVersion } = await checkNativeVersion(context)
    const { message, flag } = diffVersion(localVersion, remoteVersion)

    const { goon } = await prompt(choice.goon({ message, defaults: flag, tip: true }))
    if (goon) {
      await checkAndUpdateReact(context, pkg) // 是否更新 react 基础库
      await checkAndUpdateUI(context, pkg) // 是否更新 UI 库

      cloneNative(context) // 获取模板
      copyNative(context, true) // 拷贝脚手架
      context.set({
        native: true,
        native_version: remoteVersion
      })
      updatePackage(context) // 更新依赖
      if (ui) {
        updateBabelrc(context)
      }

      report.success(context)
    }
  } catch (e) {
    report.catchError(context, e)
  }
}
