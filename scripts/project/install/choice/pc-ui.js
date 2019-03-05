const { genIndex } = require('../../../../utils/choice')
const { FISH, ANTD } = require('../../../../constant/ui')

module.exports = function () {
  const choices = [
    {
      name: 'fish（需要在内网）',
      value: FISH
    },
    {
      name: 'ant design',
      value: ANTD
    },
    {
      name: '无',
      value: ''
    }
  ]
  return {
    type: 'list',
    name: 'ui',
    message: '选择 UI 组件库:',
    choices: genIndex(choices)
  }
}
