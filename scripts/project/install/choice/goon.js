const { goon } = require('../../../../utils/choice')

module.exports = function () {
  return goon({
    message: '选择完毕，准备进行项目创建',
    defaults: true
  })
}
