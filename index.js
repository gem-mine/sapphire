#!/usr/bin/env node

const program = require('commander')
const os = require('os')
const { checkGit, checkNodeVersion } = require('./utils/env')
const regInstallScript = require('./scripts/project/install')
const regUpdateScript = require('./scripts/project/update')
const pkg = require('./package.json') // sapphire 的 package.json
const context = require('./context')
const { exec } = require('@gem-mine/sapphire-helper')

process.on('SIGINT', function () {
  console.log('用户主动终止程序')
  process.exit()
})

// 检查环境再开始执行
checkNodeVersion()
checkGit()

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
