const EventEmitter = require('events')
const chalk = require('chalk')
const figlet = require('figlet')
const { SAYINGS, WISH } = require('../../constant/saying')
const { UI_DOC } = require('../../constant/ui')
const { COMMAND, GEM_MINE_DOC, EMAIL, REPORT, EXIT_CODE } = require('../../constant/core')
const { getUIName, printBox, request, log } = require('gem-mine-helper')
const { gitInfo } = require('./git')
const { saveInfo } = require('./info')
const { checkCliVersion } = require('./version')

/**
 * 安装 或 升级 成功后的提示消息
 */
function printSuccess(context) {
  console.log('\n')
  printBox({
    text: chalk.green.bold(figlet.textSync('gem - mine'))
  })
  console.log('\n')
  console.log(chalk.cyan(SAYINGS[Math.floor(Math.random() * SAYINGS.length)]))
  console.log(chalk.magenta(`${WISH}\n`))
  const { ui, command, name: projectName } = context
  let uiDoc = ''
  if (ui) {
    uiDoc = UI_DOC[ui]
    if (uiDoc) {
      uiDoc = `\n  * ${getUIName(ui)}: ${uiDoc}`
    }
  }

  let tip = ''
  if (command === COMMAND.INSTALL) {
    tip = `你已经完成了项目的初始化。快速开始项目只需简单的两步：
  1. cd ${projectName}
  2. npm start
`
  } else if (command === COMMAND.UPDATE) {
    tip = '你已经完成了脚手架的升级'
  } else {
  }

  console.log(
    chalk.green(`
${tip}
更多帮助参看文档：
  * gem-mine: ${GEM_MINE_DOC} ${uiDoc}
`)
  )
}

/**
 * 安装 或 升级 失败后的提示消息
 */
function printError(context) {
  console.error(
    `${chalk.yellow('遇到了错误，您可以先查看帮助：')}${chalk.red.bold(`${GEM_MINE_DOC}/#/docs/question/list`)}`
  )
  console.error(`如果您还是无法解决问题，请在 请尝试联系：${chalk.red.bold(EMAIL)}`)
}

const report = new EventEmitter()

let shouldRun = true
exports.listen = function() {
  if (shouldRun) {
    shouldRun = false
    report.on('report', function(context) {
      const { exit_code: code } = context
      log.warning(`receive exit event message: ${code}`)
      try {
        if (code === EXIT_CODE.SUCCESS) {
          saveInfo(context) // 保存信息
          gitInfo(context) // git 信息获取（未进行 init 的会自动 init）
          printSuccess(context) // success
          request.post(REPORT, {
            json: context
          })
        } else if (code === EXIT_CODE.ERROR) {
          printError(context)
          request.post(REPORT, {
            json: context
          })
        }
      } catch (e) {
        console.log(e)
      } finally {
        checkCliVersion()
        process.exit(0)
      }
    })
  }
}

exports.emit = function(context) {
  report.emit('report', context)
}
