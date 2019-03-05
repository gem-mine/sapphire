const fs = require('fs-extra')
const { runNpm, log, readJSON, writeJSON } = require('@gem-mine/sapphire-helper')
const { getPackageJson } = require('../../../utils/project/package')

function _fixPackage(root) {
  const pkg = getPackageJson(root)
  const { devDependencies } = pkg

  fs.removeSync(`${root}/package-lock.json`)
  log.info('已删除 package-lock.json')
  fs.removeSync(`${root}/manifest.json`)
  log.info('已删除 manifest.json')
  const names = ['babel-plugin-dynamic-import-webpack', 'es3ify-loader', 'export-from-ie8', 'gem-mine-helper', 'json-loader']
  if (devDependencies) {
    names.forEach(name => {
      if (devDependencies[name]) {
        log.info(`正在删除依赖包 ${name}`)
        runNpm(`npm uninstall ${name} -D --loglevel=error`, { cwd: root }, true)
      }
    })
  }
}

// 处理 package.json 中的 browserslist
function _fixBrowserslist(root) {
  const pkgPath = `${root}/package.json`
  const pkg = readJSON(pkgPath)
  const { browserslist } = pkg

  if (Array.isArray(browserslist)) {
    for (let i = 0; i < browserslist.length; i++) {
      if (/ie\s*>=\s*8/.test(browserslist[i])) {
        browserslist[i] = 'ie>=9'
        break
      }
    }
    pkg.browserslist = browserslist
    writeJSON(pkgPath, pkg)
    log.info('处理 package.json 的 browerslist 配置成功')
  }
}

// 处理 .bablerc 中的 dynamic-import-webpack
function _fixBabelrc(root) {
  const babelrcPath = `${root}/.babelrc`
  if (fs.existsSync(babelrcPath)) {
    const setting = readJSON(babelrcPath)
    const { plugins } = setting
    if (Array.isArray(plugins)) {
      setting.plugins = plugins.filter(item => {
        return item !== 'dynamic-import-webpack'
      })
      writeJSON(babelrcPath, setting)
      log.info('去除 .babelrc 的 dynamic-import-webpack plugin 成功')
    }
  }
}

module.exports = function (context) {
  const { root } = context
  _fixPackage(root)
  _fixBrowserslist(root)
  _fixBabelrc(root)
}
