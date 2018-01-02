const inquirer = require('inquirer');
const constant = require('../../constant');

function run() {
  return inquirer.prompt({
    type: 'list',
    name: 'ui',
    message: '选择 UI 组件库:',
    choices: [
      {
        name: 'fish mobile（暂未支持）',
        value: constant.FISH_MOBILE
      },
      {
        name: 'ant design mobile（仅供学习使用）',
        value: constant.ANTD_MOBILE
      },
      {
        name: '无',
        value: ''
      }
    ]
  });
}

module.exports = run;
