const fs = require('fs-extra')
const path = require('path')
const { exec, readJSON, writeJSON, runNpm, log } = require('gem-mine-helper')
const { ANTD_MOBILE, FISH_MOBILE } = require('../../constant/ui')
const updateBabelrc = require('./babelrc')
const { DEFAULT_VERSION, REACT_IE8_VERSION } = require('../../constant/core')

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
 * 1. 根据是否选择 IE8，来决定安装 react 版本
 * 2. 非 IE8 项目安装 prop-types、create-react-class 来处理兼容性问题
 * 3. 有指定 UI 库，则安装
 * 4. 如果使用了 antd-mobile，额外安装 rc-form
 */
function installDeps(context) {
  const { root, ui, ie8 } = context
  let reactVersion
  if (ie8) {
    reactVersion = REACT_IE8_VERSION
  } else {
    reactVersion = exec(`npm show react version`)
  }
  context.set('react_version', reactVersion)
  runNpm(`npm i react@${reactVersion} react-dom@${reactVersion} --save --loglevel=error`, { cwd: root }, true)
  if (!ie8) {
    runNpm(`npm i prop-types create-react-class --save --loglevel=error`, { cwd: root }, true)
  }

  if (ui) {
    const uiVersion = runNpm(`npm show ${ui} version`)
    runNpm(`npm i ${ui} --save --loglevel=error`, { cwd: root })
    context.set('ui_version', uiVersion)

    if (ui === ANTD_MOBILE || ui === FISH_MOBILE) {
      runNpm(`npm i rc-form --save`, { cwd: root }, true)
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
 * 用于 gem-mine publish 时完善信息，以便于下一次 publish 时获取信息
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

function getPkgVersion(pkg, name) {
  const { dependencies } = pkg
  let now
  if (dependencies) {
    const dist = dependencies[name]
    if (dist) {
      now = dist.version || dist.replace(/^\D+/, '')
    }
  }
  return now
}

function updatePkg({ root, pkg, name, latest }) {
  if (!latest) {
    latest = runNpm(`npm show ${name} version`)
  }
  const now = getPkgVersion(pkg, name)
  if (latest !== now) {
    log.info(`正在更新包 ${name}: ${now} → ${latest}`)
    runNpm(`npm i ${name}@latest --save --loglevel=error`, { cwd: root }, true)
  }
}

/**
 * 检测 项目中的依赖 是否和 模板中的依赖 版本一致，非一致情况会更新到 模板中对应的版本
 * 非 IE8 项目，会对 react、react-dom、prop-types、create-react-class 更新到最新版本
 */
function updatePackage(context) {
  const { root, shadow_path: shadowPath } = context
  log.info('\n正在检查更新项目依赖包（package.json 中声明的依赖）...\n')
  const pkgPath = path.join(root, 'package.json')
  const nodeModules = path.join(root, 'node_modules')
  const pkg = readJSON(pkgPath)
  const newPkg = readJSON(path.join(shadowPath, 'package.json'))
  let shouldUpdate = false
  ;(function (items) {
    items.forEach(function (item) {
      const { key } = item
      Object.keys(newPkg[key]).forEach(function (v) {
        const version = newPkg[key][v]
        const oldVersion = pkg[key][v]
        if (oldVersion !== version) {
          pkg[key][v] = version
          shouldUpdate = true
          if (key === 'dependencies' || key === 'devDependencies') {
            log.info(`正在更新包 ${v}: ${oldVersion} → ${version}`)
            runNpm(`npm i ${v}@${version}`, { cwd: root }, true)
          }
        }
      })
    })
  })([{ key: 'dependencies' }, { key: 'devDependencies' }, { key: 'scripts' }])
  ;(function (items) {
    items.forEach(function (item) {
      const arr = pkg[item] || []
      const newArr = newPkg[item]
      if (newArr) {
        newArr.forEach(function (v) {
          if (arr.indexOf(v) === -1) {
            arr.push(v)
          }
        })
      }
      if (arr !== pkg[item]) {
        pkg[item] = arr
        shouldUpdate = true
      }
    })
  })(['pre-commit'])

  if (shouldUpdate) {
    writeJSON(pkgPath, pkg)
    log.info('更新项目依赖包成功\n')
  } else {
    log.info('项目中的依赖已经和 gem-mine-template 中一致，无须更新')
  }

  if (!fs.existsSync(nodeModules)) {
    log.info('检测到项目中的依赖还未安装，将自动进行安装')
    runNpm(`npm i`, { cwd: root }, true)
  }
}

exports.installDeps = installDeps
exports.initPackageJson = initPackageJson
exports.updatePackage = updatePackage
exports.setPackageJson = setPackageJson
exports.getPackageJson = getPackageJson
exports.getPkgVersion = getPkgVersion
exports.updatePkg = updatePkg
