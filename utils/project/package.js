const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const { readJSON, writeJSON, runNpm, log } = require('@gem-mine/sapphire-helper')
const { ANTD_MOBILE, FISH_MOBILE } = require('../../constant/ui')
const updateBabelrc = require('./babelrc')
const { DEFAULT_VERSION } = require('../../constant/core')
const compareVersions = require('compare-versions')

/**
 * 获取 package.json 信息
 */
function getPackageJson(root, useLockFile) {
  const pkgPath = path.join(root, 'package.json')
  let pkg
  if (useLockFile) {
    const lockPath = path.join(root, 'package-lock.json')
    if (fs.existsSync(lockPath)) {
      pkg = readJSON(lockPath)
    }
  }
  if (!pkg) {
    if (fs.existsSync(pkgPath)) {
      pkg = readJSON(pkgPath)
    } else {
      pkg = {}
    }
  }
  return pkg
}

/**
 * 安装依赖
 *    有指定 UI 库，则安装
 *    如果使用了 antd-mobile 或 fish-mobile，额外安装 rc-form
 */
function installDeps(context) {
  const { root, ui } = context

  if (ui) {
    const uiVersion = runNpm(`npm show ${ui} version`)
    runNpm(`npm i ${ui} --save --loglevel=error`, { cwd: root }, true)
    context.set('ui_version', uiVersion)

    if (ui === ANTD_MOBILE || ui === FISH_MOBILE) {
      runNpm(`npm i rc-form --save --loglevel=error`, { cwd: root }, true)
    }

    updateBabelrc(context)
  }
  runNpm(`npm i --loglevel=error`, { cwd: root }, true)
}

/**
 * 设置 package.json 文件中的 name
 */
function initPackageJson(context) {
  const { root, name: projectName } = context
  const pkgPath = path.join(root, 'package.json')
  const pkg = readJSON(pkgPath)
  const parent = path.basename(path.dirname(root))
  if (parent[0] === '@') {
    pkg.name = `${parent}/${projectName}`
  } else {
    pkg.name = projectName
  }
  pkg.version = DEFAULT_VERSION
  writeJSON(pkgPath, pkg)
}

/**
 * package.json 字段更新，包括： name， description，version
 */
function setPackageJson(packagePath, data) {
  const { name, description, version } = data
  if (fs.existsSync(packagePath)) {
    const pkg = readJSON(packagePath)
    if (name && !pkg.name) {
      pkg.name = name
    }
    if (description && !pkg.description) {
      pkg.description = description
    }
    if (version) {
      pkg.version = version
    }
    writeJSON(packagePath, pkg)
  } else {
    writeJSON(packagePath, {
      name,
      description,
      version
    })
  }
}

function getPackageVersion(pkg, name) {
  if (pkg) {
    const { dependencies, devDependencies } = pkg
    let dist
    if (dependencies) {
      dist = dependencies[name]
    }
    if (!dist) {
      if (devDependencies) {
        dist = devDependencies[name]
      }
    }

    let now
    if (dist) {
      now = dist.version || dist.replace(/^\D+/, '')
    }
    return now
  }
}

/**
 * 检测 项目中的依赖 是否和 模板中的依赖 版本一致，非一致情况会更新到 模板中对应的版本
 */
function updateProjectPackages(context) {
  const { root, shadow_path: shadowPath, ui } = context
  log.info('正在检查更新项目依赖包（package.json 中声明的依赖）...')
  const pkgPath = path.join(root, 'package.json')
  const nodeModules = path.join(root, 'node_modules')
  const oldPkg = readJSON(pkgPath)
  const newPkg = readJSON(path.join(shadowPath, 'package.json'))

  let shouldUpdate = false
  ;(function (items) {
    items.forEach(function (item) {
      const { key } = item
      Object.keys(newPkg[key]).forEach(function (name) {
        const newVersion = newPkg[key][name]
        const oldVersion = oldPkg[key][name]
        if (oldVersion !== newVersion) {
          oldPkg[key][name] = newVersion
          shouldUpdate = true
        }
      })
    })
  })([{ key: 'dependencies' }, { key: 'devDependencies' }, { key: 'scripts' }])
  ;(function (items) {
    items.forEach(function (item) {
      const arr = oldPkg[item] || []
      const newArr = newPkg[item]
      if (newArr) {
        newArr.forEach(function (v) {
          if (arr.indexOf(v) === -1) {
            arr.push(v)
          }
        })
      }
      if (arr !== oldPkg[item]) {
        oldPkg[item] = arr
        shouldUpdate = true
      }
    })
  })(['pre-commit'])

  if (shouldUpdate) {
    writeJSON(pkgPath, oldPkg)
    runNpm(`npm i --loglevel=error`, { cwd: root }, true)
    log.info('更新项目依赖包成功\n')
  } else if (!fs.existsSync(nodeModules)) {
    log.info('检测到项目中的依赖还未安装，将自动进行安装')
    runNpm(`npm i --loglevel=error`, { cwd: root }, true)
  } else {
    log.info('项目中的依赖已经和最新模板中一致，无须更新')
  }
}

exports.installDeps = installDeps
exports.initPackageJson = initPackageJson
exports.updateProjectPackages = updateProjectPackages
exports.setPackageJson = setPackageJson
exports.getPackageJson = getPackageJson
exports.getPackageVersion = getPackageVersion
