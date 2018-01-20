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

var USER_ITEM = ['id', 'created_on', 'last_login_on', 'language'];

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

/**
 * 从微信平台创建一个新的平台用户
 */
async function createNewUserFromWx(userInfo){
  var dt = new Date().toString(DATETIME_LONGSTRING);
  var result = await DB(TABLE_USERS).returning(USER_ITEM).insert({ 
    last_login_on:dt,
    created_on:dt,
    updated_on:dt,
    language: userInfo.language,
    auth_source_wx:userInfo.openId});

  return result.lenght == 0 ? null : result[0];
}

module.exports = {
  findUserByWx,
  createNewUserFromWx
}
