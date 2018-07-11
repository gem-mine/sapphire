const { CLASSIC_REPO, CUSTOM } = require('../../constant/core')
const { getUIName } = require('../../utils/project/sdp')

module.exports = function (context) {
  return {
    type: 'list',
    name: 'classic',
    message: '是否使用经典代码骨架:',
    choices: [
      {
        name: '使用管理后台代码骨架',
        value: {
          git: CLASSIC_REPO.ADMIN,
          branch: getUIName(context.ui)
        }
      },
      {
        name: '自定义代码骨架',
        value: CUSTOM
      },
      {
        name: '不，谢谢',
        value: false
      }
    ],
    default: false
  }
}
