const inquirer = require('inquirer');

function run() {
  return inquirer.prompt({
    type: 'list',
    name: 'classic',
    message: '是否使用经典后台代码骨架:',
    choices: [
      {
        name: '使用',
        value: true
      },
      {
        name: '不，谢谢',
        value: false
      }
    ]
  });
}

module.exports = run;
