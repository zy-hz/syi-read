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

var USER_ITEM = ['id', 'created_on', 'last_login_on', 'language'];
var MEMBER_ITEM = ['id', 'name', 'user_id', 'org_id', 'type'];

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

async function findUserByUid(uid){
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
 * 向一个组织添加成员
 */
async function addMember(oid, uid, mt,name){
  var result = await DB(TABLE_MEMBERS).returning('id').insert({
    name,
    user_id: uid,
    org_id: oid,
    type: mt
  });

  return result.lenght == 0 ? null : result[0];
}

module.exports = {
  findUserByWx,
  findUserByUid,
  createNewUserFromWx,
  findMemberByUserId,
  addMember,
}
