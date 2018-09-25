const { input, loopInput } = require('../../../../utils/input')

module.exports = async function (cache) {
  const { token } = cache
  const data = await loopInput(input('请输入 token 验证（首次发布请直接回车）：', token))
  return data
}
