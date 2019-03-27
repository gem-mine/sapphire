const context = require('../../../context')
const { getProjectInitConfig } = require('../../../utils/project/info')
const { genId } = require('../../../utils/project')
const { COMMAND } = require('../../../constant/core')

const step = require('./step')

module.exports = function (program) {
  program
    .command('update')
    .description('升级当前工程')
    .action(async function (options) {
      const root = process.cwd()
      context.set({
        command: COMMAND.UPDATE,
        root
      })

      context.set(getProjectInitConfig(context))
      if (!context.get('id')) {
        context.set('id', genId())
      }
      await step(context)
    })
}
