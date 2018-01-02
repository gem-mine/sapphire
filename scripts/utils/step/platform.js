const inquirer = require('inquirer');

function run() {
  return inquirer.prompt({
    type: 'list',
    name: 'platform',
    message: '请选择项目运行的平台类型:',
    choices: [
      {
        name: 'PC 端',
        value: 'pc'
      },
      {
        name: '移动端',
        value: 'mobile'
      }
    ]
  });
}

module.exports = run;
