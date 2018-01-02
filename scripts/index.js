#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const os = require('os');
const pkg = require('../package.json');
const utils = require('./utils');
const inquirer = require('inquirer');
const constant = require('./utils/constant');

utils.initCheck();
let root, projectName;
const _cache = {};

program.version(pkg.version);
program
  .command('update')
  .description('升级当前工程')
  .action(function() {
    root = process.cwd();
    const configPath = path.join(root, '.gem-mine');
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red(`\n没有找到 .gem-mine 配置文件，无法为你提供脚手架升级\n请确保在项目根目录下进行升级\n`));
      process.exit(1);
    }

    checkGoon(`对项目使用的 gem-mine 脚手架进行升级?`, true).then(function(params) {
      if (params.goon) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        utils.updateProject(root, config.name, config);
      } else {
        console.log(`${chalk.red('\n  您主动终止了操作')}`);
        process.exit(1);
      }
    });
  });
program
  .command('*')
  .description('创建工程，请输入工程名')
  .action(function(name) {
    root = path.resolve(name); // 新建的项目目录完整路径
    projectName = path.basename(root); // 工程名称
    _cache.root = root;
    _cache.projectName = projectName;

    // 目录已经存在
    if (fs.existsSync(root)) {
      checkGoon(`${chalk.red(root)} 已经存在，是否继续进行?`, false).then(function(params) {
        if (params.goon) {
          run(root, projectName, _cache);
        } else {
          console.log(`${chalk.red('\n  您主动终止了操作')}`);
          process.exit(1);
        }
      });
    } else {
      run(root, projectName, _cache);
    }
  });

program.parse(process.argv);

function checkGoon(msg, defaultValue) {
  return inquirer.prompt({
    type: 'list',
    name: 'goon',
    message: msg,
    choices: [
      {
        name: '继续进行（和脚手架相关文件将会被覆盖处理）',
        value: true
      },
      {
        name: '不，谢谢',
        value: false
      }
    ],
    default: defaultValue
  });
}

function run(root, projectName, _cache) {
  utils.step
    .platform()
    .then(function(data) {
      _cache.platform = data.platform;
      if (data.platform === constant.MOBILE) {
        return utils.step.mobile.ui().then(function(data) {
          if (data.ui) {
            if (data.ui === constant.FISH_MOBILE) {
              console.log(chalk.red(`该 UI 库尚未完成，想贡献力量？请联系 ${constant.EMAIL}`));
              process.exit(1);
            }
            _cache.ui = data.ui;
          }
        });
      } else if (data.platform === constant.PC) {
        return utils.step.pc.ie8().then(function(data) {
          _cache.ie8 = data.ie8;
          return utils.step.pc.ui(data.ie8).then(function(data) {
            if (data.ui) {
              _cache.ui = data.ui;
              return utils.step.pc.classic().then(function(data) {
                _cache.classic = data.classic;
              });
            }
          });
        });
      } else {
        console.error(`platform 选择错误`);
        process.exit(1);
      }
    })
    .then(function() {
      utils.createProject(root, projectName, _cache); // 创建工程目录
      utils.report(_cache);
    })
    .catch(function(e) {
      _cache.error = e.message;
      console.error(`${chalk.yellow('遇到了错误，如果您无法解决问题，请尝试联系 ')}${chalk.red.bold(constant.EMAIL)}`);
      console.error(e);
      utils.report(_cache);
    });
}
