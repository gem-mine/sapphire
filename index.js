#!/usr/bin/env node

const program = require('commander')
const os = require('os')
const { checkGit, checkNodeVersion } = require('./utils/env')
const regInstallScript = require('./scripts/project/install')
const regUpdateScript = require('./scripts/project/update')
const pkg = require('./package.json')
const context = require('./context')
const { exec, autoSetRegistry, log } = require('gem-mine-helper')
const { listen } = require('./utils/project/report')

// 注册退出的事件监听
listen()

// 检查环境再开始执行
checkNodeVersion()
checkGit()

// 自动切换 npm 源
autoSetRegistry()

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
