const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { log } = require('@gem-mine/sapphire-helper')
const { prompt } = require('inquirer')
const choice = require('../../../utils/choice')
const context = require('../../../context')
const { COMMAND } = require('../../../constant/core')
const step = require('./step')
const { checkProjectName, genId } = require('../../../utils/project')

module.exports = function (program, pkg) {
  program
    .command('*')
    .description('创建工程，请输入工程名')
    .action(async function (name) {
      const root = path.resolve(name) // 新建的项目目录完整路径
      const projectName = path.basename(root) // 工程名称
      checkProjectName(projectName) // 检测工程名称是否合法

      context.set({
        id: genId(),
        command: COMMAND.INSTALL,
        root,
        input: name,
        name: projectName
      })

      if (fs.existsSync(root)) {
        const { goon } = await prompt(
          choice.goon({
            message: `${chalk.red(root)} 已经存在，是否继续进行?`,
            tip: true
          })
        )
        if (goon) {
          await step()
        } else {
          log.error('\n  您主动终止了操作')
        }
      } else {
        await step()
      }
    })
}
