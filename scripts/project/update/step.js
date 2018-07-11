const path = require('path')
const fs = require('fs')
const { prompt } = require('inquirer')
const context = require('../../../context')
const { UIOption, getOptions, updateProject, classicOption } = require('./options')
const { cloneTemplate } = require('../../../utils/project/git')
const { updatePackageJson } = require('../../../utils/project/package')
const { checkTemplateVersion, checkClassicVersion, checkUILib } = require('../../../utils/project/version')
const { EXIT_CODE } = require('../../../constant/core')

module.exports = function () {
  const { ui, classic_git: classicGit } = context

  checkTemplateVersion(context)

  const options = getOptions()
  if (ui) {
    checkUILib(context, function (localVersion, remoteVersion) {
      options.push(UIOption(context, localVersion, remoteVersion))
    })
  }

  if (classicGit) {
    checkClassicVersion(context, function (localVersion, remoteVersion) {
      options.push(classicOption(context, localVersion, remoteVersion))
    })
  }

  prompt({
    type: 'checkbox',
    name: 'update',
    message: '请选择要更新的目录或文件',
    pageSize: options.length,
    choices: options
  })
    .then(function (params) {
      cloneTemplate(context) // 获取模板

      params.update.forEach(function (key) {
        // 根据选择执行对应的代码或包更新
        const fn = updateProject[key]
        if (fn) {
          fn(context)
        }
      })

      updatePackageJson(context) // 更新 package.json
      process.exit(EXIT_CODE.SUCCESS)
    })
    .catch(function (e) {
      context.set({
        error: true,
        message: e.message
      })
      console.error(e)
      process.exit(EXIT_CODE.ERROR)
    })
}
