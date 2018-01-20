var util = require('../tools/util.js')
const { DB } = util;

/**
 * 用户注册，在平台上登记该用户
 * 如果用户不存在，就新建该用户，并分配默认值
 * 否则登记用户最后注册时间，以及其他信息
 */
async function registUser(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  var uid = ctx.state.$wxInfo.userinfo.openId;

  ctx.body = { Uid: uid };
}

module.exports = {
  registUser
};