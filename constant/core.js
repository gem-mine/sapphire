/**
 * gem-mine 相关常量
 */
const { CONSTANT } = require('gem-mine-helper')

const GEM_MINE_DOC = 'http://gem-mine.club'
const GEM_MINE_DOC_VERSION = `${GEM_MINE_DOC}/#/docs/version`

const REPO = 'https://github.com/gem-mine/gem-mine-template.git'
const CLASSIC_REPO = {
  ADMIN: 'https://github.com/gem-mine/gem-mine-admin.git'
}
const EMAIL = 'caolvchong@gmail.com'

const COMMAND = {
  INSTALL: 1,
  UPDATE: 2
}

exports.GEM_MINE_DOC = GEM_MINE_DOC
exports.GEM_MINE_DOC_VERSION = GEM_MINE_DOC_VERSION
exports.REPO = REPO
exports.CLASSIC_REPO = CLASSIC_REPO

exports.IE8 = CONSTANT.IE8
exports.MORDEN = CONSTANT.MORDEN
exports.MOBILE = CONSTANT.MOBILE
exports.PC = CONSTANT.PC
exports.EMAIL = EMAIL

exports.COMMAND = COMMAND
exports.TYPE = {
  PROJECT: 'project',
  COMPONENT: 'component'
}
exports.CUSTOM = 'custom'

exports.NODE_VERSION = 8
// 异常码
exports.EXIT_CODE = {
  SUCCESS: 'success',
  ABORT: 'abort',
  ERROR: 'error',
  ENV_INVALID: 'env_invalid',
  PROJECT_NAME_INVALID: 'project_name_invalid',
  CONFIG_INVALID: 'config_invalid'
}

// report url
exports.REPORT = 'http://cors.zmei.me/report'
