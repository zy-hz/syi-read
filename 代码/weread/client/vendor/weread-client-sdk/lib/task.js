const qcloud = require('../../wafer2-client-sdk/index.js')
const { service } = require('../config.js')

/**
 * 获得作业
 * 
 * @param {Object} options 函数配置
 * @param {Function} options.success(result) 成功后的回调函数 const { Tasks } = result.data
 * @param {Function} options.fail(error) 失败后的回调函数，参数 error 错误信息
 *
 */
function getTasks(options){

  // 自动登录
  options.login = true;
  options.url = `${service.baseUrl}/gettasks`;

  qcloud.request(options);
}

module.exports = { checkUserAuth, registUser };