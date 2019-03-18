const fs = require('fs-extra')
const { log, readJSON, writeJSON } = require('@gem-mine/sapphire-helper')
const deprecateCatEye = require('./codemon/deprecate-cat-eye')

// 对包的清理，针对 gem-mine 项目
function _fixPackage(root) {
  const pkgPath = `${root}/package.json`
  const pkg = readJSON(pkgPath)
  const { devDependencies } = pkg

  fs.removeSync(`${root}/package-lock.json`)
  log.info('已删除 package-lock.json')
  fs.removeSync(`${root}/manifest.json`)
  log.info('已删除 manifest.json')
  log.info('正在删除 node_modules，可能需要花费较多时间，请耐心等待')
  fs.removeSync(`${root}/node_modules`)
  log.info('删除 node_modules 成功')
  const names = [
    'babel-core',
    'babel-plugin-syntax-dynamic-import',
    'babel-plugin-transform-object-assign',
    'babel-plugin-transform-runtime',
    'babel-polyfill',
    'babel-preset-es2015',
    'babel-preset-react',
    'babel-preset-stage-0',
    'es3ify-loader',
    'extract-text-webpack-plugin',
    'export-from-ie8',
    'gem-mine-helper',
    'json-loader'
  ]
  if (devDependencies) {
    names.forEach(name => {
      if (devDependencies[name]) {
        delete devDependencies[name]
        log.info(`删除依赖包 ${name} 成功`)
      }
    })
    pkg.devDependencies = devDependencies
    writeJSON(pkgPath, pkg)
  }
}

// 处理 package.json 中的 browserslist，仅针对 IE8 项目
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

// 处理 .bablerc 中的 dynamic-import-webpack，针对 gem-mine 项目
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
  const { root, fromGemMine } = context
  if (fromGemMine) {
    _fixPackage(root)
    _fixBrowserslist(root)
    _fixBabelrc(root)
  }
  deprecateCatEye(root)
}
