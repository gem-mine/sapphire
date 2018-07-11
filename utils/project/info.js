const path = require('path')
const chalk = require('chalk')
const fs = require('fs-extra')
const { readJSON, writeJSON } = require('../../utils/json')
const { EXIT_CODE } = require('../../constant/core')
const KEYS = [
  'id',
  'name',
  'platform',
  'ie8',
  'react_version',
  'template_version',
  'ui',
  'ui_version',
  'classic_git',
  'classic_branch',
  'classic_version'
]

function saveInfo(context) {
  const { root } = context
  const info = {}
  KEYS.forEach(function (key) {
    info[key] = context[key]
  })

  const infoPath = path.join(root, '.gem-mine')
  writeJSON(infoPath, info)
}

function getInfo(context) {
  const { root } = context
  const configPath = path.join(root, '.gem-mine')
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red(`\n没有找到 .gem-mine 配置文件，无法为你提供脚手架升级\n请确保在项目根目录下进行升级\n`))
    process.exit(EXIT_CODE.CONFIG_INVALID)
  }
  const config = readJSON(configPath)
  return config
}

exports.saveInfo = saveInfo
exports.getInfo = getInfo
