const inquirer = require('inquirer');

function run() {
  return inquirer.prompt({
    type: 'list',
    name: 'classic',
    message: '是否使用经典代码骨架:',
    choices: [
      {
        name: '使用管理后台代码骨架（仅供学习使用）',
        value: 'admin'
      },
      {
        name: '不，谢谢',
        value: false
      }
    ],
    default: false
  });
}

module.exports = run;
