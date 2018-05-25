const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')

const MSG = {
  WEBPACK: 'webpack 相关配置（webpack.config.js、config/webpack.js 以及 config/webpack目录）',
  PROJECT_CONFIG: '项目配置（babelrc、eslintrc、stylelintrc、gitignore、npmrc 等根目录下的配置）',
  OTHER_CONFIG: '剩余配置（config 目录除了 webpack配置外的文件)',
  PUBLIC: '页面模板相关（public 目录）',
  SRC: '源码目录（src 目录）',
  UTIL: '工具函数目录（src/global/util 目录）'
}

const SUGGEST_UPDATE = chalk.green('建议更新')
function suggestUpdate(msg) {
  return `${msg}，${SUGGEST_UPDATE}`
}
function updateSuccessMsg(msg) {
  return console.log(`${chalk.green('更新成功')}: ${chalk.cyan(msg)}`)
}

const ITEMS = {
  WEBPACK: {
    name: suggestUpdate(MSG.WEBPACK),
    value: 'webpack_config',
    checked: true
  },
  PROJECT_CONFIG: {
    name: suggestUpdate(MSG.PROJECT_CONFIG),
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
    name: suggestUpdate(MSG.UTIL),
    value: 'util',
    checked: true
  }
}

exports.ITEMS = ITEMS

function copy(shadowPath, root, target) {
  fs.copySync(path.join(shadowPath, target), path.join(root, target))
}

exports.updateProject = {
  [ITEMS.WEBPACK.value]: function (shadowPath, root) {
    const arr = ['webpack.config.js', 'config/webpack.js', 'config/webpack']
    arr.forEach(function (target) {
      copy(shadowPath, root, target)
    })
    updateSuccessMsg(MSG.WEBPACK)
  },
  [ITEMS.PROJECT_CONFIG.value]: function (shadowPath, root) {
    const files = fs.readdirSync(shadowPath)
    files.forEach(function (name) {
      const stats = fs.statSync(path.resolve(shadowPath, name))
      if (name.indexOf('.') === 0 && stats.isFile()) {
        copy(shadowPath, root, name)
      }
    })
    updateSuccessMsg(MSG.PROJECT_CONFIG)
  },
  [ITEMS.OTHER_CONFIG.value]: function (shadowPath, root) {
    const files = fs.readdirSync(path.resolve(shadowPath, 'config'))
    files.forEach(function (name) {
      if (name !== 'webpack' && name !== 'webpack.js') {
        copy(shadowPath, root, `config/${name}`)
      }
    })
    updateSuccessMsg(MSG.OTHER_CONFIG)
  },
  [ITEMS.PUBLIC.value]: function (shadowPath, root) {
    copy(shadowPath, root, 'public')
    updateSuccessMsg(MSG.PUBLIC)
  },
  [ITEMS.SRC.value]: function (shadowPath, root) {
    copy(shadowPath, root, 'src')
    updateSuccessMsg(MSG.SRC)
  },
  [ITEMS.UTIL.value]: function (shadowPath, root) {
    copy(shadowPath, root, 'src/global/util')
    updateSuccessMsg(MSG.UTIL)
  }
}

exports.UPDATE_ITEMS = Object.keys(ITEMS).map(function (key) {
  return ITEMS[key]
})
