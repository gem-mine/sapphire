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

  log.info('将依赖 cat-eye 转换为 @gem-mine/durex，请求库为 @gem-mine/request')
  rd.eachFilterSync(`${root}/src`, /\.jsx?$/, function (file) {
    transform(file)
  })
}

function transform(file) {
  const content = fs.readFileSync(file).toString()
  const ast = j(content)

  let arr = []

  let cursor = ast
    .find(j.ImportDeclaration, {
      source: {
        value: 'cat-eye'
      }
    })
    .replaceWith(path => {
      const { specifiers } = path.value
      const left = specifiers.filter(item => {
        if (item.imported && item.imported.name === 'request') {
          arr.push(j.importDefaultSpecifier(item.local || item.imported))
          return false
        }
        return true
      })
      log.info(`\t处理 ${file} 成功`)

      return j.importDeclaration(left, j.literal('@gem-mine/durex'), path.value.importKind)
    })

  arr.forEach(item => {
    cursor = cursor.insertAfter(j.importDeclaration([item], j.literal('@gem-mine/request'), 'value'))
  })

  fs.writeFileSync(file, ast.toSource())
}
