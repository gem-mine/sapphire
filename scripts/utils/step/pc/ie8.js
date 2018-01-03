const inquirer = require('inquirer')

function run() {
  return inquirer.prompt({
    type: 'list',
    name: 'ie8',
    message: '是否支持 IE8 浏览器:',
    choices: [
      {
        name: '支持',
        value: true
      },
      {
        name: '不支持',
        value: false
      }
    ]
  })
}

module.exports = run
