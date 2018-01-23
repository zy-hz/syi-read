var util = require('../tools/util.js')
var dbv = require('../tools/dbv.js')

/**
 * 用户注册，在平台上登记该用户
 * 如果用户不存在，就新建该用户
 * 否则登记用户最后注册时间，以及其他信息
 */
async function registUser(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  // 是否为新用户
  if (user == null) {
    // 创建新用户
    var uid = await dbv.createNewUserFromWx(ctx.state.$wxInfo.userinfo);
    // 查找用户
    user = await dbv.findUserByUid(uid);
  }
  ctx.body = { user };
}

/** 
 * 创建组织
 */
async function createOrg(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  const { FolderId, BlockName, CreateDate, DeliverDate } = ctx.query;
}

/**
 * 加入一个组织
 * @param {uid} [必须]            平台用户编号
 * @param {oid} [必须]            组织编号
 * @param {mt} [必须]             成员身份 1-游客，2-访客，4-成员，8-管理员
 * @param {name} [必须]           成员名字
 */
async function joinOneOrg(uid, oid, mt, name) {
  // 在指定组织中查找成员
  var member = await dbv.findMemberByUserId(oid, uid);
  if (member == null) {
    // 没找到，新建成员
    await dbv.addMember(oid, uid, mt, name);
  } else {
    // 找到了，恢复该成员
  }
}

async function getTasks(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  var uid = ctx.state.$wxInfo.userinfo.openId;
  const { AllOrg, InOrgs, IsDone } = ctx.query;

  var Tasks = dbv.getAllTasksAssignToUser(uid, IsDone);
  ctx.body = { Tasks };
}

async function getOrgs(ctx,next){
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
}

/**
 * 获得用户的合计信息
 */
function getSummaryInfo(ctx, next) {
  var summaryInfo = [{ Name: "任务", Score: 10 }, { Name: "小组", Score: 1 }, { Name: "积分", Score: 2126 }];
  ctx.body = { SummaryInfo: summaryInfo };
}

module.exports = {
  createOrg,
  registUser,
  getTasks,
  getOrgs,
  getSummaryInfo
};