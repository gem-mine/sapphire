const PRIVATE_KEY = ['set', 'get', 'del']

const context = {
  id: `${Date.now()}${String.fromCharCode(Math.ceil(Math.random() * (90 - 65)) + 65)}${Math.ceil(
    Math.random() * Math.pow(10, 10)
  )}`
}

function defineProperty(object, key, fn) {
  Object.defineProperty(object, key, {
    enumerable: false,
    writable: false,
    configurable: false,
    value: fn
  })
}

defineProperty(context, 'set', function (key, value) {
  if (PRIVATE_KEY.includes(key)) {
    throw new Error(`以下 key 受保护：${PRIVATE_KEY.join('、')}，请勿使用`)
  }
  if (arguments.length === 1) {
    Object.assign(context, key)
  } else {
    context[key] = value
  }
})

defineProperty(context, 'get', function (key) {
  if (PRIVATE_KEY.includes(key)) {
    return null
  }
  return context[key]
})

defineProperty(context, 'del', function (...keys) {
  keys.forEach(function (key) {
    if (typeof key === 'string' && !PRIVATE_KEY.includes(key)) {
      delete context[key]
    }
  })
})

module.exports = context
