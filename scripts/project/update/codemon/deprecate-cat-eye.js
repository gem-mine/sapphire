const j = require('jscodeshift')
const rd = require('rd')
const fs = require('fs-extra')
const { log } = require('@gem-mine/sapphire-helper')

module.exports = function (root) {
  const path = `${root}/src/global`
  const src = `${path}/cat-eye.js`
  const dist = `${path}/durex.js`
  if (fs.existsSync(src)) {
    fs.moveSync(src, dist, { overwrite: true })
  }

  log.info('将依赖 cat-eye 转换为 @gem-mine/durex，请求库为 @gem-mine/request, immutable 操作为 @gem-mine/immutable')
  rd.eachFilterSync(`${root}/src`, /\.jsx?$/, function (file) {
    transform(file)
  })
}

function transform(file) {
  const content = fs.readFileSync(file).toString()
  const ast = j(content)

  const requestArr = []
  const immutableArr = []

  let cursor = ast
    .find(j.ImportDeclaration, {
      source: {
        value: 'cat-eye'
      }
    })
    .replaceWith(path => {
      const { specifiers } = path.value
      const left = specifiers.filter(item => {
        if (item.imported) {
          const { name } = item.imported
          if (name === 'request') {
            requestArr.push(j.importDefaultSpecifier(item.local || item.imported))
            return false
          } else if (['getIn', 'setIn', 'ZI'].indexOf(name) > -1) {
            immutableArr.push(item)
            return false
          }
        }

        return true
      })

      if (left.length) {
        return j.importDeclaration(left, j.literal('@gem-mine/durex'), path.value.importKind)
      }
    })

  requestArr.forEach(item => {
    cursor = cursor.insertAfter(j.importDeclaration([item], j.literal('@gem-mine/request'), 'value'))
  })

  if (immutableArr.length) {
    cursor.insertAfter(j.importDeclaration(immutableArr, j.literal('@gem-mine/immutable'), 'value'))
  }

  ast
    .find(j.ImportDeclaration, {
      source: {
        value: 'zero-immutable'
      }
    })
    .replaceWith(path => {
      return j.importDeclaration(path.value.specifiers, j.literal('@gem-mine/immutable'), path.value.importKind)
    })

  fs.writeFileSync(file, ast.toSource())
}
