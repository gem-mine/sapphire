const _request = require('sync-request')
const request = {}
const methods = ['get', 'post', 'put', 'delete', 'head']

methods.forEach(function (method) {
  request[method] = function (url, options) {
    return _request(method.toUpperCase(), url, options)
  }
})

module.exports = request
