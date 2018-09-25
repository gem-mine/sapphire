const { genIndex } = require('../../../../utils/choice')
const { FISH, ANTD } = require('../../../../constant/ui')

module.exports = function (ie8) {
  const choices = [
    {
      name: 'fish（需要在内网）',
      value: FISH
    }
  ]
  if (!ie8) {
    choices.push({
      name: 'ant design',
      value: ANTD
    })
  }
  choices.push({
    name: '无',
    value: ''
  })
  return {
    type: 'list',
    name: 'ui',
    message: '选择 UI 组件库:',
    choices: genIndex(choices)
  }
}
