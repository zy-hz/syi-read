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

var TABLE_STOP_WORD = "sy_stop_word";

var LOG_MEMBER_JOIN = "sy_log_member_join";
var LOG_USER_LOGIN = "sy_log_user_login";


var USER_ITEM = ['id', 'created_on', 'last_login_on', 'language', 'nickname as NickName'];
var MEMBER_ITEM = ['id', 'name', 'user_id', 'org_id', 'type'];

var MEMBER_TASK_ITEM = [`${TABLE_MEMBER_TASKS}.id`, `${TABLE_MEMBER_TASKS}.task_id as TaskId`, `${TABLE_MEMBER_TASKS}.is_done`, `${TABLE_MEMBER_TASKS}.assign_to_user as UserId`, `${TABLE_MEMBER_TASKS}.assign_to_org as OrgId`, `${TABLE_MEMBER_TASKS}.assign_to_member as MemberId`, `${TABLE_MEMBER_TASKS}.repeat_number as RepeatNumber`, `${TABLE_MEMBER_TASKS}.last_exec_on as LastExecuteDateTime`, `${TABLE_TASKS}.title as TaskTitle`, `${TABLE_TASKS}.kind_id as KindId`, `${TABLE_TASK_KINDS}.name as KindName`, `${TABLE_ORGS}.name as OrgName`];

var MEMBER_TASK_DETAIL = MEMBER_TASK_ITEM.concat([`${TABLE_TASKS}.content as TaskContent`]);

var MEMBER_ORG_ITEM = [`${TABLE_ORGS}.id as OrgId`, `${TABLE_ORGS}.name as OrgName`, 'parent_org_id', 'root_org_id','family_tree'];

var ORG_TASK_ITEM = [`${TABLE_TASKS}.id as TaskId`, `${TABLE_TASKS}.title as TaskTitle`, `${TABLE_TASKS}.content as TaskContent`, `${TABLE_MEMBERS}.name as AuthorName`, `${TABLE_TASKS}.kind_id as KindId`, `${TABLE_TASK_KINDS}.name as KindName`, `${TABLE_TASKS}.task_score as TaskScore`, `${TABLE_TASKS}.allow_repeat_cnt as RepeatCount`, `${TABLE_TASKS}.created_on as CreateDateTime`, `${TABLE_TASKS}.publish_on as PublishDateTime`, `${TABLE_TASKS}.begin_on as BeginDateTime`, `${TABLE_TASKS}.end_on as EndDateTime`, `${TABLE_TASKS}.visible_for as VisiableFor`, `${TABLE_TASKS}.to_member_org as ToMemberOrg`, `${TABLE_TASKS}.to_member_all as ToMemberAll`, `${TABLE_TASKS}.to_sub_org as ToSubOrg`, `${TABLE_TASKS}.is_published as IsPublished`];

var ORG_TASK_KIND_ITEM = [`${TABLE_TASK_KINDS}.id as KindId`, `${TABLE_TASK_KINDS}.name as KindName`, `${TABLE_TASK_KINDS}.score as KindScore`, `${TABLE_TASK_KINDS}.is_default as IsDefault`];


var DATETIME_LONGSTRING = "yyyy-MM-dd HH:mm:ss";

////////////////////////// 用户 //////////////////////////////

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

/**
 * 根据成员类型查询
 */
async function findMemberByType(oid, mts) {
  return await DB(TABLE_MEMBERS).select(MEMBER_ITEM).where({ org_id: oid }).whereIn('type', mts);
}

async function findMemberByMemberId(mid) {
  var result = await DB(TABLE_MEMBERS).select(MEMBER_ITEM).where({ id: mid });
  return result.lenght == 0 ? null : result[0];
}

/**
 * 获得组成员
 */
async function findMemberByOrgId(oid) {
  var result = await DB(TABLE_MEMBERS).select(MEMBER_ITEM).where({ org_id: oid });
  return result
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

/**
 * 根据编号查询组织
 */
async function findOrgByOid(oid){
  var result = await DB(TABLE_ORGS).select(MEMBER_ORG_ITEM).where({id:oid});
  return result.length == 0 ? null:result[0];
}

/**
 * 同组中是否存在相同的群名
 */
async function isExistOrgName(parentOid, oname){
  var result = await DB(TABLE_ORGS).select(MEMBER_ORG_ITEM).where({ parent_org_id: parentOid, name: oname });
  return result.length == 0 ? false : true;
}

/**
 * 创建群
 */
async function createOrg(parentOid, oname) {
  var parentOrg = await findOrgByOid(parentOid);
  if (null == parentOrg) throw `父组织不存在。(${parentOid})`;
  
  if (await isExistOrgName(parentOid, oname)) throw `群名已经存在。`;
  
  var result = await DB(TABLE_ORGS).returning('id').insert({
    name:oname,
    parent_org_id: parentOid,
    root_org_id: parentOrg.root_org_id == 0 ? parentOid : parentOrg.root_org_id,
  })
  result = result.lenght == 0 ? null : result[0];
  
  var fTree ;
  if (parentOrg.family_tree == null || parentOrg.family_tree == ''){
    fTree = `>${result}`;
  }else{
    fTree = `${parentOrg.family_tree}.${result}`;
  }
  await DB(TABLE_ORGS).update({ family_tree:fTree}).where('id',result);
  return result;

}

////////////////////////// 任务 //////////////////////////////

/** 
 * 
 * 查找组任务 
 * 
 */
async function findTasksByOrgId(oid, maxCount, beginId = -1) {

  return await DB(TABLE_TASKS).select(ORG_TASK_ITEM)
    .where(`${TABLE_TASKS}.org_id`, oid)
    .where(`${TABLE_TASKS}.id`, beginId > 0 ? '<' : '>', beginId)
    .orderBy(`${TABLE_TASKS}.id`, 'desc')
    .limit(maxCount)
    .leftJoin(`${TABLE_MEMBERS}`, function () {
      this.on(`${TABLE_TASKS}.org_id`, '=', `${TABLE_MEMBERS}.org_id`)
        .on(`${TABLE_TASKS}.author_id`, '=', `${TABLE_MEMBERS}.user_id`)
    })
    .leftJoin(`${TABLE_TASK_KINDS}`, `${TABLE_TASKS}.kind_id`, `${TABLE_TASK_KINDS}.id`);
}

/**
 * 获得成员任务
 */
async function findMemberTasksById(mtid) {
  return await DB(TABLE_MEMBER_TASKS).select(MEMBER_TASK_DETAIL)
    .where(`${TABLE_MEMBER_TASKS}.id`, mtid)
    .leftJoin(`${TABLE_TASKS}`, `${TABLE_MEMBER_TASKS}.task_id`, `${TABLE_TASKS}.id`)
    .leftJoin(`${TABLE_TASK_KINDS}`, `${TABLE_TASKS}.kind_id`, `${TABLE_TASK_KINDS}.id`)
    .leftJoin(`${TABLE_ORGS}`, `${TABLE_MEMBER_TASKS}.assign_to_org`, `${TABLE_ORGS}.id`);
}

/**
 * 指派给用户的所有任务
 */
async function getAllTasksAssignToUser(uid, maxCount, beginId) {

  return await DB(TABLE_MEMBER_TASKS).select(MEMBER_TASK_ITEM)
    .where(`${TABLE_MEMBER_TASKS}.assign_to_user`, uid)
    .where(`${TABLE_MEMBER_TASKS}.id`, beginId > 0 ? '<' : '>', beginId)
    .limit(maxCount)
    .leftJoin(`${TABLE_TASKS}`, `${TABLE_MEMBER_TASKS}.task_id`, `${TABLE_TASKS}.id`)
    .leftJoin(`${TABLE_TASK_KINDS}`, `${TABLE_TASKS}.kind_id`, `${TABLE_TASK_KINDS}.id`)
    .leftJoin(`${TABLE_ORGS}`, `${TABLE_MEMBER_TASKS}.assign_to_org`, `${TABLE_ORGS}.id`);
}

/**
 * 为组织找到任务类型
 */
async function getTaskKinds4Org(oid) {
  return await DB(TABLE_ORGS).select(ORG_TASK_KIND_ITEM).where(`${TABLE_ORGS}.id`, oid).leftJoin(`${TABLE_TASK_KINDS}`, `${TABLE_TASK_KINDS}.org_id`, `${TABLE_ORGS}.root_org_id`);
}

/**
 * 用户创建任务
 */
async function addTask(task) {
  var dt = new Date().toString(DATETIME_LONGSTRING);
  var result = await DB(TABLE_TASKS).returning('id').insert({
    title: task.TaskTitle,
    content: task.TaskContent,
    author_id: task.AuthorId,
    org_id: task.OrgId,
    kind_id: task.KindId,
    task_score: task.TaskScore,
    allow_repeat_cnt: task.RepeatCount,
    created_on: dt,
    begin_on: task.BeginDateTime,
    end_on: task.EndDateTime,
    visible_for: task.VisiableFor,
    to_member_org: task.ToMemberOrg,
    to_member_all: task.ToMemberAll,
    to_sub_org: task.ToSubOrg,
    is_published: task.IsPublished
  });

  return result.lenght == 0 ? null : result[0];
}

/**
 * 添加成员任务(批量)
 */
async function addMemberTasks(mTasks) {
  var chunkSize = 1000;
  DB.transaction(function (tr) {
    return DB.batchInsert(TABLE_MEMBER_TASKS, mTasks, chunkSize)
      .transacting(tr)
  })
    .then(function (inserts) {
      console.log(inserts.length + ' new books saved.');
    })
    .catch(function (error) {
      // If we get here, that means that neither the 'Old Books' catalogues insert,
      // nor any of the books inserts will have taken place.
      console.error(error);
    })
}

/**
 * 设置任务的发布时间
 */
async function setTaskPublishDateTime(tid) {
  var dt = new Date().toString(DATETIME_LONGSTRING);
  await DB(TABLE_TASKS).update({ publish_on: dt }).where('id', tid);
}

/**
 * 根据成员的类型构建成员任务
 */
async function buildMemberTaskByMemberType(oid, mts, tid) {
  var col = DB.raw(`${tid} as task_id`);
  return await DB(TABLE_MEMBERS).select('user_id as assign_to_user', 'org_id as assign_to_org', 'id as assign_to_member', col).where({ org_id: oid }).whereIn('type', mts);
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

////////////////////////// 杂项 //////////////////////////////

/**
 * 统计敏感词
 */
async function countStopWords(word) {
  var result = await DB(TABLE_STOP_WORD).select(DB.raw(`sum(INSTR('${word}',word)) as cnt`));
  return result.lenght == 0 ? 0 : result[0].cnt;
}

module.exports = {
  findUserByWx,
  findUserByUid,
  createNewUserFromWx,

  findMemberByUserId,
  findMemberByMemberId,
  findMemberByType,
  findMemberByOrgId,
  addMember,
  activeMember,

  getOrgs,
  createOrg,

  findTasksByOrgId,
  findMemberTasksById,
  getAllTasksAssignToUser,
  getTaskKinds4Org,
  addTask,
  addMemberTasks,
  setTaskPublishDateTime,
  buildMemberTaskByMemberType,

  logMemberJoin,
  logUserRegist,

  countStopWords,
}
