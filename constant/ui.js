/**
 * UI 相关常量
 */
const { CONSTANT } = require('gem-mine-helper')
const { SDP_PREFIX } = CONSTANT

const FISH = `${SDP_PREFIX}/fish`
const FISH_MOBILE = `${SDP_PREFIX}/fish-mobile`
const ANTD = 'antd'
const ANTD_MOBILE = 'antd-mobile'

const FISH_DOC = 'http://fish-docs.sdp.101.com'
const FISH_MOBILE_DOC = 'http://fish-design-mobile.sdp.101.com'
const ANTD_DOC = 'https://ant.design'
const ANTD_MOBILE_DOC = 'https://mobile.ant.design'

exports.FISH = FISH
exports.ANTD = ANTD
exports.ANTD_MOBILE = ANTD_MOBILE
exports.FISH_MOBILE = FISH_MOBILE
exports.UI_DOC = {
  [FISH]: FISH_DOC,
  [ANTD]: ANTD_DOC,
  [ANTD_MOBILE]: ANTD_MOBILE_DOC,
  [FISH_MOBILE]: FISH_MOBILE_DOC
}
