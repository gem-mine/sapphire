const { genIndex } = require('../../../../utils/choice')
const { PC, MOBILE } = require('../../../../constant/core')

module.exports = function () {
  return {
    type: 'list',
    name: 'platform',
    message: '请选择项目运行的平台类型:',
    choices: genIndex([
      {
        name: 'PC 端',
        value: PC
      },
      {
        name: '移动端',
        value: MOBILE
      }
    ])
  }
}
