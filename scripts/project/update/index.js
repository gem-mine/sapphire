const chalk = require('chalk')
const { prompt } = require('inquirer')
const context = require('../../../context')
const { getInfo } = require('../../../utils/project/info')
const { COMMAND, TYPE, EXIT_CODE } = require('../../../constant/core')
const choice = {
  goon: require('../../choice/goon')
}
const step = require('./step')

module.exports = function (program) {
  program
    .command('update')
    .description('升级当前工程')
    .action(function (options) {
      const root = process.cwd()
      context.set({
        type: TYPE.PROJECT,
        command: COMMAND.UPDATE,
        root
      })

      context.set(getInfo(context))

      prompt(choice.goon(`对项目使用的 gem-mine 脚手架进行升级?`, false)).then(function (params) {
        if (params.goon) {
          step()
        } else {
          console.log(`\n${chalk.red('您主动终止了操作')}`)
          process.exit(EXIT_CODE.ABORT)
        }
      })
    })
}
