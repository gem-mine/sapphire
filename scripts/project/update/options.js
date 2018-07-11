const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const { execWithProcess } = require('gem-mine-helper')
const { getUIName } = require('../../../utils/project/sdp')
const { cloneClassic } = require('../../../utils/project/git')

const MSG = {
  WEBPACK: 'webpack 相关配置（webpack.config.js、config/webpack.js 以及 config/webpack目录）',
  PROJECT_CONFIG: '项目配置（babelrc、eslintrc、stylelintrc、gitignore、npmrc 等根目录下的配置）',
  OTHER_CONFIG: '剩余配置（config 目录除了 webpack配置外的文件)',
  PUBLIC: '页面模板相关（public 目录）',
  SRC: '源码目录（src 目录）',
  UTIL: '工具函数目录（src/global/util 目录）',
  UI: '升级 UI 库',
  CLASSIC: '升级经典代码骨架'
}

const UI = 'ui'
const CLASSIC = 'classic'
const SUGGEST_UPDATE = chalk.green('建议更新')

function getMsg(msg, flag = true) {
  return `${msg}${flag ? `，${SUGGEST_UPDATE}` : ''}`
}

function updateSuccessMsg(msg) {
  return console.log(`${chalk.green('更新成功')}: ${chalk.cyan(msg)}`)
}

const OPTIONS = {
  WEBPACK: {
    name: getMsg(MSG.WEBPACK),
    value: 'webpack_config',
    checked: true
  },
  PROJECT_CONFIG: {
    name: getMsg(MSG.PROJECT_CONFIG),
    value: 'project_config',
    checked: true
  },
  OTHER_CONFIG: {
    name: `${MSG.OTHER_CONFIG}`,
    value: 'other_config'
  },
  PUBLIC: {
    name: `${MSG.PUBLIC}`,
    value: 'public'
  },
  SRC: {
    name: `${MSG.SRC}`,
    value: 'src'
  },
  UTIL: {
    name: getMsg(MSG.UTIL),
    value: 'util',
    checked: true
  }
}

function UIOption(context, localVersion, remoteVersion) {
  const { ui } = context
  const flag = localVersion !== remoteVersion
  return {
    name: getMsg(`UI 库（${getUIName(ui)}@${localVersion}）升级到最新版本 ${remoteVersion}`, flag),
    value: UI,
    checked: flag
  }
}

function classicOption(context, localVersion, remoteVersion) {
  const { classic_git: git, classic_branch: branch } = context
  const flag = localVersion !== remoteVersion
  return {
    name: getMsg(
      `使用的经典代码骨架（${git} 分支：${branch}）当前版本：${localVersion}， 升级到最新版本 ${remoteVersion}`,
      flag
    ),
    value: CLASSIC,
    checked: flag
  }
}

function copy(shadowPath, root, target) {
  fs.copySync(path.join(shadowPath, target), path.join(root, target))
}

exports.updateProject = {
  [OPTIONS.WEBPACK.value]: function (context) {
    const { shadow_path: shadowPath, root } = context
    const arr = ['webpack.config.js', 'config/webpack.js', 'config/webpack']
    arr.forEach(function (target) {
      copy(shadowPath, root, target)
    })
    updateSuccessMsg(MSG.WEBPACK)
  },
  [OPTIONS.PROJECT_CONFIG.value]: function (context) {
    const { shadow_path: shadowPath, root } = context
    const files = fs.readdirSync(shadowPath)
    files.forEach(function (name) {
      const stats = fs.statSync(path.resolve(shadowPath, name))
      if (name.indexOf('.') === 0 && stats.isFile()) {
        copy(shadowPath, root, name)
      }
    })
    updateSuccessMsg(MSG.PROJECT_CONFIG)
  },
  [OPTIONS.OTHER_CONFIG.value]: function (context) {
    const { shadow_path: shadowPath, root } = context
    const files = fs.readdirSync(path.resolve(shadowPath, 'config'))
    files.forEach(function (name) {
      if (name !== 'webpack' && name !== 'webpack.js') {
        copy(shadowPath, root, `config/${name}`)
      }
    })
    updateSuccessMsg(MSG.OTHER_CONFIG)
  },
  [OPTIONS.PUBLIC.value]: function (context) {
    const { shadow_path: shadowPath, root } = context
    copy(shadowPath, root, 'public')
    updateSuccessMsg(MSG.PUBLIC)
  },
  [OPTIONS.SRC.value]: function (context) {
    const { shadow_path: shadowPath, root } = context
    copy(shadowPath, root, 'src')
    updateSuccessMsg(MSG.SRC)
  },
  [OPTIONS.UTIL.value]: function (context) {
    const { shadow_path: shadowPath, root } = context
    copy(shadowPath, root, 'src/global/util')
    updateSuccessMsg(MSG.UTIL)
  },
  [UI]: function (context) {
    const { ui, remote_ui_version: remoteVersion } = context
    context.set('ui_version', remoteVersion)
    execWithProcess(`npm i ${ui} --save`)
    updateSuccessMsg(MSG.UI)
  },
  [CLASSIC]: function (context) {
    const { remote_classic_version: remoteVersion } = context
    context.set('classic_version', remoteVersion)
    cloneClassic(context)
  }
}

exports.getOptions = function () {
  return Object.keys(OPTIONS).map(function (key) {
    return OPTIONS[key]
  })
}

exports.UIOption = UIOption
exports.classicOption = classicOption
