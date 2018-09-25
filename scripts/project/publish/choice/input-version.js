const { input, loopInput } = require('../../../../utils/input')
const { DEFAULT_VERSION } = require('../../../../constant/core')

module.exports = async function (pkg) {
  const { version } = pkg
  const data = await loopInput(input('请输入发布的版本号：', version || DEFAULT_VERSION), /^(\d+\.){2}\d+/)
  return data
}
