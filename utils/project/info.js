const path = require('path')
const fs = require('fs-extra')
const { readJSON, writeJSON, log, getIn } = require('@gem-mine/sapphire-helper')
const report = require('./report')
const { getPackageJson } = require('./package')
const { EXIT_CODE, MOBILE, PC } = require('../../constant/core')
const { FISH, FISH_MOBILE, ANTD, ANTD_MOBILE } = require('../../constant/ui')
const KEYS = ['name', 'platform', 'ui', 'ui_version', 'sxp', 'template_version']

/**
 * 保存信息到 .sapphire
 */
function setProjectConfig(context) {
  const { root } = context
  const configPath = `${root}/.sapphire`
  const cfg = {}
  KEYS.forEach(function (key) {
    const v = context[key]
    if (v !== null && v !== undefined && v !== '') {
      cfg[key] = v
    }
  })
  writeJSON(configPath, cfg)
}

/**
 * 获取项目名
 */
function getProjectName(root) {
  const arr = root.split(path.sep)
  return arr[arr.length - 1]
}

/**
 * 项目中没有配置文件时，从目录结构中获取项目信息
 */
function getConfigIfMissFile(context, pkg) {
  let { platform, ui } = context
  let ie8 = false
  if (platform === undefined || ui === undefined) {
    platform = PC
    ie8 = !!getIn(pkg, 'devDependencies.es3ify-loader')

    const uiLibs = [FISH, FISH_MOBILE, ANTD, ANTD_MOBILE]
    uiLibs.some(function (key) {
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
  return { platform, ui, ie8 }
}

/**
 * .sapphire 是否存在
 */
function checkProjectConfigExist(context) {
  const { root } = context
  const configPath = path.join(root, '.sapphire')
  return fs.existsSync(configPath)
}

/**
 * 是否是 sapphire 创建的旧项目
 */
function checkProjectIsOld(context) {
  const { root } = context
  const pkg = getPackageJson(root, true)
  const existConfig = fs.existsSync(path.join(root, 'config/webpack'))

  const existCore = getIn(pkg, 'dependencies.cat-eye')
  if (!pkg || !existConfig || !existCore) {
    return false
  }
  return true
}

/**
 * 获取 sapphire 项目初始化信息
 * 1、存在 .sapphire 文件，然后从中读取信息
 * 2、不存在 .sapphire 文件
 *    2-1、判断是否是旧的 sapphire 项目，是的话生成其信息
 *    2-2、不是，如果 exit=true 退出并报错，否则返回一个空对象
 */
function getProjectInitConfig(context, exit = false) {
  const { root } = context
  const configPath = path.join(root, '.sapphire')
  let config = {}

  if (checkProjectConfigExist(context)) {
    config = readJSON(configPath)
  } else {
    const pkg = getPackageJson(root, true)
    if (checkProjectIsOld(context, pkg)) {
      config.miss_config = true
      // 如果存在 .gem-mine 项目
      const oldPath = path.join(root, '.gem-mine')
      if (fs.existsSync(oldPath)) {
        config = readJSON(oldPath)
        config.fromGemMine = true
        if (config.native_version) {
          config.template_version = config.native_version
        }
      } else {
        log.error(`没有找到 .sapphire 配置文件，但符合 sapphire 原生脚手架目录结构`)
        let { name } = context
        if (!name) {
          name = getProjectName(root)
          config.name = name
        }

        const { platform, ui, ie8 } = getConfigIfMissFile(context, pkg)

        config.platform = platform
        config.ie8 = ie8
        if (ui) {
          config.ui = ui
        }
      }
    } else if (!fs.existsSync(path.resolve(root, 'package.json'))) {
      log.error(`此目录非 sapphire 创建的项目，或此目录（${root}）非项目根目录`)
      context.set('exit_code', EXIT_CODE.CONFIG_INVALID)
      report.catchError(context, {})
    }
  }
  return config
}

exports.setProjectConfig = setProjectConfig
exports.getProjectInitConfig = getProjectInitConfig
exports.checkProjectIsOld = checkProjectIsOld
