const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const compareVersions = require('compare-versions')
const { readJSON, writeJSON, runNpm, log } = require('@gem-mine/sapphire-helper')
const { ANTD_MOBILE, FISH_MOBILE } = require('../../constant/ui')
const updateBabelrc = require('./babelrc')
const { DEFAULT_VERSION } = require('../../constant/core')

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

function updatePackage(context, { pkg, lock, name, latest }) {
  const { root } = context
  try {
    const nodeModules = path.join(root, 'node_modules')
    const now = getPackageVersion(lock, name) || getPackageVersion(pkg, name)
    if (!latest) {
      latest = runNpm(`npm show ${name} version`)
    }
    let shouldUpdate = true // 根据版本判断是否要更新包
    let currentVersion
    if (latest) {
      currentVersion = latest
      latest = latest.replace(/^\D+/, '')
      shouldUpdate = compareVersions(latest, now) > 0
    } else {
      currentVersion = 'latest'
      shouldUpdate = false
    }

    if (now) {
      // 本地 package.json 存在包，但版本不同，进行包更新
      if (shouldUpdate) {
        log.info(`正在更新包 ${chalk.green(name)}: ${chalk.gray(now)} → ${chalk.yellow(latest)}`)
        runNpm(`npm i ${name}@${currentVersion} --save --loglevel=error`, { cwd: root }, true)
      } else {
        if (!fs.existsSync(`${nodeModules}/${name}`)) {
          // 本地包被删除，进行包安装
          log.info(`正在安装包 ${name}: ${latest}`)
          runNpm(`npm i ${name}@${currentVersion} --save --loglevel=error`, { cwd: root }, true)
        }
      }
    } else {
      // 本地 package.json 不存在包，进行包安装
      log.info(`正在安装包 ${name}: ${latest}`)
      runNpm(`npm i ${name}@${currentVersion} --save --loglevel=error`, { cwd: root }, true)
    }
  } catch (e) {
    let arr = context.get('error_packages')
    const result = {
      name,
      message: e.message
    }
    if (!arr) {
      arr = [result]
    } else {
      arr.push(result)
    }
    context.set('error_packages', arr)
    log.error(`安装包 ${name} 失败: ${e.message}`)
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
  const lockPath = path.join(root, 'package-lock.json')
  let lockPkg
  if (fs.existsSync(lockPath)) {
    lockPkg = readJSON(lockPath)
  }
  let shouldUpdate = false
  ;(function (items) {
    items.forEach(function (item) {
      const { key } = item
      const isPackage = key === 'dependencies' || key === 'devDependencies'
      Object.keys(newPkg[key]).forEach(function (name) {
        const newVersion = newPkg[key][name]
        const oldVersion = oldPkg[key][name]
        if (oldVersion !== newVersion) {
          oldPkg[key][name] = newVersion
          shouldUpdate = true
          if (isPackage) {
            updatePackage(context, { pkg: oldPkg, lock: lockPkg, name, latest: newVersion })
          }
        }
      })
      if (isPackage) {
        // 原 package.json 中的包如果不存在了，应该重新安装
        Object.keys(oldPkg[key]).forEach(function (name) {
          if (name !== ui) {
            const version = oldPkg[key][name]
            updatePackage(context, { pkg: oldPkg, lock: lockPkg, name, latest: version })
          }
        })
      }
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
    log.info('更新项目依赖包成功\n')
  } else {
    log.info('项目中的依赖已经和最新模板中一致，无须更新')
  }

  if (!fs.existsSync(nodeModules)) {
    log.info('检测到项目中的依赖还未安装，将自动进行安装')
    runNpm(`npm i --loglevel=error`, { cwd: root }, true)
  }
}

exports.installDeps = installDeps
exports.initPackageJson = initPackageJson
exports.updateProjectPackages = updateProjectPackages
exports.setPackageJson = setPackageJson
exports.getPackageJson = getPackageJson
exports.getPackageVersion = getPackageVersion
exports.updatePackage = updatePackage
