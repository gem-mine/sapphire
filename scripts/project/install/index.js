const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { prompt } = require('inquirer')
const choice = {
  goon: require('../../choice/goon')
}
const context = require('../../../context')
const { COMMAND, TYPE, EXIT_CODE } = require('../../../constant/core')
const step = require('./step')
const { checkProjectName, genId } = require('../../../utils/project')
const report = require('../../../utils/project/report')

module.exports = function (program, pkg) {
  program
    .command('*')
    .description('创建工程，请输入工程名')
    .action(function (name) {
      const root = path.resolve(name) // 新建的项目目录完整路径
      const projectName = path.basename(root) // 工程名称
      checkProjectName(projectName) // 检测工程名称是否合法

      context.set({
        id: genId(),
        type: TYPE.PROJECT,
        command: COMMAND.INSTALL,
        root,
        input: name,
        name: projectName
      })

      // 目录已经存在
      if (fs.existsSync(root)) {
        prompt(choice.goon(`${chalk.red(root)} 已经存在，是否继续进行?`, false)).then(function (params) {
          if (params.goon) {
            step()
          } else {
            console.log(`${chalk.red('\n  您主动终止了操作')}`)
            context.set('exit_code', EXIT_CODE.ABORT)
            report.emit(context)
          }
        })
      } else {
        step()
      }
    })
}
