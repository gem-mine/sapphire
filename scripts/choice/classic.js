const { CLASSIC_REPO, CUSTOM } = require('../../constant/core')
const { getUIName } = require('gem-mine-helper')

module.exports = function (context) {
  const { ui } = context
  const choices = [
    {
      name: '自定义代码骨架',
      value: CUSTOM
    },
    {
      name: '不，谢谢',
      value: false
    }
  ]
  if (ui) {
    choices.unshift({
      name: '使用管理后台代码骨架',
      value: {
        git: CLASSIC_REPO.ADMIN,
        branch: getUIName(ui)
      }
    })
  }
  return {
    type: 'list',
    name: 'classic',
    message: '是否使用经典代码骨架:',
    choices,
    default: false
  }
}
