const { genIndex } = require('../../../../utils/choice')
const { BASIC_VALUES, BASIC_KEY } = require('../../../../constant/core')

module.exports = function () {
  return {
    type: 'list',
    name: BASIC_KEY,
    message: '请选择脚手架类型',
    choices: genIndex([
      {
        name: '原生 gem-mine 脚手架',
        value: BASIC_VALUES.NATIVE
      },
      {
        name: '经典脚手架',
        value: BASIC_VALUES.CLASSIC
      }
    ])
  }
}
