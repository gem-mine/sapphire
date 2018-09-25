const chalk = require('chalk')

function diffVersion(localVersion, remoteVersion) {
  let message, flag
  if (localVersion) {
    if (remoteVersion) {
      if (localVersion === remoteVersion) {
        message = `本地脚手架已经是最新版本（${localVersion}），请确认是否升级？`
        flag = false
      } else {
        message = `脚手架检测到新版本：${chalk.gray(localVersion)} → ${chalk.yellow(remoteVersion)}，建议升级`
        flag = true
      }
    } else {
      message = `暂时无法检测到最新脚手架版本，请确认是否升级？`
      flag = false
    }
  } else {
    message = `本地脚手架版本丢失，建议进行升级`
    flag = true
  }
  return {
    message,
    flag
  }
}

exports.diffVersion = diffVersion
