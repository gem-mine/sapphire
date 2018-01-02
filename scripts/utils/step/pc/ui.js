const inquirer = require('inquirer');
const constant = require('../../constant');
const FISH = constant.FISH;
const ANTD = constant.ANTD;

function run(ie8) {
  const choices = [
    {
      name: 'fish（需要在 ND 内网）',
      value: FISH
    }
  ];
  if (!ie8) {
    choices.push({
      name: 'ant design（仅供实验使用）',
      value: ANTD
    });
  }
  choices.push({
    name: '无',
    value: ''
  });
  return inquirer.prompt({
    type: 'list',
    name: 'ui',
    message: '选择 UI 组件库:',
    choices: choices
  });
}

module.exports = run;
