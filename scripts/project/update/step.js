const { prompt } = require('inquirer')
const context = require('../../../context')
const { UIOption, getOptions, updateProject, classicOption, UPDATE_TYPE } = require('./options')
const { cloneTemplate } = require('../../../utils/project/git')
const { updatePackageJson } = require('../../../utils/project/package')
const { checkTemplateVersion, checkClassicVersion, checkUIVersion } = require('../../../utils/project/version')
const { EXIT_CODE } = require('../../../constant/core')
const report = require('../../../utils/project/report')

module.exports = function() {
  const { ui, classic_git: classicGit, template_version: templateVersion } = context

  let options
  checkTemplateVersion(context, function(localVersion, remoteVersion) {
    if (localVersion) {
      if (localVersion === remoteVersion) {
        options = getOptions(UPDATE_TYPE.NONE)
      }
    } else {
      options = getOptions(UPDATE_TYPE.ALL)
    }
  })
  if (!options) {
    options = getOptions(UPDATE_TYPE.SUGGUEST)
  }

  if (ui) {
    checkUIVersion(context, function(localVersion, remoteVersion) {
      options.push(UIOption(context, localVersion, remoteVersion))
    })
  }

  if (classicGit) {
    checkClassicVersion(context, function(localVersion, remoteVersion) {
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
    .then(function(params) {
      cloneTemplate(context) // 获取模板

      params.update.forEach(function(key) {
        // 根据选择执行对应的代码或包更新
        const fn = updateProject[key]
        if (fn) {
          fn(context)
        }
      })

      updatePackageJson(context) // 更新 package.json
      context.set('exit_code', EXIT_CODE.SUCCESS)
      report.emit(context)
    })
    .catch(function(e) {
      context.set({
        error: true,
        message: e.message,
        exit_code: EXIT_CODE.ERROR
      })
      console.error(e)
    })
}
