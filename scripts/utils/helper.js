const execSync = require('child_process').execSync;
const os = require('os');
const chalk = require('chalk');

function exec(cmd, ext) {
  if (ext === false) {
    return execSync(cmd, {})
      .toString()
      .trim();
  } else {
    if (ext && ext.silent) {
      const params = Object.assign({}, ext);
      execSync(cmd, params);
    } else {
      const params = Object.assign({ stdio: [process.stdin, process.stdout, process.stderr] }, ext);
      execSync(cmd, params);
    }
  }
}

function getLocalIP() {
  const iptable = {};
  const ifaces = os.networkInterfaces();
  for (const dev in ifaces) {
    ifaces[dev].forEach(function(details, alias) {
      if (details.family == 'IPv4') {
        iptable[dev + (alias ? ':' + alias : '')] = details.address;
      }
    });
  }
  return iptable;
}

exports.exec = exec;
exports.getLocalIP = getLocalIP;
