const { input, loopInput } = require('../../../../utils/input')
const { DEFAULT_BRANCH } = require('../../../../constant/core')

module.exports = async function (cache) {
  const { branch } = cache
  const data = await loopInput(input('请输入发布的分支：', branch || DEFAULT_BRANCH), function (result) {
    return !!result
  })
  return data
}
