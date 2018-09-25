const { prompt } = require('inquirer')
const { getIn, log } = require('gem-mine-helper')
const context = require('../../../context')
const { setPackageJson, getPackageJson } = require('../../../utils/project/package')
const { setGMConfig } = require('../../../utils/project/gm-info')
const service = require('../../../utils/project/service')
const report = require('../../../utils/project/report')
const { getCache, getBranchCache, setCache } = require('./helper')
const { goon } = require('../../../utils/choice')
const choice = {
  git: require('./choice/input-git'),
  branch: require('./choice/input-branch'),
  version: require('./choice/input-version'),
  description: require('./choice/input-description'),
  token: require('./choice/input-token')
}

module.exports = async function () {
  try {
    const { root, name, id } = context
    const { goon: _goon } = await prompt(
      goon({
        message: '发布当前项目为模板脚手架，以供复用？',
        defaults: true
      })
    )
    if (!_goon) {
      return
    }

    const cache = getCache(id)
    const branchCache = getBranchCache(cache)

    const pkgPath = `${root}/package.json`
    const pkg = getPackageJson(root)

    const git = await choice.git(branchCache) // git repo 地址输入
    const branch = await choice.branch(branchCache) // git 分支输入
    const version = await choice.version(pkg) // 版本输入
    const description = await choice.description(pkg) // 描述输入
    const token = await choice.token(branchCache)

    context.set({
      git,
      branch,
      version,
      description,
      token
    })

    setPackageJson(pkgPath, {
      name,
      version,
      description
    })

    setGMConfig(context)

    const res = await service.publish(context)
    const { token: initToken } = res.data
    log.info('发布脚手架成功，快告诉你的伙伴们吧')
    if (initToken) {
      setCache(id, cache, { git, branch, token: initToken })
      log.info(`请记录 token 串：${initToken}，用于下次发布时验证`)
    } else {
      setCache(id, cache, { git, branch, token })
    }
  } catch (e) {
    const message = getIn(e, 'response.data.meta.message')
    const flag = !message
    if (message) {
      log.error(message)
    }
    report.catchError(context, e, flag)
  }
}
