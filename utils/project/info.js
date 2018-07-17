const path = require('path')
const fs = require('fs-extra')
const { readJSON, writeJSON, log, getIn } = require('gem-mine-helper')
const report = require('../project/report')
const { EXIT_CODE, MOBILE, PC } = require('../../constant/core')
const { FISH, FISH_MOBILE, ANTD, ANTD_MOBILE } = require('../../constant/ui')
const KEYS = [
  'id',
  'name',
  'platform',
  'ie8',
  'react_version',
  'template_version',
  'ui',
  'ui_version',
  'classic_git',
  'classic_branch',
  'classic_version'
]

/**
 * 保存信息到 .gem-mine
 */
function saveInfo(context) {
  const { root } = context
  const info = {}
  KEYS.forEach(function(key) {
    info[key] = context[key]
  })

  const infoPath = path.join(root, '.gem-mine')
  writeJSON(infoPath, info)
}

function getPkg(root) {
  const lockPath = path.join(root, 'package-lock.json')
  const pkgPath = path.join(root, 'package.json')
  if (fs.existsSync(lockPath)) {
    pkg = readJSON(lockPath)
  }
  if (!pkg && fs.existsSync(pkgPath)) {
    pkg = readJSON(pkgPath)
  }
  return pkg
}

function getProjectName(root) {
  const arr = root.split(path.sep)
  return arr[arr.length - 1]
}

function getInfoIfMiss(context, pkg) {
  let { ie8, platform, ui } = context
  if (ie8 === undefined || platform === undefined || ui === undefined) {
    // 根据 package.json 中获取的 es3ify 判断是否支持 ie8，但需要后续 ui 库判断修正
    ie8 = !!getIn(pkg, 'devDependencies.es3ify-loader')
    platform = PC

    const uiLibs = [FISH, FISH_MOBILE, ANTD, ANTD_MOBILE]
    uiLibs.some(function(key) {
      if (getIn(pkg, `dependencies.${key}`)) {
        ui = key
        if (ui !== FISH) {
          ie8 = false
          if (ui === FISH_MOBILE || ui === ANTD_MOBILE) {
            platform = MOBILE
          }
        }
        return true
      }
    })
  }
  return { ie8, platform, ui }
}

/**
 * 从 .gem-mine 文件读取信息
 */
function getInfo(context) {
  const { root } = context
  const configPath = path.join(root, '.gem-mine')
  let config
  let flag = true
  const pkg = getPkg(root)

  if (!fs.existsSync(configPath)) {
    // 判断目录特性，来识别是否是 gem-mine 项目：具有 config/webpack/webpack.js 文件以及 cat-eye 依赖
    const existConfig = fs.existsSync(path.join(root, 'config/webpack'))

    const existCore = getIn(pkg, 'dependencies.cat-eye')
    if (!pkg || !existConfig || !existCore) {
      log.error(`此目录非 gem-mine 创建的项目，或此目录（${root}）非项目根目录`)
      context.set('exit_code', EXIT_CODE.CONFIG_INVALID)
      report.emit(context)
      flag = false
    } else {
      log.error(`没有找到 .gem-mine 配置文件，但符合 gem-mine 目录结构`)
    }
  } else {
    config = readJSON(configPath)
  }
  if (flag) {
    const data = {}
    let { name } = context
    if (!name) {
      name = getProjectName(root)
    }

    const { ie8, platform, ui } = getInfoIfMiss(context, pkg)
    data.name = name
    data.ie8 = ie8
    data.platform = platform
    if (ui) {
      data.ui = ui
    }
    context.set(data)
  }
  return config
}

exports.saveInfo = saveInfo
exports.getInfo = getInfo
