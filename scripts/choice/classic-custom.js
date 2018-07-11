module.exports = {
  git: function (context) {
    return {
      type: 'input',
      name: 'git',
      message: '请输入自定义代码骨架 git 地址:'
    }
  },
  branch: function (context) {
    return {
      type: 'input',
      name: 'branch',
      message: '请输入自定义对应的分支名称（默认master）:'
    }
  }
}
