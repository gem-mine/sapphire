const j = require('jscodeshift')
const rd = require('rd')
const fs = require('fs-extra')
const { log } = require('@gem-mine/sapphire-helper')
const parser = require('./parser')

module.exports = function (root) {
  fixIndexFile(root)

  log.info('将依赖 cat-eye 转换为 @gem-mine/durex，请求库为 @gem-mine/request, immutable 操作为 @gem-mine/immutable')
  rd.eachFilterSync(`${root}/src`, /\.jsx?$/, function (file) {
    transform(file)
  })
}

function fixIndexFile(root) {
  const path = `${root}/src/global`
  const src = `${path}/cat-eye.js`
  const dist = `${path}/durex.js`
  const indexFile = `${root}/src/index.js`
  let content = fs.readFileSync(indexFile).toString()
  if (fs.existsSync(src)) {
    fs.moveSync(src, dist, { overwrite: true })
  }
  const catEyeConfigFile = `'global/cat-eye'`
  content = content.replace(catEyeConfigFile, `'global/durex'`)

  const patchFile = `import 'global/util/react-patch'`
  if (content.indexOf(patchFile) === -1) {
    const reactContent = /import\s+React\s+from\s+'react'/
    const match = content.match(reactContent)
    if (match) {
      const position = match[0].length + match.index
      content = content.slice(0, position) + `\n${patchFile}` + content.slice(position)
    }
  }
  fs.writeFileSync(indexFile, content)
}

function transform(file) {
  const content = fs.readFileSync(file).toString()
  const ast = parser(content)

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
      log.info(`\t 处理文件 ${file} 成功`)
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
