const path = require('path')
const { readJSON, writeJSON, getUIName } = require('gem-mine-helper')

/**
 * 更新 .babelrc，目的是为了处理 UI 库的按需打包
 */
module.exports = function (context) {
  const { root, ui } = context
  if (ui) {
    const uiLib = getUIName(ui)
    const babelrcPath = path.join(root, '.babelrc')
    const babelrc = readJSON(babelrcPath)
    babelrc.plugins.push(['import', { libraryName: uiLib, libraryDirectory: 'lib', style: true }])
    writeJSON(babelrcPath, babelrc)
  }
}
