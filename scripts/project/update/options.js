const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const { execWithProcess, getUIName, runNpm } = require('gem-mine-helper')
const { cloneClassic, copySrc } = require('../../../utils/project/git')
const updateBabelrc = require('../../../utils/project/babelrc')

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
    name: function (flag = true) {
      return getMsg(MSG.WEBPACK, flag)
    },
    value: 'webpack_config',
    checked: true
  },
  PROJECT_CONFIG: {
    name: function (flag = true) {
      return getMsg(MSG.PROJECT_CONFIG, flag)
    },
    value: 'project_config',
    checked: true
  },
  OTHER_CONFIG: {
    name: function (flag = false) {
      return getMsg(MSG.OTHER_CONFIG, flag)
    },
    value: 'other_config'
  },
  PUBLIC: {
    name: function (flag = false) {
      return getMsg(MSG.PUBLIC, flag)
    },
    value: 'public'
  },
  SRC: {
    name: function (flag = false) {
      return getMsg(MSG.SRC, flag)
    },
    value: 'src'
  },
  UTIL: {
    name: function (flag = true) {
      return getMsg(MSG.UTIL, flag)
    },
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
    const { ui, shadow_path: shadowPath, root } = context
    const files = fs.readdirSync(shadowPath)
    files.forEach(function (name) {
      const stats = fs.statSync(path.resolve(shadowPath, name))
      if (name.indexOf('.') === 0 && stats.isFile()) {
        copy(shadowPath, root, name)
      }
    })
    if (ui) {
      updateBabelrc(context)
    }
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
    copySrc(context)
    updateSuccessMsg(MSG.SRC)
  },
  [OPTIONS.UTIL.value]: function (context) {
    const { shadow_path: shadowPath, root } = context
    copy(shadowPath, root, 'src/global/util')
    updateSuccessMsg(MSG.UTIL)
  },
  [UI]: function (context) {
    const { root, ui, remote_ui_version: remoteVersion } = context
    context.set('ui_version', remoteVersion)
    runNpm(`npm i ${ui} --save`, { cwd: root }, true)
    updateSuccessMsg(MSG.UI)
  },
  [CLASSIC]: function (context) {
    const { remote_classic_version: remoteVersion } = context
    context.set('classic_version', remoteVersion)
    cloneClassic(context)
  }
}

const UPDATE_TYPE = {
  ALL: 1,
  NONE: 2,
  SUGGUEST: 3
}
exports.UPDATE_TYPE = UPDATE_TYPE

exports.getOptions = function (type) {
  if (type <= UPDATE_TYPE.NONE) {
    const flag = type === UPDATE_TYPE.ALL
    return Object.keys(OPTIONS).map(function (key) {
      const options = Object.assign({}, OPTIONS[key])
      options.name = options.name(flag)
      options.checked = flag
      return options
    })
  } else {
    return Object.keys(OPTIONS).map(function (key) {
      const options = Object.assign({}, OPTIONS[key])
      options.name = options.name()
      return options
    })
  }
}

exports.UIOption = UIOption
exports.classicOption = classicOption
