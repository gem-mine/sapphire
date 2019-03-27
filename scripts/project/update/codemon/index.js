const deprecateCatEye = require('./deprecate-cat-eye')
const enhanceRequest = require('./enhance-request')
const deprecateIE8 = require('./deprecate-ie8')
const fixAntPrefixCls = require('./fix-ant-prefix-cls')
const fixFishImport = require('./fix-fish-import')

module.exports = function (root) {
  deprecateCatEye(root)
  enhanceRequest(root)
  deprecateIE8(root)
  fixAntPrefixCls(root)
  fixFishImport(root)
}
