const validateProjectName = require('validate-npm-package-name')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const { EXIT_CODE } = require('../../constant/core')

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach(error => {
      console.error(chalk.red(`    *  ${error}`))
    })
  }
}

function checkProjectName(projectName) {
  const validationResult = validateProjectName(projectName)
  // 包命名非法
  if (!validationResult.validForNewPackages) {
    console.error(`工程名 ${chalk.red(projectName)} 非法:`)
    printValidationResults(validationResult.errors)
    printValidationResults(validationResult.warnings)
    process.exit(EXIT_CODE.PROJECT_NAME_INVALID)
  }
}

function cleanBuild(context) {
  const { root } = context
  try {
    const config = require(path.resolve(root, 'config/webpack.js'))
    let buildPath = config.buildPath || path.resolve(root, 'build')
    fs.removeSync(buildPath)
  } catch (e) {}
}

function genId() {
  return `${Date.now()}${String.fromCharCode(Math.ceil(Math.random() * (90 - 65)) + 65)}${Math.ceil(
    Math.random() * Math.pow(10, 10)
  )}`
}

exports.checkProjectName = checkProjectName
exports.cleanBuild = cleanBuild
exports.genId = genId
