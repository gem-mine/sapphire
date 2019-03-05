/**
 * sapphire 相关常量
 */
const { CONSTANT } = require('@gem-mine/sapphire-helper')

const SAPPHIRE_DOC = 'https://gem-mine.club'
const SAPPHIRE_DOC_VERSION = `${SAPPHIRE_DOC}/#/docs/version`

const REPO = 'https://github.com/gem-mine/sapphire-template.git'
const EMAIL = 'caolvchong@gmail.com'

const COMMAND = {
  INSTALL: 1,
  UPDATE: 2
}

exports.SAPPHIRE_DOC = SAPPHIRE_DOC
exports.SAPPHIRE_DOC_VERSION = SAPPHIRE_DOC_VERSION
exports.REPO = REPO

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
