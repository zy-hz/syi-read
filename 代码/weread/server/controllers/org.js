var util = require('../tools/util.js')
var dbv = require('../tools/dbv.js')

/**
 * 用户注册，在平台上登记该用户
 * 如果用户不存在，就新建该用户，并分配默认组织
 * 否则登记用户最后注册时间，以及其他信息
 */
async function registUser(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  // 是否为新用户
  if (user == null ) {
    // 创建新用户
    user = await dbv.createNewUserFromWx(ctx.state.$wxInfo.userinfo);
    // 加入默认组,成员身份
    joinOneOrg(user.id, 0, 4);
  }
  ctx.body = { user };
}

/**
 * 加入一个组织
 * @param {uid} [必须]            平台用户编号
 * @param {oid} [必须]            组织编号
 * @param {mt} [必须]             成员身份 1-游客，2-访客，4-成员，8-管理员
 */
function joinOneOrg(uid, oid, mt) {
  // 在指定组织中查找成员
  var mid = dbv.findMemberByUserId(oid, uid);
  if (mid == 0) {
    // 没找到，新建成员
    dbv.addMember(oid, uid, mt);
  } else {
    // 找到了，恢复该成员
  }
}

module.exports = {
  registUser
};