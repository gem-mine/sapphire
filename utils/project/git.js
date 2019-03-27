const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const { execWithProcess, execWithSilent, readJSON, getUIName, getTemplateBranch, getGitRepo, getGitInfo } = require('@gem-mine/sapphire-helper')
const { REPO } = require('../../constant/core')

/**
 * 获取 sapphire-template 对应分支代码模板
 */
function cloneTemplate(context) {
  const { root } = context
  const shadowPath = getShadowPath('sapphire-')

  execWithProcess(`git clone ${REPO} ${shadowPath} --depth=1 --no-single-branch`)
  const branch = getTemplateBranch(context)
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
  const msg = 'init by sapphire 👻'
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
function copyTemplate(context, update = false) {
  const { root, shadow_path: shadowPath } = context
  //  根目录下忽略的文件，不进行 copy
  const ignores = ['manifest.json', '.git', 'src', 'package-lock.json']
  if (update) {
    ignores.push('package.json')
    // 更新模式下要被删除的文件，因为这些文件很可能被用户进行了修改
    const excludes = [
      'public/index.html',
      'public/favicon.ico',
      'config/webpack.js',
      'config/constant.js',
      'config/proxy.js',
      'src/index.js',
      'src/App.jsx',
      'src/components/home/index.jsx',
      'src/components/common',
      'src/components/home',
      'src/global/routes/index.js',
      'src/global/model',
      'src/global/request.js',
      'src/styles/app.scss'
    ]
    excludes.forEach(item => {
      fs.removeSync(path.join(shadowPath, item))
    })
  }
  fs.readdirSync(shadowPath).forEach(function (name) {
    if (ignores.indexOf(name) === -1) {
      fs.copySync(path.join(shadowPath, name), path.join(root, name))
    }
  })

  copySrc(context)
  const { version } = readJSON(path.resolve(shadowPath, 'package.json'))
  context.set('template_version', version)
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
 * 获取临时路径
 */
function getShadowPath(prefix) {
  const shadowPath = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
  if (fs.existsSync(shadowPath)) {
    fs.removeSync(shadowPath)
  }
  return shadowPath
}

exports.cloneTemplate = cloneTemplate
exports.copyTemplate = copyTemplate
exports.copySrc = copySrc
exports.gitInfo = gitInfo
