const { input, loopInput } = require('../../../../utils/input')

module.exports = async function (pkg) {
  const { description } = pkg
  const data = await loopInput(input('请输入一句说明，作为脚手架功能的描述：', description))
  return data
}
