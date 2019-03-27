const j = require('jscodeshift')
const rd = require('rd')
const fs = require('fs-extra')
const { log } = require('@gem-mine/sapphire-helper')
const parser = require('./parser')
const { FISH } = require('../../../../constant/ui')

module.exports = function (root) {
  log.info(`将错误引入 ${FISH} 转换为 fish，避免全包引入问题`)
  rd.eachFilterSync(`${root}/src`, /\.jsx?$/, function (file) {
    transform(file)
  })
}

function transform(file) {
  const content = fs.readFileSync(file).toString()
  const ast = parser(content)

  ast
    .find(j.ImportDeclaration, {
      source: {
        value: FISH
      }
    })
    .replaceWith(path => {
      log.info(`\t发现错误书写文件 ${file}`)
      return j.importDeclaration(path.value.specifiers, j.literal('fish'), path.value.importKind)
    })

  fs.writeFileSync(file, ast.toSource())
}
