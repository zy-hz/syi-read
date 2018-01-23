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

    // TODO::检查注册用户的来源，判断是否直接加入到某个具体的小组

    // 如果没有任何参数，加入默认的组织
    var member = await joinOneOrg(uid, 1, 4, user.NickName);

    // 登记用户注册的路径
    if (ctx.method == "POST") {
      const { scene } = ctx.request.body;
      var join_raw_data = JSON.stringify(ctx.request.body);
      await dbv.logMemberJoin(member, scene, 0, join_raw_data);
    }
  }

  // 记录用户登录日志
  await dbv.logUserRegist(user);

  // 返回用户对象
  ctx.body = { User: user };
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
 * 查找组织
 */
async function getOrgs(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;


  // 返回用户对象
  ctx.body = { Orgs };
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
    var mid = await dbv.addMember(oid, uid, mt, name);
    // 查找成员
    member = await dbv.findMemberByMemberId(mid);
  } else {
    // 找到了，恢复该成员
    await dbv.activeMember(member.id, mt, 1);
  }

  return member;
}

async function getTasks(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  var uid = ctx.state.$wxInfo.userinfo.openId;
  const { AllOrg, InOrgs, IsDone } = ctx.query;

  var Tasks = dbv.getAllTasksAssignToUser(uid, IsDone);
  ctx.body = { Tasks };
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