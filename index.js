#!/usr/bin/env node

const program = require('commander')
const os = require('os')
const { checkGit, checkNodeVersion, checkNpmRegistry } = require('./utils/env')
const { checkCliVersion } = require('./utils/project/version')
const regInstallScript = require('./scripts/project/install')
const regUpdateScript = require('./scripts/project/update')
const pkg = require('./package.json')
const context = require('./context')
const { EXIT_CODE } = require('./constant/core')
const { exec } = require('gem-mine-helper')
const { gitInit } = require('./utils/project/git')
const { saveInfo } = require('./utils/project/info')
const { printSuccess, printError } = require('./utils/project/print')

// 检查环境
checkNodeVersion()
checkGit()
checkNpmRegistry()

// 一些环境信息收集
context.set({
  cli_version: pkg.version,
  node_version: exec(`node -v`),
  npm_version: exec(`npm -v`),
  system: os.type(),
  user: exec(`git config user.name`),
  email: exec(`git config user.email`)
})
program.version(pkg.version)

// 项目初始化脚本
regInstallScript(program, pkg)
// 项目升级脚本
regUpdateScript(program, pkg)

program.parse(process.argv)

process.on('exit', function (code) {
  if (
    Object.keys(EXIT_CODE)
      .map(function (key) {
        return EXIT_CODE[key]
      })
      .includes(code)
  ) {
    if (code === EXIT_CODE.SUCCESS) {
      saveInfo(context) // 保存信息
      gitInit(context) // git init
      printSuccess(context) // success
      // report
      console.log(context)
    } else if (code === EXIT_CODE.ERROR) {
      printError(context)
      // report
    } else {
    }
    checkCliVersion(context, pkg)
  }
})
