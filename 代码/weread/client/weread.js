// weread.js
//

var weread = require('./vendor/weread-client-sdk/index')
var config = require('./config')

// 初始化 SDK
// 将基础配置和 sdk.config 合并传入 SDK 并导出初始化完成的 SDK
module.exports = weread(Object.assign({}, config))