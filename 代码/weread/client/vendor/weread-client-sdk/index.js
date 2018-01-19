const config = require('./config')
const { ERRORS } = require('./lib/constants')

/**
 * 初始化 weread sdk ,该sdk是对wafer2-client-sdk的二次封装

 * SDK 所有支持的配置项
 * @param {object} [必须] service                    服务器信息
 * @param {string} [必须] service.host               服务器 Host

 */
module.exports = function init(options) {
  // 检查配置项
  const { service } = options
  if ([service].some(v => v === undefined)) throw new Error(ERRORS.ERR_INIT_SDK_LOST_CONFIG)

  // 初始化配置
  const configs = config.set(options)
  console.log(options)

  return {
    service,
    user: require('./lib/user')
  }
}
