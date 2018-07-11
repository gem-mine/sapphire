const path = require('path')
const { SDP_PREFIX } = require('../../constant/ui')
const { readJSON, writeJSON } = require('../../utils/json')

/**
 * 更新 .babelrc，目的是为了处理 UI 库的按需打包
 */
module.exports = function (context) {
  const { root, ui } = context
  if (ui) {
    let uiLib
    if (ui.indexOf(SDP_PREFIX) === 0) {
      uiLib = ui.replace(SDP_PREFIX, '')
    } else {
      uiLib = ui
    }
    const babelrcPath = path.join(root, '.babelrc')
    const babelrc = readJSON(babelrcPath)
    babelrc.plugins.push(['import', { libraryName: uiLib, libraryDirectory: 'lib', style: true }])
    writeJSON(babelrcPath, babelrc)
  }
}
