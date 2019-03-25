const path = require('path')
const fs = require('fs-extra')
const { readJSON, writeJSON, log, getIn } = require('@gem-mine/sapphire-helper')
const report = require('./report')
const { EXIT_CODE } = require('../../constant/core')
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
function checkProjectIsOld(context, pkg) {
  const { root } = context
  const existConfig = fs.existsSync(path.join(root, 'config/webpack'))

  const existCore = getIn(pkg, 'dependencies.@gem-mine/durex')
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
