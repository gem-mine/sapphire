const chalk = require('chalk')
const figlet = require('figlet')
const { SAYINGS, WISH } = require('../../constant/saying')
const { UI_DOC } = require('../../constant/ui')
const { COMMAND, SAPPHIRE_DOC, EMAIL, EXIT_CODE } = require('../../constant/core')
const { getUIName, printBox } = require('@gem-mine/sapphire-helper')
const { gitInfo } = require('./git')
const { setProjectConfig } = require('./info')
const { checkCliVersion } = require('./version')
const service = require('./service')

function getUIDoc(context) {
  const { ui } = context
  let uiDoc = ''
  if (ui) {
    uiDoc = UI_DOC[ui]
    if (uiDoc) {
      uiDoc = `\n  * ${getUIName(ui)}: ${uiDoc}`
    }
  }
  return uiDoc
}

/**
 * 安装 或 升级 成功后的提示消息
 */
function printSuccess(context) {
  console.log('\n')
  printBox({
    text: chalk.green.bold(figlet.textSync('sapphire'))
  })
  console.log('\n')
  console.log(chalk.cyan(SAYINGS[Math.floor(Math.random() * SAYINGS.length)]))
  console.log(chalk.magenta(`${WISH}\n`))
  const { command, input } = context
  let tip = ''
  let uiDoc = ''
  if (command === COMMAND.INSTALL) {
    tip = `你已经完成了项目的初始化。快速开始项目只需简单的两步：
  1. cd ${input}
  2. npm start
`
    uiDoc = getUIDoc(context)
  } else if (command === COMMAND.UPDATE) {
    tip = '你已经完成了脚手架的升级'
    uiDoc = getUIDoc(context)
  }

  console.log(
    chalk.green(`
${tip}
更多帮助和能力参看文档：
  * sapphire: ${SAPPHIRE_DOC} ${uiDoc}
`)
  )

  const arr = context.get('error_packages')
  if (arr && arr.length) {
    console.log(chalk.red(`请关注：安装以下包出现了错误，可能需要您手动进行安装:`))
    console.error(arr)
  }
}

/**
 * 安装 或 升级 失败后的提示消息
 */
function printError(context) {
  console.error(`${chalk.yellow('遇到了错误，您可以先查看帮助：')}${chalk.red.bold(`${SAPPHIRE_DOC}/#/docs/question/list`)}`)
  console.error(`如果您还是无法解决问题，请尝试联系：${chalk.red.bold(EMAIL)}`)
}

/**
 * 最后信息提示、上报，并退出程序
 */
async function report(context) {
  const { exit_code: code, command } = context
  try {
    if (code === EXIT_CODE.SUCCESS) {
      setProjectConfig(context) // 保存信息
      gitInfo(context) // git 信息获取（未进行 init 的会自动 init）
      printSuccess(context)
    } else if (code === EXIT_CODE.ERROR) {
      printError(context)
    }
    if (command === COMMAND.INSTALL) {
      await service.install(context)
    } else if (command === COMMAND.UPDATE) {
      await service.update(context)
    }
  } catch (e) {
    console.log(e)
  } finally {
    checkCliVersion()
    process.exit(0)
  }
}

exports.catchError = function (context, e, log = true) {
  context.set({
    error: true,
    message: e.message,
    exit_code: EXIT_CODE.ERROR
  })
  if (log) {
    console.log(e)
  }
  return report(context)
}

exports.success = function (context) {
  context.set('exit_code', EXIT_CODE.SUCCESS)
  return report(context)
}
