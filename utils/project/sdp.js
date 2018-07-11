const { SDP_PREFIX } = require('../../constant/ui')

function getUIName(ui) {
  if (ui.indexOf(SDP_PREFIX) === 0) {
    return ui.replace(SDP_PREFIX, '')
  }
  return ui
}

exports.getUIName = getUIName
