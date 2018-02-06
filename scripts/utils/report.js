const request = require('request')
const os = require('os')
const helper = require('./helper')
const url = 'http://cors.zmei.me/google'

function report(data, isUpdate) {
  data.author = helper.exec('git config user.name', false)
  data.email = helper.exec('git config user.email', false)

  const system = {}
  const arr = ['hostname', 'type', 'platform', 'arch', 'release']
  arr.forEach(function (key) {
    if (os[key]) {
      system[key] = os[key]()
    }
  })
  data.system = system
  data.node = process.version
  data.isUpdate = isUpdate

  request.post(url, {
    json: { data }
  })
}

module.exports = report
