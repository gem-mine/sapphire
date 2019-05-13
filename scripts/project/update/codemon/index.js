const deprecateCatEye = require('./deprecate-cat-eye')
const enhanceRequest = require('./enhance-request')
const deprecateIE8 = require('./deprecate-ie8')
const fixAntPrefixCls = require('./fix-ant-prefix-cls')
const fixFishImport = require('./fix-fish-import')
const { FISH } = require('../../../../constant/ui')
const deprecateDurexWithRouter = require('./deprecate-durex-with-router')

module.exports = function (context) {
  const { root, ui, uiPrevVersion, uiLatestVersion } = context
  deprecateCatEye(root)
  enhanceRequest(root)
  deprecateIE8(root)
  if (ui === FISH && uiPrevVersion && uiLatestVersion && uiPrevVersion.split('.')[0] === '2' && uiLatestVersion.split('.') === '3') {
    fixAntPrefixCls(root)
  }
  fixFishImport(root)
  deprecateDurexWithRouter(root)
}
