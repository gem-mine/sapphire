const helper = require('./helper');
const project = require('./project');
exports.exec = helper.exec;
exports.getLocalIP = helper.getLocalIP;
exports.initCheck = require('./initCheck');
exports.report = require('./report');
exports.createProject = project.create;
exports.updateProject = project.update;

const step = {
  platform: require('./step/platform'),
  pc: {
    ie8: require('./step/pc/ie8'),
    ui: require('./step/pc/ui'),
    classic: require('./step/pc/classic')
  },
  mobile: {
    ui: require('./step/mobile/ui')
  }
};

exports.step = step;
