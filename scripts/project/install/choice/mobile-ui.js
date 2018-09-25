const { genIndex } = require('../../../../utils/choice')
const { FISH_MOBILE, ANTD_MOBILE } = require('../../../../constant/ui')

module.exports = function () {
  return {
    type: 'list',
    name: 'ui',
    message: '选择 UI 组件库:',
    choices: genIndex([
      {
        name: 'fish mobile（需要在内网）',
        value: FISH_MOBILE
      },
      {
        name: 'ant design mobile',
        value: ANTD_MOBILE
      },
      {
        name: '无',
        value: ''
      }
    ])
  }
}
