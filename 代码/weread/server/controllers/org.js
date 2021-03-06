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
async function createSubOrg(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  const { ParentOrgId, SubOrgId, SubOrgName, AdminId, AdminName, Mode } = ctx.request.body;
  if (await dbv.countStopWords(SubOrgName) > 0) {
    ctx.body = { IsSuccess: false, ErrorMessage: '群命包含敏感词' };
    return;
  }

  try {
    if (Mode == 'Create') {  // 新建模式
      var oid = await dbv.createOrg(ParentOrgId, SubOrgName);
      await dbv.addMember(oid, AdminId, 8, AdminName); // 管理员加入

      ctx.body = { SubOrgId: oid, IsSuccess: true };
    }
    else { // 编辑模式
      await dbv.updateOrgName(ParentOrgId, SubOrgId, SubOrgName);
      await dbv.resetOrgAdmin(SubOrgId);
      await joinOneOrg(AdminId, SubOrgId, 8, AdminName);

      ctx.body = { SubOrgId, IsSuccess: true };
    }

  }
  catch (e) {
    ctx.body = { IsSuccess: false, ErrorMessage: e };
  }

}

/**
 * 查找组织
 */
async function findOrg(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  // 获得查询参数
  const { OrgId, Admins } = ctx.request.body;

  var Org = await dbv.findOrgByOid(OrgId);

  var admins = {}; // 如果用户选择查看管理员，则返回管理员信息
  if (Admins != null) admins = await dbv.findMemberByType(OrgId, [8]);

  ctx.body = { Org, Admins: admins };
}

/**
 * 获得成员所在的组织
 */
async function getOrgs(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  // 获得查询参数
  const { OrgId, Limit } = ctx.request.body;

  // 获得组织
  var Orgs = {};
  if (OrgId > 0) {
    // 获得组的下辖组
    Orgs = await dbv.getSubOrgs(OrgId);
  }
  else {
    // 获得用户的组
    Orgs = await dbv.getOrgs(user, Limit);
  }


  // 返回用户对象
  ctx.body = { Orgs };
}

/**
 * 获得成员
 */
async function getMembers(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  // 获得查询参数
  const { OrgId } = ctx.request.body;

  var Members = await dbv.findMemberByOrgId(OrgId);
  Members.map(x => {
    var typeName = '未知';
    if (x.type == 8) typeName = '管理员';
    if (x.type == 4) typeName = '';
    if (x.type == 2) typeName = '访客';
    if (x.type == 1) typeName = '游客';
    x.TypeName = typeName;

  });
  ctx.body = { Members };
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

/**
 * 获得权限
 */
async function getPermission(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  // 获得查询参数
  const { OrgId } = ctx.request.body;
  // 获得成员
  var member = await dbv.findMemberByUserId(OrgId, user.id);

  var Permission = {};
  if (member != null) {
    if (member.type == 8) {
      Permission.ShowGroupManagerPanel = true;
    }
  }
  ctx.body = { Permission };
}

/**
 * 获得组任务
 */
async function getTasks(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  const { OrgId, Limit, MinTaskId, MemberTaskId, OrgTaskId } = ctx.request.body;
  var beginId = MinTaskId || -1;

  var Tasks = {};
  var Author = {};

  if (OrgId > 0) {
    // 获得小组发布的任务
    Tasks = await dbv.findTasksByOrgId(OrgId, Limit, beginId);
  }
  else if (MemberTaskId > 0) {
    // 获得指定的MemberTask
    Tasks = await dbv.findMemberTasksById(MemberTaskId);
    if (Tasks.length > 0) {
      Author = await dbv.findUserByUid(Tasks[0].TaskAuthorId);
    }
  }
  else if (OrgTaskId > 0) {
    // 获得指定的组织任务
    Tasks = await dbv.findOrgTasksById(OrgTaskId);
  }
  else {
    // 获得该用户需要执行的所有任务
    Tasks = await dbv.getAllTasksAssignToUser(user.id, Limit, beginId);
  }

  ctx.body = { Tasks, Author, Me: user };
}

/**
 * 获得任务完成的日志
 */
async function getMemberTaskDoneLog(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  const { TaskId, OrgId } = ctx.request.body;

  var DoneLogs = await dbv.getMemberTaskDoneLog(TaskId, OrgId, 100);
  ctx.body = { DoneLogs }
}

/**
 * 创建新任务
 */
async function createNewTask(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);
  const { OrgId } = ctx.request.body;

  // TODO::验证用户授权

  // 创建新任务
  var task = ctx.request.body;
  task.AuthorId = user.id;

  // 检测敏感词
  if (await dbv.countStopWords(task.TaskTitle) > 0) {
    ctx.body = { IsSuccess: false, ErrorMessage: '标题包含敏感词' };
    return;
  }

  if (task.CreateMode) {  // 新建模式
    var TaskId = await dbv.addTask(task);
    task.id = TaskId;

    // 尝试发布任务
    tryPublishTask(task);
    ctx.body = { IsSuccess: true, TaskId };
  }
  else { // 编辑模式
    await dbv.updateTask(task);
    ctx.body = { IsSuccess: true, TaskId:task.id };
  }

}

/**
 * 发布任务
 */
async function tryPublishTask(task) {
  if (!task.IsPublished) return;

  var mTasks = {};
  if (task.ToMemberOrg) {
    // 查找本组的成员和管理员
    mTasks = await dbv.buildMemberTaskByMemberType(task.OrgId, [4, 8], task.id);
  }
  if (task.ToMemberOrg) {
  }
  if (task.ToMemberOrg) {

  }

  // 添加成员任务
  await dbv.addMemberTasks(mTasks);
  // 设置更新时间
  await dbv.setTaskPublishDateTime(task.id);
}

/**
 * 设置任务完成
 */
async function setMemberTaskDone(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  const { MemberTaskId, TaskAuthorId, KindId, RepeatNumber, TaskBaseScore, TaskBeginOn, TaskEndOn } = ctx.request.body;

  // 根据重复次数计算任务得分
  var score = calTaskScore(TaskBaseScore, RepeatNumber);
  await dbv.setMemberTaskDone(MemberTaskId, user.id, TaskAuthorId, KindId, RepeatNumber, score, TaskBeginOn, TaskEndOn);

  ctx.body = { IsDone: true, TaskScore: score };
}

/**
 * 计算任务得分
 */
function calTaskScore(baseScore, repeatCount) {
  for (var i = 1; i <= repeatCount - 0; i++) {
    baseScore = baseScore + i + 1;
  }
  return baseScore;
}

/**
 * 获得任务类型
 */
async function getTaskKinds(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;

  const { OrgId } = ctx.query;
  var TaskKinds = await dbv.getTaskKinds4Org(OrgId);

  ctx.body = { TaskKinds };
}

/**
 * 获得用户的合计信息
 */
async function getSummaryInfo(ctx, next) {
  // 微信用户身份验证
  if (util.verify_request(ctx) == -1) return;
  // 操作微信用户对应的平台用户编号
  var user = await dbv.findUserByWx(ctx.state.$wxInfo.userinfo.openId);

  var si = await dbv.getUserSummary(user.id);
  var summaryInfo = [{ Name: "任务", Score: si.task_cnt }, { Name: "小群", Score: si.org_cnt }, { Name: "积分", Score: si.score }];
  ctx.body = { SummaryInfo: summaryInfo };
}

module.exports = {
  getPermission,
  registUser,
  getTasks,
  getMemberTaskDoneLog,
  createNewTask,
  findOrg,
  getOrgs,
  createSubOrg,
  getMembers,
  setMemberTaskDone,
  getTaskKinds,
  getSummaryInfo
};