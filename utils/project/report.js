const request = require('../request')

function report(context) {
  try {
    request.post(``, {})
  } catch (e) {}
}

module.exports = report
