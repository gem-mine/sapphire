const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const {
  execWithProcess,
  execWithSilent,
  readJSON,
  getUIName,
  getNativeBranch,
  getGitRepo,
  getGitInfo
} = require('gem-mine-helper')
const { REPO } = require('../../constant/core')

/**
 * 获取 gem-mine-template 对应分支代码模板
 */
function cloneNative(context) {
  const { root } = context
  const shadowPath = getShadowPath('gem-mine-')

  execWithProcess(`git clone ${REPO} ${shadowPath} --depth=1 --no-single-branch`)
  const branch = getNativeBranch(context)
  execWithSilent(`git checkout master-${branch}`, { cwd: shadowPath })
  if (!fs.existsSync(root)) {
    fs.ensureDirSync(root)
  }
  context.set({
    shadow_path: shadowPath
  })
}

/**
 * 对项目进行 git 初始化
 */

function gitInit(root) {
  execWithSilent(`git init`, { cwd: root })
  execWithSilent(`git add .`, { cwd: root })
  const msg = 'init by gem-mine 👻'
  execWithSilent(`git commit -m "${msg}"`, { cwd: root })
}

function gitInfo(context) {
  const { root } = context
  const { git, root: gitRoot } = getGitRepo(root)
  if (!git) {
    gitInit(root)
  }
  context.set({
    git_root: gitRoot,
    git: JSON.stringify(getGitInfo(root))
  })
}

/**
 * 拷贝脚手架
 */
function copyNative(context, update = false) {
  const { root, shadow_path: shadowPath } = context
  const ignores = ['manifest.json', '.git', 'src', 'package-lock.json']
  if (update) {
    ignores.push('package.json')
  }
  fs.readdirSync(shadowPath).forEach(function (name) {
    if (ignores.indexOf(name) === -1) {
      fs.copySync(path.join(shadowPath, name), path.join(root, name))
    }
  })

  copySrc(context)
  const { version: nativeVersion } = readJSON(path.resolve(shadowPath, 'package.json'))
  context.set('native_version', nativeVersion)
}

/**
 * 拷贝脚手架 src 目录（会处理 UI example）
 */
function copySrc(context) {
  const { root, ui, shadow_path: shadowPath } = context

  const uiExamplePath = path.join(shadowPath, 'src/components/examples/ui')
  if (ui) {
    fs.copySync(path.join(uiExamplePath, 'tpl', getUIName(ui), 'index.jsx'), path.join(uiExamplePath, 'index.jsx'))
  }
  fs.removeSync(path.join(uiExamplePath, 'tpl'))
  fs.copySync(path.join(shadowPath, 'src'), path.join(root, 'src'))
}

/**
 * 获取 classic 对应分支代码模板
 */
function cloneClassic(context) {
  const { classic_git: classicGit, classic_branch: branch } = context
  const shadowPath = getShadowPath('classic-')
  context.set('shadow_path', shadowPath)
  execWithProcess(`git clone ${classicGit} ${shadowPath} --depth=1 --no-single-branch`)
  execWithSilent(`git checkout ${branch}`, { cwd: shadowPath })
}

/**
 * 拷贝经典代码骨架
 */
function copyClassic(context, update = false) {
  const { root, shadow_path: shadowPath, name } = context
  const { version } = readJSON(path.resolve(shadowPath, 'package.json'))
  let config
  try {
    config = readJSON(path.resolve(shadowPath, '.gem-mine'))
  } catch (e) {
    throw new Error(`这不是一个 gem-mine 可管理的脚手架`)
  }

  context.set({
    from_id: config.id,
    name,
    classic_version: version
  })

  const ignores = ['manifest.json', '.git', 'package-lock.json', '.gem-mine']
  if (update) {
    ignores.push('package.json')
  }
  fs.readdirSync(shadowPath).forEach(function (name) {
    if (ignores.indexOf(name) === -1) {
      fs.copySync(path.join(shadowPath, name), path.join(root, name))
    }
  })
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

exports.cloneNative = cloneNative
exports.copyNative = copyNative
exports.copySrc = copySrc

exports.gitInfo = gitInfo

exports.cloneClassic = cloneClassic
exports.copyClassic = copyClassic
