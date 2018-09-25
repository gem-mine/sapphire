const context = require('../../../context')
const nativeStep = require('./native')
const classicStep = require('./classic')

module.exports = async function (pkg) {
  const { native, from_id: fromId } = context
  if (fromId) {
    await classicStep(context)
  } else {
    if (native) {
      await nativeStep(context, pkg)
    }
  }
}
