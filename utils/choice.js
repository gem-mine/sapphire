const genIndex = function (choices) {
  return choices.map(function (item, index) {
    item.name = `${index + 1}. ${item.name}`
    return item
  })
}
exports.genIndex = genIndex

exports.goon = function ({ message, defaults = false, tip = false }) {
  return {
    type: 'list',
    name: 'goon',
    message,
    choices: genIndex([
      {
        name: `是的 ${tip ? '（和脚手架相关文件将会被覆盖处理，请确保文件已经 git commit）' : ''}`,
        value: true
      },
      {
        name: '不，谢谢',
        value: false
      }
    ]),
    default: defaults
  }
}
