const qcloud = require('../../wafer2-client-sdk/index.js')
const { service } = require('../config.js')

var util = require('./util.js')

/**
 * 检查用户授权
 */
function checkUserAuth(options) {
  // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.userInfo" 这个 scope
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.userInfo']) {
        // 没有授权
        options.afterNoAuth();
      } else {
        // 已经授权
        wx.getUserInfo({
          success(res){
            options.afterHasAuth(res.userInfo);
          },

          fail(err) {
            options.fail(err);
          }
        })
      }
    },

    fail(err) {
      options.fail(err);
    }
  })
}

/**
 * @method
 * 用户注册
 * 如果不存在，就新建用户
 * 如果没有组，就加入默认组
 *
 * @param {Object} options 函数配置
 * @param {Function} options.success(result) 注册成功后的回调函数 const { BlockId , IsNewBlock} = result.data
 * @param {Function} options.fail(error) 注册失败后的回调函数，参数 error 错误信息
 */
function registUser(options) {

  // 自动登录
  options.login = true;
  options.url = `${service.baseUrl}/registuser`;

  qcloud.request(options);
}

/**
 * 创建新任务
 * 
 * @param {Object} options 函数配置
 * @param {Function} options.success(result) 成功后的回调函数 const { TaskId } = result.data
 * @param {Function} options.fail(error) 失败后的回调函数，参数 error 错误信息
 * 
 */
function createNewTask(options) {

}

/**
 * 获得小组
 * @param {Object} options 函数配置
 * @param {Function} options.success(result) 成功后的回调函数 const { TaskId } = result.data
 * @param {Function} options.fail(error) 失败后的回调函数，参数 error 错误信息
 */
function getOrgs(options){

  // 自动登录
  options.login = true;
  options.url = `${service.baseUrl}/getorgs`;

  qcloud.request(options);
}

/**
 * 获得任务
 * 
 * @param {Object} options 函数配置
 * @param {Function} options.success(res) 成功后的回调函数 const { Tasks } = res.data
 * @param {Function} options.fail(error) 失败后的回调函数，参数 error 错误信息
 *
 */
function getTasks(options) {

  // 自动登录
  options.login = true;
  options.url = `${service.baseUrl}/gettasks`;

  qcloud.request(options);
}

/**
 * 获得合计信息
 * 
 * @param {Object} options 函数配置
 * @param {Function} options.success(res) 成功后的回调函数 const { Tasks } = res.data
 * @param {Function} options.fail(error) 失败后的回调函数，参数 error 错误信息
 *
 */
function getSummaryInfo(options){

  // 自动登录
  options.login = true;
  options.url = `${service.baseUrl}/getsummaryinfo`;

  qcloud.request(options);
}

module.exports = { 
  checkUserAuth, registUser, 
  createNewTask, getTasks, 
  getOrgs,
  getSummaryInfo};