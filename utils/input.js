const { prompt } = require('inquirer')

exports.input = function (message, defaultValue, name = 'input') {
  return {
    type: 'input',
    name,
    message,
    default: defaultValue
  }
}

exports.loopInput = async function loopInput(choice, rule) {
  let flag = true
  let input
  while (flag) {
    ;({ input } = await prompt(choice))
    if (input) {
      input = input.trim()
    }
    if (rule) {
      if (rule.test) {
        flag = !rule.test(input)
      } else {
        flag = !rule(input)
      }
    } else {
      flag = false
    }
  }
  return input
}
