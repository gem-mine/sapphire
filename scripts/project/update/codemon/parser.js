const babylon = require('babylon')
const j = require('jscodeshift')
const fs = require('fs-extra')

const defaultOptions = {
  sourceType: 'module',
  allowImportExportEverywhere: true,
  codeFrame: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  ranges: true,
  tokens: true,
  plugins: [
    'flow',
    'jsx',
    'estree',
    'asyncFunctions',
    'asyncGenerators',
    'classConstructorCall',
    'classProperties',
    'decorators',
    'doExpressions',
    'exponentiationOperator',
    'exportExtensions',
    'functionBind',
    'functionSent',
    'objectRestSpread',
    'trailingFunctionCommas',
    'dynamicImport',
    'numericSeparator',
    'optionalChaining',
    'importMeta',
    'classPrivateProperties',
    'bigInt',
    'optionalCatchBinding'
  ]
}

module.exports = function (content) {
  const ast = j(content, {
    parser: {
      parse(code) {
        return babylon.parse(code, defaultOptions)
      }
    }
  })
  return ast
}
