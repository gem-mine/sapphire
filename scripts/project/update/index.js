const chalk = require('chalk')
const { prompt } = require('inquirer')
const context = require('../../../context')
const { getInfo } = require('../../../utils/project/info')
const { genId } = require('../../../utils/project')
const { COMMAND, TYPE, EXIT_CODE } = require('../../../constant/core')
const choice = {
  goon: require('../../choice/goon')
}
const step = require('./step')
const report = require('../../../utils/project/report')

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
      if (!context.get('id')) {
        context.set('id', genId())
      }

      context.set(getInfo(context))

      prompt(choice.goon(`对项目使用的 gem-mine 脚手架进行升级?`, false)).then(function (params) {
        if (params.goon) {
          step()
        } else {
          console.log(`\n${chalk.red('您主动终止了操作')}`)
          context.set('exit_code', EXIT_CODE.ABORT)
          report.emit(context)
        }
      })
    })
}
