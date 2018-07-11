const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const request = require('../request')
const { exec, execWithProcess, execWithSilent } = require('gem-mine-helper')
const { REPO, MOBILE, PC } = require('../../constant/core')
const { getUIName } = require('./sdp')
const { readJSON } = require('../json')

function getTemplateBranch(context) {
  const { platform, ie8 } = context
  let branch
  if (platform === PC) {
    if (ie8) {
      branch = 'ie8'
    } else {
      branch = 'morden'
    }
  } else if (platform === MOBILE) {
    branch = 'mobile'
  }
  return branch
}

/**
 * 获取 gem-mine-template 对应分支代码模板
 */
function cloneTemplate(context) {
  const { root } = context
  const shadowPath = getShadowPath('gem-mine-')

  execWithProcess(`git clone ${REPO} ${shadowPath} --depth=1 --no-single-branch`)
  const branch = getTemplateBranch(context)
  execWithSilent(`git checkout master-${branch}`, { cwd: shadowPath })
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }
  const { version: templateVersion } = readJSON(path.resolve(shadowPath, 'package.json'))
  context.set({
    shadow_path: shadowPath,
    template_version: templateVersion
  })
}

/**
 * 获取 git 工程根目录
 */
function getGitRepo(root) {
  let flag = 20
  let p = root
  let s
  let existGit = false
  while (flag > 0) {
    existGit = fs.existsSync(path.join(p, '.git'))
    if (existGit) {
      existGit = true
      break
    }
    s = path.dirname(p)
    if (s === p) {
      break
    }
    p = s
    flag -= 1
  }
  return {
    root: existGit ? p : root,
    git: existGit
  }
}

/**
 * 对项目进行 git 初始化
 */
function gitInit(context) {
  const { root } = context
  const { git, root: gitRoot } = getGitRepo(root)
  context.set('git_root', gitRoot)
  if (!git) {
    execWithSilent(`git init`, { cwd: root })
    execWithSilent(`git add .`, { cwd: root })
    const msg = 'init by gem-mine 👻'
    execWithSilent(`git commit -m "${msg}"`, { cwd: root })
    console.log(`\ngit ${msg}`)
  } else {
    context.set('git', JSON.stringify(getGitInfo()))
  }
}

/**
 * 拷贝工程以及指定内容到要创建的工程
 */
function copyProject(context) {
  const { root, ui, classic_git: classicGit, shadow_path: shadowPath } = context
  const ignores = ['manifest.json', '.git', 'src', 'package-lock.json']
  fs.readdirSync(shadowPath).forEach(function (name) {
    if (ignores.indexOf(name) === -1) {
      fs.copySync(path.join(shadowPath, name), path.join(root, name))
    }
  })

  const uiExamplePath = path.join(shadowPath, 'src/components/examples/ui')
  if (ui) {
    fs.copySync(path.join(uiExamplePath, 'tpl', getUIName(ui), 'index.jsx'), path.join(uiExamplePath, 'index.jsx'))
  }
  fs.removeSync(path.join(uiExamplePath, 'tpl'))
  fs.copySync(path.join(shadowPath, 'src'), path.join(root, 'src'))

  if (classicGit) {
    cloneClassic(context)
  }
}

/**
 * 获取 classic 对应分支代码模板
 */
function cloneClassic(context) {
  const { root, classic_git: classicGit, classic_branch: branch } = context
  const shadowPath = getShadowPath('classic-')
  execWithProcess(`git clone ${classicGit} ${shadowPath} --depth=1 --no-single-branch`)
  execWithSilent(`git checkout ${branch}`, { cwd: shadowPath })
  const { version } = readJSON(path.resolve(shadowPath, 'package.json'))
  context.set('classic_version', version)

  execWithSilent(`git checkout ${branch}`, { cwd: shadowPath })
  const dels = ['.gitignore', 'package.json', '.git', 'readme.md', 'README.md']
  dels.forEach(function (item) {
    const dist = path.join(shadowPath, item)
    if (fs.existsSync(dist)) {
      fs.removeSync(dist)
    }
  })
  fs.copySync(shadowPath, root)
  fs.removeSync(shadowPath)
}

/**
 * 获取临时路径
 */
function getShadowPath(prefix) {
  const shadowPath = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  if (fs.existsSync(shadowPath)) {
    fs.removeSync(shadowPath)
  }
  return shadowPath
}

function getGitInfo(root) {
  const result = {}
  try {
    const data = exec(`git remote`, { cwd: root })
      .toString()
      .trim()
    data.split('\n').map(function (name) {
      result[name] = exec(`git remote get-url ${name}`, { cwd: root })
        .toString()
        .trim()
    })
  } catch (e) {}
  return result
}

function getVersionFromGithub({ username = 'gem-mine', project, branch = 'master' }) {
  const url = `https://raw.githubusercontent.com/${username}/${project}/${branch}/package.json`
  try {
    const res = request.get(url, {
      timeout: 20000
    })
    const { version } = JSON.parse(res.body.toString())
    return version
  } catch (e) {}
}

exports.getTemplateBranch = getTemplateBranch
exports.cloneTemplate = cloneTemplate
exports.copyProject = copyProject
exports.gitInit = gitInit
exports.getVersionFromGithub = getVersionFromGithub
exports.cloneClassic = cloneClassic
