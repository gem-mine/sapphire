const j = require('jscodeshift')
const fs = require('fs-extra')
const { log, getIn } = require('@gem-mine/sapphire-helper')
const parser = require('./parser')

module.exports = function (root) {
  const file = `${root}/src/global/request.js`
  if (fs.existsSync(file)) {
    transform(file)
    log.info('处理 src/global/request.js 成功')
  }
}

function transform(file) {
  const content = fs.readFileSync(file).toString()
  const ast = parser(content)

  // 头部加入全局变量声明
  const comment = '/* global ENV, DEBUG */'
  if (content.indexOf(comment)) {
    ast.get().node.program.body.unshift(comment)
  }

  // 删除 global/util/sys 引入
  ast
    .find(j.ImportDeclaration, {
      source: {
        value: 'global/util/sys'
      }
    })
    .remove()

  // 删除 getCurrentProxyConfig
  ast
    .find(j.CallExpression, {
      callee: {
        name: 'getCurrentProxyConfig'
      }
    })
    .remove()

  // 修改 request.init 的参数
  const proxyConfig = getIn(
    ast
      .find(j.ImportDeclaration, {
        source: {
          value: 'config/proxy'
        }
      })
      .get(),
    'value.specifiers.0.local.name'
  )

  if (proxyConfig) {
    ast
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            name: 'request'
          },
          property: {
            name: 'init'
          }
        }
      })
      .replaceWith(path => {
        path.value.arguments = [
          proxyConfig,
          `{
  env: ENV,
  wds: DEBUG
}`
        ]
        return path.value
      })
  }

  fs.writeFileSync(file, ast.toSource())
}
