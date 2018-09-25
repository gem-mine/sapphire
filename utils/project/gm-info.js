const path = require('path')
const fs = require('fs-extra')
const { readJSON, writeJSON, log, getIn, getNativeBranch } = require('gem-mine-helper')
const report = require('./report')
const { getPackageJson } = require('./package')
const { EXIT_CODE, MOBILE, PC, EI_REPO, DEFAULT_BRANCH, EI_PROJECT_ID } = require('../../constant/core')
const { FISH, FISH_MOBILE, ANTD, ANTD_MOBILE } = require('../../constant/ui')
const KEYS = [
  'id',
  'name',
  'platform',
  'ie8',
  'react_version',
  'native',
  'native_version',
  'ui',
  'ui_version',
  'classic_git',
  'classic_branch',
  'classic_version',
  'from_id',
  'sxp'
]

/**
 * 保存信息到 .gem-mine
 */
function setGMConfig(context) {
  const { root } = context
  const gmPath = `${root}/.gem-mine`
  const cfg = {}
  KEYS.forEach(function (key) {
    const v = context[key]
    if (v !== null && v !== undefined && v !== '') {
      cfg[key] = v
    }
  })
  writeJSON(gmPath, cfg)
}

/**
 * 获取项目名
 */
function getProjectName(root) {
  const arr = root.split(path.sep)
  return arr[arr.length - 1]
}

/**
 * gem-mine 旧项目中没有配置文件，从目录结构中获取项目信息
 */
function getConfigIfMissFile(context, pkg) {
  let { ie8, platform, ui } = context
  if (ie8 === undefined || platform === undefined || ui === undefined) {
    // 根据 package.json 中获取的 es3ify 判断是否支持 ie8，但需要后续 ui 库判断修正
    ie8 = !!getIn(pkg, 'devDependencies.es3ify-loader')
    platform = PC

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
  return { ie8, platform, ui }
}

/**
 * .gem-mine 是否存在
 */
function checkGMConfigExist(context) {
  const { root } = context
  const configPath = path.join(root, '.gem-mine')
  return fs.existsSync(configPath)
}

/**
 * 是否是工程院旧脚手架
 */
function checkEIProject(context) {
  const { root } = context
  const arr = ['cfg', 'src/config', 'src/routes']
  return arr.every(function (p) {
    return fs.existsSync(path.join(root, p))
  })
}

/**
 * 是否是 gem-mine 创建的旧项目
 */
function checkGMProject(context) {
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
 * 获取 gem-mine 项目初始化信息
 * 1、存在 .gem-mine 文件，然后从中读取信息
 * 2、不存在 .get-mine 文件
 *    2-1、判断是否是旧的 gem-mine 项目，是的话生成其信息
 *    2-2、判断是否是工程院旧脚手架项目，是的话生成其信息
 *    2-3、都不是，如果 exit=true 退出并报错，否则返回一个空对象
 */
function getGMInitConfig(context, exit = false) {
  const { root } = context
  const configPath = path.join(root, '.gem-mine')
  let config = {}

  if (checkGMConfigExist(context)) {
    config = readJSON(configPath)
    if (config.platform) {
      config.native = true
      if (config.template_version) {
        config.native_version = config.template_version
      }
      if (!config.native_branch) {
        config.native_branch = getNativeBranch(config)
      }
    }
  } else {
    const pkg = getPackageJson(root, true)
    if (checkGMProject(context, pkg)) {
      log.error(`没有找到 .gem-mine 配置文件，但符合 gem-mine 原生脚手架目录结构`)
      config.miss_config = true
      config.native = true
      let { name } = context
      if (!name) {
        name = getProjectName(root)
        config.name = name
      }

      const { ie8, platform, ui } = getConfigIfMissFile(context, pkg)
      config.ie8 = ie8
      config.platform = platform
      if (ui) {
        config.ui = ui
      }
    } else if (checkEIProject(context)) {
      config.platform = PC
      config.classic_git = EI_REPO
      config.classic_branch = DEFAULT_BRANCH
      config.sxp = true
      config.from_id = EI_PROJECT_ID
    } else {
      log.error(`此目录非 gem-mine 创建的项目，或此目录（${root}）非项目根目录`)
      context.set('exit_code', EXIT_CODE.CONFIG_INVALID)
      report.catchError(context, {})
    }
  }
  return config
}

exports.setGMConfig = setGMConfig
exports.getGMInitConfig = getGMInitConfig
exports.checkEIProject = checkEIProject
exports.checkGMProject = checkGMProject
