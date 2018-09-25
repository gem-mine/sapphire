#!/usr/bin/env node

const program = require('commander')
const os = require('os')
const { checkGit, checkNodeVersion } = require('./utils/env')
const regInstallScript = require('./scripts/project/install')
const regUpdateScript = require('./scripts/project/update')
const regPublishScript = require('./scripts/project/publish')
const pkg = require('./package.json') // gem-mine 的 package.json
const context = require('./context')
const { exec } = require('gem-mine-helper')

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

// 项目发布脚本
regPublishScript(program, pkg)

program.parse(process.argv)
