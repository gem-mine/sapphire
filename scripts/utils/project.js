const validateProjectName = require('validate-npm-package-name');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const figlet = require('figlet');
const helper = require('./helper');
const constant = require('./constant');

const exec = helper.exec;

function create(root, projectName, params) {
  checkProjectName(root, projectName, params);
  cloneFromGit(root, projectName, params);
  installClassic(root, projectName, params);
  installDeps(root, projectName, params);
  updatePackageJson(root, projectName, params);
  saveInfo(root, projectName, params);
  gitInit(root, projectName, params);
  printSuccess(root, projectName, params);
}

function update(root, projectName, params) {
  cloneFromGit(root, projectName, params, true);
  printSuccess(root, projectName, params, true);
}

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach(error => {
      console.error(chalk.red(`    *  ${error}`));
    });
  }
}

function checkProjectName(root, projectName, params) {
  const validationResult = validateProjectName(projectName);
  // 包命名非法
  if (!validationResult.validForNewPackages) {
    console.error(`工程名 ${chalk.red(projectName)} 非法:`);
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }
}

function cloneFromGit(root, projectName, params, isUpdate) {
  const shadowPath = fs.mkdtempSync(path.join(os.tmpdir(), 'gem-mine-'));
  if (fs.existsSync(shadowPath)) {
    fs.removeSync(shadowPath);
  }
  exec(`git clone ${constant.REPO} ${shadowPath} --depth=1 --no-single-branch`);
  let branch;
  if (params.platform === constant.MOBILE) {
    branch = 'mobile';
  } else {
    if (params.ie8) {
      branch = 'ie8';
    } else {
      branch = 'morden';
    }
  }
  exec(`git checkout master-${branch}`, { cwd: shadowPath, silent: true });
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }
  fs.removeSync(path.join(shadowPath, '.git'));
  fs.removeSync(path.join(shadowPath, 'package-lock.json'));
  fs.removeSync(path.join(shadowPath, 'manifest.json'));

  let ui = params.ui;
  const uiExamplePath = path.join(shadowPath, 'src/components/examples/ui');
  if (ui) {
    if (ui.indexOf(constant.SDP_PREFIX) === 0) {
      ui = ui.replace(constant.SDP_PREFIX, '');
    }
    fs.copySync(path.join(uiExamplePath, 'tpl', ui, 'index.jsx'), path.join(uiExamplePath, 'index.jsx'));
  }
  fs.removeSync(path.join(uiExamplePath, 'tpl'));

  if (isUpdate) {
    fs.removeSync(path.join(shadowPath, 'package.json'));
  }
  fs.copySync(shadowPath, root);
  fs.removeSync(shadowPath);
}

function installClassic(root, projectName, params) {
  let ui = params.ui;

  if (ui) {
    if (ui === constant.FISH || ui === constant.ANTD) {
      if (ui.indexOf(constant.SDP_PREFIX) === 0) {
        ui = ui.replace(constant.SDP_PREFIX, '');
      }
      const branch = `${ui}-admin`;
      const shadowPath = fs.mkdtempSync(path.join(os.tmpdir(), 'classic-'));
      if (fs.existsSync(shadowPath)) {
        fs.removeSync(shadowPath);
      }
      exec(`git clone ${constant.CLASSIC_REPO} ${shadowPath} --depth=1 --no-single-branch`);

      exec(`git checkout ${branch}`, { cwd: shadowPath, silent: true });

      fs.removeSync(path.join(shadowPath, '.git'));
      fs.removeSync(path.join(shadowPath, '.gitignore'));
      fs.copySync(shadowPath, root);
      fs.removeSync(shadowPath);
    }
  }
}

function isGitRepo(root) {
  let flag = 20;
  let p = root;
  let s;
  let existGit = false;
  while (flag > 0) {
    existGit = fs.existsSync(path.join(p, '.git'));
    if (existGit) {
      existGit = true;
      break;
    }
    s = path.dirname(p);
    if (s === p) {
      break;
    }
    p = s;
    flag -= 1;
  }
  return existGit;
}

function gitInit(root, projectName, params) {
  if (!isGitRepo(root)) {
    exec(`git init`, { cwd: root, silent: true });
    exec(`git add .`, { cwd: root, silent: true });
    const msg = 'init by gem-mine 👻';
    exec(`git commit -m "${msg}"`, { cwd: root, silent: true });
    console.log(`\ngit ${msg}`);
  }
}

function installDeps(root, projectName, params) {
  let v;
  if (params.ie8) {
    v = '0.14.9';
  } else {
    if (params.ui === constant.FISH) {
      v = '^15.0.0';
    } else {
      v = 'latest';
    }
  }
  exec(`npm i react@${v} react-dom@${v} --save --loglevel=error`, { cwd: root });
  if (!params.ie8) {
    exec(`npm i prop-types --save --loglevel=error`, { cwd: root });
  }

  const ui = params.ui;
  if (ui) {
    if (ui.indexOf(constant.SDP_PREFIX) === 0) {
      exec(`npm i ${ui} --save --registry=http://registry.npm.sdp.nd --loglevel=error`, { cwd: root });
    } else {
      exec(`npm i ${ui} --save --loglevel=error`, { cwd: root });
    }

    if (ui === constant.ANTD_MOBILE) {
      exec(`npm i rc-form --save`, { cwd: root });
    }

    updateBabelrc(root, ui);
  }
  exec(`npm i --loglevel=error`, { cwd: root });
}

function updateBabelrc(root, ui) {
  let uiLib;
  if (ui === constant.FISH) {
    uiLib = 'fish';
  } else if (ui === constant.ANTD || ui === constant.ANTD_MOBILE) {
    uiLib = ui;
  }
  if (uiLib) {
    const babelrcPath = path.join(root, '.babelrc');
    const babelrc = JSON.parse(fs.readFileSync(babelrcPath, 'utf8'));
    babelrc.plugins.push(['import', { libraryName: uiLib, libraryDirectory: 'lib', style: true }]);
    fs.writeFileSync(babelrcPath, JSON.stringify(babelrc, null, 2));
  }
}

function updatePackageJson(root, projectName, params) {
  const pkgPath = path.join(root, 'package.json');
  const pkg = require(pkgPath);
  pkg.name = projectName;
  pkg.name = fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

function printSuccess(root, projectName, params, isUpdate) {
  console.log('\n');
  console.log(
    chalk.green.bgBlack.bold(
      figlet.textSync('        gem   mine        ', {
        horizontalLayout: 'fitted'
      })
    )
  );
  console.log('\n');
  console.log(chalk.cyan(constant.SAYINGS[Math.floor(Math.random() * constant.SAYINGS.length)]));
  console.log(chalk.magenta(`${constant.WISH}\n`));
  const ui = params.ui;
  let uiDoc = '';
  if (ui) {
    uiDoc = constant.UI_DOC[ui];
    if (uiDoc) {
      uiDoc = `\n  * ${ui}: ${uiDoc}`;
    }
  }

  let tip;
  if (isUpdate) {
    tip = '你已经完成了脚手架的升级';
  } else {
    tip = `你已经完成了项目的初始化。快速开始项目只需简单的两步：
  1. cd ${projectName}
  2. npm start
`;
  }

  console.log(
    chalk.green(`
${tip}
更多帮助参看文档：
  * gem-mine: ${constant.GEM_MINE_DOC} ${uiDoc}
`)
  );
}

function saveInfo(root, projectName, params) {
  const infoPath = path.join(root, '.gem-mine');
  const info = { name: projectName, platform: params.platform };
  if (params.ie8) {
    info.ie8 = true;
  }
  if (params.ui) {
    info.ui = params.ui;
  }
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
}

exports.create = create;
exports.update = update;
