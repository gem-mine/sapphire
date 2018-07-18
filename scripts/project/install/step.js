const { prompt } = require('inquirer')
const context = require('../../../context')
const choice = {
  platform: require('../../choice/platform'),
  pcUI: require('../../choice/pc-ui'),
  mobileUI: require('../../choice/mobile-ui'),
  ie8: require('../../choice/ie8'),
  classic: require('../../choice/classic'),
  custom: require('../../choice/classic-custom')
}
const { MOBILE, PC, EXIT_CODE, CUSTOM, IE8, MORDEN } = require('../../../constant/core')
const { cloneTemplate, copyProject } = require('../../../utils/project/git')
const { installDeps, setPackageJsonName } = require('../../../utils/project/package')
const report = require('../../../utils/project/report')

module.exports = function () {
  // 选择平台
  prompt(choice.platform())
    .then(function (data) {
      const { platform } = data
      context.set('platform', platform)
      return platform
    })
    .then(function (platform) {
      if (platform === MOBILE) {
        // 选择 mobile UI
        context.set({
          template_branch: MOBILE
        })
        return prompt(choice.mobileUI()).then(function (data) {
          if (data.ui) {
            context.set('ui', data.ui)
          }
        })
      } else if (platform === PC) {
        // 选择是否支持 IE8
        return prompt(choice.ie8())
          .then(function (data) {
            const { ie8 } = data
            context.set({
              ie8,
              template_branch: ie8 ? IE8 : MORDEN
            })
            return ie8
          })
          .then(function (ie8) {
            // 选择 pc UI
            return prompt(choice.pcUI(ie8)).then(function (data) {
              if (data.ui) {
                context.set('ui', data.ui)
              }
            })
          })
          .then(function () {
            // 选择经典代码，获取 git 地址及其 分支
            return prompt(choice.classic(context)).then(function (data) {
              const { classic: result } = data
              return result
            })
          })
          .then(function (result) {
            if (result) {
              if (result === CUSTOM) {
                return prompt(choice.custom.git(context))
                  .then(function (data) {
                    const { git } = data
                    return prompt(choice.custom.branch(context)).then(function (data) {
                      const { branch } = data
                      return { git, branch }
                    })
                  })
                  .then(function (data) {
                    const { git, branch } = data
                    context.set({
                      classic_git: git,
                      classic_branch: branch || 'master'
                    })
                  })
              } else {
                const defaultBranch = 'master'
                let git, branch
                if (typeof result === 'string') {
                  git = result
                  branch = defaultBranch
                } else {
                  git = result.git
                  branch = result.branch || defaultBranch
                }
                context.set({
                  classic_git: git,
                  classic_branch: branch
                })
              }
            }
          })
      }
    })
    .then(function () {
      cloneTemplate(context) // 获取模板
      copyProject(context) // 拷贝需要的代码
      installDeps(context) // 安装依赖
      setPackageJsonName(context) // 更新 package.json 的 name
      context.set('exit_code', EXIT_CODE.SUCCESS)
      report.emit(context)
    })
    .catch(function (e) {
      context.set({
        error: true,
        message: e.message,
        exit_code: EXIT_CODE.ERROR
      })
      console.log(e)
      report.emit(context)
    })
}
