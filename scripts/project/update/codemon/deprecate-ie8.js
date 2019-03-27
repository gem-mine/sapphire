const j = require('jscodeshift')
const fs = require('fs-extra')
const { log } = require('@gem-mine/sapphire-helper')
const parser = require('./parser')

module.exports = function (root) {
  const file = `${root}/config/constant.js`
  if (fs.existsSync(file)) {
    transform(file)
    log.info('去除 config/constant.js 中 SUPPORT_IE8 常量')
  }

  const index = `${root}/public/index.html`
  if (fs.existsSync(index)) {
    updateIndexHTML(index)
  }
}

function transform(file) {
  const content = fs.readFileSync(file).toString()
  const ast = parser(content)

  let prev = []
  let next = []
  ast
    .find(j.ExpressionStatement, {
      expression: {
        left: {
          type: 'MemberExpression',
          property: {
            name: 'SUPPORT_IE8'
          }
        }
      }
    })
    .replaceWith(path => {
      prev = path.value.leadingComments
      next = path.value.trailingComments
    })
    .remove()

  if (prev.length || next.length) {
    ast.find(j.Program).get('body', 0).node.comments = [...prev, ...next]
  }

  fs.writeFileSync(file, ast.toSource())
}

function updateIndexHTML(file) {
  let content = fs.readFileSync(file).toString()
  content = content.replace(/<!--\[\s*if\s+lte\s+IE\s+9\]>.+<!\[\s*endif\s*\]-->/g, '')
  fs.writeFileSync(file, content)
}
