/**
 * gem-mine 相关常量
 */
const { CONSTANT } = require('gem-mine-helper')

const GEM_MINE_DOC = 'https://gem-mine.gitee.io/gem-mine-docs'
const GEM_MINE_DOC_VERSION = `${GEM_MINE_DOC}/#/docs/version`

const REPO = 'https://gitee.com/gem-mine/gem-mine-template.git'
const EI_REPO = `http://git.${CONSTANT.SXP}.nd/fed/react-boilerplate.git`
const EI_PROJECT_ID = '1536626419431L6327804950'
const EMAIL = 'caolvchong@gmail.com'

const COMMAND = {
  INSTALL: 1,
  UPDATE: 2,
  PUBLISH: 3
}

const BASIC_VALUES = {
  NATIVE: 'native',
  CLASSIC: 'classic'
}
exports.BASIC_VALUES = BASIC_VALUES

const BASIC_KEY = 'basic'
exports.BASIC_KEY = BASIC_KEY

const CUSTOM_KEY = 'custom'
const DEFAULT_BRANCH = 'master'

exports.CUSTOM_KEY = CUSTOM_KEY
exports.DEFAULT_BRANCH = DEFAULT_BRANCH

const UPDATE_TYPE = {
  BEST: 1,
  ALL: 2,
  NONE: 3
}
exports.UPDATE_TYPE = UPDATE_TYPE

exports.GEM_MINE_DOC = GEM_MINE_DOC
exports.GEM_MINE_DOC_VERSION = GEM_MINE_DOC_VERSION
exports.REPO = REPO
exports.EI_REPO = EI_REPO
exports.EI_PROJECT_ID = EI_PROJECT_ID

exports.IE8 = CONSTANT.IE8
exports.MORDEN = CONSTANT.MORDEN
exports.MOBILE = CONSTANT.MOBILE
exports.PC = CONSTANT.PC
exports.EMAIL = EMAIL

exports.COMMAND = COMMAND

exports.DEFAULT_VERSION = '0.1.0'

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

exports.API = CONSTANT.API

const REACT_IE8_VERSION = '0.14.9'
exports.REACT_IE8_VERSION = REACT_IE8_VERSION
