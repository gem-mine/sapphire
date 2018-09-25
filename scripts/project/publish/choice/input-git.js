const { input, loopInput } = require('../../../../utils/input')
const { log } = require('gem-mine-helper')

module.exports = async function (cache) {
  const { git } = cache
  const data = await loopInput(input('请输入项目的 git 仓库地址（一个他人具有 clone 权限的地址）：', git), function (
    result
  ) {
    if (/^https?:\/\//.test(result) || /^git@/.test(result)) {
      return true
    }
    log.error('请输入项目的 git 仓库地址（一个他人具有 clone 权限的地址）')
    return false
  })
  return data
}
