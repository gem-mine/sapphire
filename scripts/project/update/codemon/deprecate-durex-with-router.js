const j = require('jscodeshift')
const rd = require('rd')
const fs = require('fs-extra')
const { log } = require('@gem-mine/sapphire-helper')
const parser = require('./parser')

module.exports = function (root) {
  log.info('将依赖 @gem-mine/durex 中的路由能力转换为 @gem-mine/durex-router')
  rd.eachFilterSync(`${root}/src`, /\.jsx?$/, function (file) {
    transform(file)
  })
}

function transform(file) {
  const content = fs.readFileSync(file).toString()
  const ast = parser(content)

  const routerArr = []

  let cursor = ast
    .find(j.ImportDeclaration, {
      source: {
        value: '@gem-mine/durex'
      }
    })
    .replaceWith(path => {
      const { specifiers } = path.value
      const left = specifiers.filter(item => {
        if (item.imported) {
          const { name } = item.imported
          if (['urlFor', 'router', 'Routes', 'Router', 'Route', 'Link', 'NavLink', 'Switch', 'Redirect', 'Prompt', 'withRouter', 'queryString', 'pathToRegexp'].indexOf(name) > -1) {
            routerArr.push(item)
            return false
          }
        }
        return true
      })

      if (left.length) {
        return j.importDeclaration(left, j.literal('@gem-mine/durex'), path.value.importKind)
      }
      log.info(`\t 处理文件 ${file} 成功`)
    })

  routerArr.forEach(item => {
    cursor = cursor.insertAfter(j.importDeclaration([item], j.literal('@gem-mine/durex-router'), 'value'))
  })

  fs.writeFileSync(file, ast.toSource())
}
