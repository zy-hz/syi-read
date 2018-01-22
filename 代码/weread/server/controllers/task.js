var util = require('../tools/util.js')
var dbv = require('../tools/dbv.js')

async function getTasks(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  var uid = ctx.state.$wxInfo.userinfo.openId;
  const { AllOrg, InOrgs, IsDone } = ctx.query;

  var Tasks = dbv.getAllTasksAssignToUser(uid, IsDone);
  ctx.body = { Tasks };
}

module.exports = {
  getTasks
};