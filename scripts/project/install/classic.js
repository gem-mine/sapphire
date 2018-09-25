const { prompt } = require('inquirer')
const { log, runNpm } = require('gem-mine-helper')
const context = require('../../../context')
const { cloneClassic, copyClassic } = require('../../../utils/project/git')
const { initPackageJson } = require('../../../utils/project/package')
const report = require('../../../utils/project/report')
const { CUSTOM_KEY, DEFAULT_BRANCH } = require('../../../constant/core')
const { input, loopInput } = require('../../../utils/input')
const choice = {
  classic: require('./choice/classic')
}

module.exports = async function () {
  const { root } = context
  context.set('native', false)
  try {
    const choices = await choice.classic()
    let { classic } = await prompt(choices)
    let git, branch
    if (classic === CUSTOM_KEY) {
      git = await loopInput(input('请输入自定义代码骨架 git 地址:'), function (result) {
        if (/^https?:\/\//.test(result) || /^git@/.test(result)) {
          return true
        }
        log.error('请输入项目的 git 仓库地址')
        return false
      })
      branch = await loopInput(input('请输入自定义对应的分支名称（默认master）:', DEFAULT_BRANCH))
    } else {
      ;({ git, branch } = classic)
    }
    context.set({
      classic_git: git,
      classic_branch: branch || DEFAULT_BRANCH
    })

    cloneClassic(context) // 获取模板
    copyClassic(context) // 拷贝脚手架
    initPackageJson(context) // 更新 package.json 的 name
    runNpm(`npm i --loglevel=error`, { cwd: root }, true) // 安装依赖

    report.success(context)
  } catch (e) {
    report.catchError(context, e)
  }
}
