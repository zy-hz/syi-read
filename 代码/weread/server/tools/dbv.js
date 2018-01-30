// 扩展Date对象，注意不用写var Date = require('datejs')
require('datejs')

// 定义数据对象
const configs = require('../config')
const DB = require('knex')({
  client: 'mysql',
  connection: {
    host: configs.mysql.host,
    port: configs.mysql.port,
    user: configs.mysql.user,
    password: configs.mysql.pass,
    database: "weread",
    charset: configs.mysql.char
  }
})

/**
 * 表结构常量定义
 */
var TABLE_USERS = "sy_users";
var TABLE_MEMBERS = "sy_members";
var TABLE_ORGS = "sy_orgs";

var TABLE_TASKS = "sy_tasks";
var TABLE_MEMBER_TASKS = "sy_member_tasks";
var TABLE_TASK_KINDS = "sy_task_kinds"

var LOG_MEMBER_JOIN = "sy_log_member_join";
var LOG_USER_LOGIN = "sy_log_user_login";


var USER_ITEM = ['id', 'created_on', 'last_login_on', 'language', 'nickname as NickName'];
var MEMBER_ITEM = ['id', 'name', 'user_id', 'org_id', 'type'];

var MEMBER_TASK_ITEM = [`${TABLE_MEMBER_TASKS}.id`, `${TABLE_MEMBER_TASKS}.task_id as TaskId`, `${TABLE_TASKS}.title  as TaskTitle`, `${TABLE_MEMBER_TASKS}.is_done`, `${TABLE_MEMBER_TASKS}.assign_to_user as UserId`, `${TABLE_MEMBER_TASKS}.assign_to_org as OrgId`, `${TABLE_MEMBER_TASKS}.assign_to_member as MemberId`, `${TABLE_MEMBER_TASKS}.repeat_number as RepeatNumber`, `${TABLE_MEMBER_TASKS}.last_exec_on as LastExecuteDateTime`];

var MEMBER_ORG_ITEM = [`${TABLE_ORGS}.id as OrgId`, `${TABLE_ORGS}.name as OrgName`, 'parent_org_id', 'root_org_id'];

var ORG_TASK_KIND_ITEM = [`${TABLE_TASK_KINDS}.id as KindId`, `${TABLE_TASK_KINDS}.name as KindName`, `${TABLE_TASK_KINDS}.score as KindScore`];

var DATETIME_LONGSTRING = "yyyy-MM-dd HH:mm:ss";



/**
 * 根据微信标记查询用户
 * 
 * 返回用户,如果不存在，返回 null
 */
async function findUserByWx(openId) {
  var result = await DB(TABLE_USERS).select(USER_ITEM).where('auth_source_wx', openId);
  return result.lenght == 0 ? null : result[0];
}

async function findUserByUid(uid) {
  var result = await DB(TABLE_USERS).select(USER_ITEM).where('id', uid);
  return result.lenght == 0 ? null : result[0];
}

/**
 * 从微信平台创建一个新的平台用户
 */
async function createNewUserFromWx(userInfo) {
  var dt = new Date().toString(DATETIME_LONGSTRING);
  var result = await DB(TABLE_USERS).returning('id').insert({
    nickname: userInfo.nickName,
    last_login_on: dt,
    created_on: dt,
    updated_on: dt,
    language: userInfo.language,
    city: userInfo.city,
    province: userInfo.province,
    country: userInfo.country,
    auth_source_wx: userInfo.openId,
    wx_avatar: userInfo.avatarUrl
  });

  return result.lenght == 0 ? null : result[0];
}

/**
 * 查找组织中的用户
 */
async function findMemberByUserId(oid, uid) {
  var result = await DB(TABLE_MEMBERS).select(MEMBER_ITEM).where({ org_id: oid, user_id: uid });
  return result.lenght == 0 ? null : result[0];
}

async function findMemberByMemberId(mid) {
  var result = await DB(TABLE_MEMBERS).select(MEMBER_ITEM).where({ id: mid });
  return result.lenght == 0 ? null : result[0];
}

/**
 * 向一个组织添加成员
 */
async function addMember(oid, uid, mt, name) {
  var result = await DB(TABLE_MEMBERS).returning('id').insert({
    name,
    user_id: uid,
    org_id: oid,
    type: mt,
    status: 1
  });

  return result.lenght == 0 ? null : result[0];
}

/**
 * 激活成员
 */
async function activeMember(mid, mt, isActived) {
  await DB(TABLE_MEMBERS).update({
    status: isActived,
    type: mt,
  })
}

////////////////////////// 组织 //////////////////////////////

/**
 * 获得用户所在的组织
 */
async function getOrgs(user, limit) {
  return await DB(TABLE_MEMBERS).select(MEMBER_ORG_ITEM).where({ user_id: user.id }).limit(limit).leftJoin(`${TABLE_ORGS}`, `${TABLE_MEMBERS}.org_id`, `${TABLE_ORGS}.id`);
}

////////////////////////// 任务 //////////////////////////////

/**
 * 指派给用户的所有任务
 */
async function getAllTasksAssignToUser(uid, isDone) {

  //return await DB(TABLE_MEMBER_TASKS).select(MEMBER_TASK_ITEM).where({ UserId: uid, is_done: isDone }).leftJoin(`${TABLE_TASKS}`, `${TABLE_MEMBER_TASKS}.task_id`, , `${TABLE_TASKS}.id`);
}

/**
 * 为组织找到任务类型
 */
async function getTaskKinds4Org(oid) {
  return await DB(TABLE_ORGS).select(ORG_TASK_KIND_ITEM).where(`${TABLE_ORGS}.id`, oid).leftJoin(`${TABLE_TASK_KINDS}`, `${TABLE_TASK_KINDS}.org_id`, `${TABLE_ORGS}.root_org_id`);
}

////////////////////////// 日志 //////////////////////////////

/**
 * 记录成员加入
 */
async function logMemberJoin(member, way, introucerId, rawDate) {
  var dt = new Date().toString(DATETIME_LONGSTRING);
  await DB(LOG_MEMBER_JOIN).insert({
    member_id: member.id,
    user_id: member.user_id,
    org_id: member.org_id,
    join_on: dt,
    join_way: way,
    introducer_id: introucerId,
    raw_date: rawDate
  });
}

/**
 * 用户注册
 */
async function logUserRegist(user) {
  var dt = new Date().toString(DATETIME_LONGSTRING);
  await DB(LOG_USER_LOGIN).insert({
    user_id: user.id,
    regist_on: dt
  });
}

module.exports = {
  findUserByWx,
  findUserByUid,
  createNewUserFromWx,

  findMemberByUserId,
  findMemberByMemberId,
  addMember,
  activeMember,

  getOrgs,

  getAllTasksAssignToUser,
  getTaskKinds4Org,

  logMemberJoin,
  logUserRegist,
}
