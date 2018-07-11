const chalk = require('chalk')
const figlet = require('figlet')
const { SAYINGS, WISH } = require('../../constant/saying')
const { UI_DOC } = require('../../constant/ui')
const { COMMAND, GEM_MINE_DOC, EMAIL } = require('../../constant/core')
const { getUIName } = require('./sdp')
const Box = require('boxen')

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

function printError(context) {
  console.error(
    `${chalk.yellow('遇到了错误，您可以先查看帮助：')}${chalk.red.bold(`${GEM_MINE_DOC}/#/docs/question/list`)}`
  )
  console.error(`如果您还是无法解决问题，请在 请尝试联系：${chalk.red.bold(EMAIL)}`)
}

function printBox({ text, border = 'green', center = true }) {
  const box = Box(text, {
    padding: {
      left: 10,
      right: 10
    },
    borderColor: border,
    borderStyle: 'round',
    float: center ? 'center' : 'left'
  })

  return console.log(box)
}

function getTime() {
  const date = new Date()
  return chalk.blue(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `)
}

function print({ message, color, time = true }) {
  let timeInfo
  if (time) {
    timeInfo = getTime()
  }
  console.log(`> ${timeInfo}${chalk[color](message)}`)
}

exports.printSuccess = printSuccess
exports.printError = printError
exports.printBox = printBox
exports.log = {
  info: function (message) {
    print({ message, color: 'cyan' })
  },
  warning: function (message) {
    print({ message, color: 'yellow' })
  },
  error: function (message) {
    print({ message, color: 'red' })
  }
}
