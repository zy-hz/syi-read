
/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function registUser(ctx, next) {
  // 用户必须登录
  if (verify_request(ctx) == -1) return;
  var uid = ctx.state.$wxInfo.userinfo.openId;

  ctx.body = { Uid: uid };
}

/**
* 验证请求
*/
function verify_request(ctx) {
  // 通过 Koa 中间件进行登录态校验之后
  // 登录信息会被存储到 ctx.state.$wxInfo
  // 具体查看：
  if (ctx.state.$wxInfo.loginState === 1) {
    // loginState 为 1，登录态校验成功
    ctx.state.data = ctx.state.$wxInfo.userinfo
  } else {
    ctx.state.code = -1
  }

  return ctx.state.code;
}

module.exports = {
  registUser
};