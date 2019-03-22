const deprecateCatEye = require('./deprecate-cat-eye')
const enhanceRequest = require('./enhance-request')
const deprecateIE8 = require('./deprecate-ie8')

module.exports = function (root) {
  deprecateCatEye(root)
  enhanceRequest(root)
  deprecateIE8(root)
}
