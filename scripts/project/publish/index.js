const path = require('path')
const context = require('../../../context')
const { genId } = require('../../../utils/project')
const { getGMInitConfig } = require('../../../utils/project/gm-info')
const { COMMAND } = require('../../../constant/core')

const step = require('./step')

module.exports = function (program) {
  program
    .command('publish')
    .description('发布当前项目为模板脚手架')
    .action(async function (options) {
      const root = process.cwd()
      const projectName = path.basename(root)

      context.set({
        command: COMMAND.PUBLISH,
        root,
        name: projectName
      })
      context.set(getGMInitConfig(context))

      let projectId = context.get('id')
      if (!projectId) {
        projectId = genId()
        context.set('id', projectId)
      }
      if (!context.native) {
        context.set('native', false)
      }

      await step()
    })
}
