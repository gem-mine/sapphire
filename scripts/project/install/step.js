const { prompt } = require('inquirer')
const nativeStep = require('./native')
const classicStep = require('./classic')
const { BASIC_VALUES, BASIC_KEY } = require('../../../constant/core')

const getBasicConfig = require('./choice/basic')

module.exports = async function () {
  const data = await prompt(getBasicConfig())
  const choice = data[BASIC_KEY]

  if (choice === BASIC_VALUES.NATIVE) {
    return nativeStep()
  } else {
    return classicStep()
  }
}
