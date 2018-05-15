const validateProjectName = require('validate-npm-package-name')
const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const figlet = require('figlet')
const helper = require('./helper')
const constant = require('./constant')

const exec = helper.exec

function create(root, projectName, params) {
  checkProjectName(root, projectName, params)
  cloneFromGit(root, projectName, params)
  installDeps(root, projectName, params)
  setPackageJsonName(root, projectName, params)
  saveInfo(root, projectName, params)
  gitInit(root, projectName, params)
  printSuccess(root, projectName, params)
}

function update(root, projectName, params) {
  cloneFromGit(root, projectName, params, true)
  cleanBuild(root, projectName, params)
  printSuccess(root, projectName, params, true)
}

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach(error => {
      console.error(chalk.red(`    *  ${error}`))
    })
  }
}

function checkProjectName(root, projectName, params) {
  const validationResult = validateProjectName(projectName)
  // 包命名非法
  if (!validationResult.validForNewPackages) {
    console.error(`工程名 ${chalk.red(projectName)} 非法:`)
    printValidationResults(validationResult.errors)
    printValidationResults(validationResult.warnings)
    process.exit(1)
  }
}

function cloneFromGit(root, projectName, params, isUpdate) {
  const shadowPath = fs.mkdtempSync(path.join(os.tmpdir(), 'gem-mine-'))
  if (fs.existsSync(shadowPath)) {
    fs.removeSync(shadowPath)
  }
  exec(`git clone ${constant.REPO} ${shadowPath} --depth=1 --no-single-branch`)
  let branch
  if (params.platform === constant.MOBILE) {
    branch = 'mobile'
  } else {
    if (params.ie8) {
      branch = 'ie8'
    } else {
      branch = 'morden'
    }
  }
  exec(`git checkout master-${branch}`, { cwd: shadowPath, silent: true })
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  if (isUpdate) {
    const type = params.update
    const TYPE = constant.UPDATE
    if (type === TYPE.WEBPACK || type === TYPE.PUBLIC) {
      fs.copySync(path.join(shadowPath, 'config/webpack'), path.join(root, 'config/webpack'))
      fs.copySync(path.join(shadowPath, 'config/webpack.js'), path.join(root, 'config/webpack.js'))
      if (type === TYPE.PUBLIC) {
        fs.copySync(path.join(shadowPath, 'config/webpack'), path.join(root, 'config/webpack'))
        fs.copySync(path.join(shadowPath, 'config/webpack.js'), path.join(root, 'config/webpack.js'))
        fs.copySync(path.join(shadowPath, 'public'), path.join(root, 'public'))
      }
    } else {
      copyProject(root, projectName, params, shadowPath, type === TYPE.ALL, true)
    }
    updatePackageJson(root, shadowPath)
    updateBabelrc(root, params.ui)
  } else {
    copyProject(root, projectName, params, shadowPath, true)
  }
  fs.removeSync(shadowPath)
}

function copyProject(root, projectName, params, shadowPath, copySrc, isUpdate) {
  const ignores = ['manifest.json', '.git', 'src', 'package-lock.json']
  if (isUpdate) {
    ignores.push('package.json')
  }
  fs.readdirSync(shadowPath).forEach(function (name) {
    if (ignores.indexOf(name) === -1) {
      fs.copySync(path.join(shadowPath, name), path.join(root, name))
    }
  })

  if (copySrc) {
    let ui = params.ui
    const uiExamplePath = path.join(shadowPath, 'src/components/examples/ui')
    if (ui) {
      if (ui.indexOf(constant.SDP_PREFIX) === 0) {
        ui = ui.replace(constant.SDP_PREFIX, '')
      }
      fs.copySync(path.join(uiExamplePath, 'tpl', ui, 'index.jsx'), path.join(uiExamplePath, 'index.jsx'))
    }
    fs.removeSync(path.join(uiExamplePath, 'tpl'))
    fs.copySync(path.join(shadowPath, 'src'), path.join(root, 'src'))

    installClassic(root, projectName, params)
  }
}

function installClassic(root, projectName, params) {
  let ui = params.ui
  let classic = params.classic

  if (classic) {
    if (ui === constant.FISH || ui === constant.ANTD) {
      if (ui.indexOf(constant.SDP_PREFIX) === 0) {
        ui = ui.replace(constant.SDP_PREFIX, '')
      }
      const branch = `${ui}-admin`
      const shadowPath = fs.mkdtempSync(path.join(os.tmpdir(), 'classic-'))
      if (fs.existsSync(shadowPath)) {
        fs.removeSync(shadowPath)
      }
      exec(`git clone ${constant.CLASSIC_REPO} ${shadowPath} --depth=1 --no-single-branch`)

      exec(`git checkout ${branch}`, { cwd: shadowPath, silent: true })
      fs.copySync(path.resolve(shadowPath, 'config'), path.resolve(root, 'config'))
      fs.copySync(path.resolve(shadowPath, 'src'), path.resolve(root, 'src'))
      fs.removeSync(shadowPath)
    }
  }
}

function isGitRepo(root) {
  let flag = 20
  let p = root
  let s
  let existGit = false
  while (flag > 0) {
    existGit = fs.existsSync(path.join(p, '.git'))
    if (existGit) {
      existGit = true
      break
    }
    s = path.dirname(p)
    if (s === p) {
      break
    }
    p = s
    flag -= 1
  }
  return existGit
}

function gitInit(root, projectName, params) {
  if (!isGitRepo(root)) {
    exec(`git init`, { cwd: root, silent: true })
    exec(`git add .`, { cwd: root, silent: true })
    const msg = 'init by gem-mine 👻'
    exec(`git commit -m "${msg}"`, { cwd: root, silent: true })
    console.log(`\ngit ${msg}`)
  }
}

function installDeps(root, projectName, params) {
  let v
  if (params.ie8) {
    v = '0.14.9'
  } else {
    v = 'latest'
  }
  exec(`npm i react@${v} react-dom@${v} --save --loglevel=error`, { cwd: root })
  // 非 IE8 下安装的 react 已经不内置 prop-types 和 create-react-class，都需要单独安装，已处理兼容性问题
  if (!params.ie8) {
    exec(`npm i prop-types create-react-class --save --loglevel=error`, { cwd: root })
  }

  const ui = params.ui
  if (ui) {
    if (ui.indexOf(constant.SDP_PREFIX) === 0) {
      exec(`npm i ${ui} --save --registry=http://registry.npm.sdp.nd --loglevel=error`, { cwd: root })
    } else {
      exec(`npm i ${ui} --save --loglevel=error`, { cwd: root })
    }

    if (ui === constant.ANTD_MOBILE) {
      exec(`npm i rc-form --save`, { cwd: root })
    }

    updateBabelrc(root, ui)
  }
  exec(`npm i --loglevel=error`, { cwd: root })
}

function updateBabelrc(root, ui) {
  let uiLib
  if (ui === constant.FISH) {
    uiLib = 'fish'
  } else if (ui === constant.ANTD || ui === constant.ANTD_MOBILE) {
    uiLib = ui
  }
  if (uiLib) {
    const babelrcPath = path.join(root, '.babelrc')
    const babelrc = readJSONFile(babelrcPath)
    babelrc.plugins.push(['import', { libraryName: uiLib, libraryDirectory: 'lib', style: true }])
    writeJSONFile(babelrcPath, babelrc)
  }
}

function setPackageJsonName(root, projectName, params) {
  const pkgPath = path.join(root, 'package.json')
  const pkg = readJSONFile(pkgPath)
  pkg.name = projectName
  writeJSONFile(pkgPath, pkg)
}

function readJSONFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function writeJSONFile(path, content) {
  fs.writeFileSync(path, JSON.stringify(content, null, 2))
}

function updatePackageJson(root, shadowPath) {
  const pkgPath = path.join(root, 'package.json')
  const pkg = readJSONFile(pkgPath)
  const newPkg = readJSONFile(path.join(shadowPath, 'package.json'))
  let shouldInstall = false
  let shouldUpdate = false
  Object.keys(newPkg.dependencies).forEach(function (key) {
    if (pkg.dependencies[key] !== newPkg.dependencies[key]) {
      pkg.dependencies[key] = newPkg.dependencies[key]
      shouldInstall = true
    }
  })
  Object.keys(newPkg.devDependencies).forEach(function (key) {
    if (pkg.devDependencies[key] !== newPkg.devDependencies[key]) {
      pkg.devDependencies[key] = newPkg.devDependencies[key]
      shouldInstall = true
    }
  })
  Object.keys(newPkg.scripts).forEach(function (key) {
    if (pkg.scripts[key] !== newPkg.scripts[key]) {
      pkg.scripts[key] = newPkg.scripts[key]
      shouldUpdate = true
    }
  })
  if (shouldInstall || shouldUpdate) {
    writeJSONFile(pkgPath, pkg)
    if (shouldInstall) {
      exec(`npm i --loglevel=error`, { cwd: root })
    }
  } else {
    console.log('no npm package update')
  }
}

function cleanBuild(root, projectName, params) {
  try {
    const config = require(path.resolve(root, 'config/webpack.js'))
    let buildPath = config.buildPath || path.resolve(root, 'build')
    fs.removeSync(buildPath)
  } catch (e) {}
}

function printSuccess(root, projectName, params, isUpdate) {
  console.log('\n')
  console.log(
    chalk.green.bgBlack.bold(
      figlet.textSync('        gem   mine        ', {
        horizontalLayout: 'fitted'
      })
    )
  )
  console.log('\n')
  console.log(chalk.cyan(constant.SAYINGS[Math.floor(Math.random() * constant.SAYINGS.length)]))
  console.log(chalk.magenta(`${constant.WISH}\n`))
  const ui = params.ui
  let uiDoc = ''
  if (ui) {
    uiDoc = constant.UI_DOC[ui]
    if (uiDoc) {
      uiDoc = `\n  * ${ui}: ${uiDoc}`
    }
  }

  let tip
  if (isUpdate) {
    tip = '你已经完成了脚手架的升级'
  } else {
    tip = `你已经完成了项目的初始化。快速开始项目只需简单的两步：
  1. cd ${projectName}
  2. npm start
`
  }

  console.log(
    chalk.green(`
${tip}
更多帮助参看文档：
  * gem-mine: ${constant.GEM_MINE_DOC} ${uiDoc}
`)
  )
}

function saveInfo(root, projectName, params) {
  const infoPath = path.join(root, '.gem-mine')
  const info = { name: projectName, platform: params.platform }
  if (params.ie8) {
    info.ie8 = true
  }
  if (params.ui) {
    info.ui = params.ui
  }
  if (params.classic) {
    info.classic = params.classic
  }
  writeJSONFile(infoPath, info)
}

exports.create = create
exports.update = update
