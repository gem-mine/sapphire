module.exports = function (message, shouldGoon) {
  return {
    type: 'list',
    name: 'goon',
    message,
    choices: [
      {
        name: '继续进行（和脚手架相关文件将会被覆盖处理，请确保文件已经 git commit）',
        value: true
      },
      {
        name: '不，谢谢',
        value: false
      }
    ],
    default: shouldGoon
  }
}
