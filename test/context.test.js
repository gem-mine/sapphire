const assert = require('assert')
const context = require('../context')

describe('context test', function () {
  it('简单 get/set', function () {
    context.set('name', 'tom')
    assert.equal('tom', context.get('name'))
  })
})
