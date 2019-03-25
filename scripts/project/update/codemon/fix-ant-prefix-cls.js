const rd = require('rd')
const fs = require('fs-extra')
const { log } = require('@gem-mine/sapphire-helper')

module.exports = function (root) {
  log.info('将 css/less/sass 文件中的样式 .ant- 前缀 修改为 .fish- ')
  rd.eachFilterSync(`${root}/src`, /\.(?:css|less|scss)$/, function (file) {
    transform(file)
  })
}

function transform(file) {
  let content = fs.readFileSync(file).toString()
  if (content.indexOf('.ant-') > -1) {
    content = content.replace(/\.ant-/g, '.fish-')
    fs.writeFileSync(file, content)
    log.info(`\t 处理文件 ${file} 成功`)
  }
}
