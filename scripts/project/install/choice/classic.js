const { genIndex } = require('../../../../utils/choice')
const { CUSTOM_KEY } = require('../../../../constant/core')
const service = require('../../../../utils/project/service')

async function getChoices() {
  let choices
  try {
    const data = await service.getClassicList()
    if (Array.isArray(data) && data[0].value) {
      choices = data
    } else {
      choices = []
    }
  } catch (err) {
    choices = []
  }

  choices.push({
    name: '输入自定义代码骨架',
    value: CUSTOM_KEY
  })
  return choices
}

module.exports = async function () {
  const choices = await getChoices()
  return {
    type: 'list',
    name: 'classic',
    message: '请选择经典脚手架',
    choices: genIndex(choices)
  }
}
