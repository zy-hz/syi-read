/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weread'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)

// 权限的方法
router.post('/getpermission', validationMiddleware, controllers.org.getPermission)

// 组织的方法
router.get('/createorg', validationMiddleware, controllers.org.createOrg)
router.post('/registuser', validationMiddleware, controllers.org.registUser)
router.get('/registuser', validationMiddleware, controllers.org.registUser)
router.post('/getorgs', validationMiddleware, controllers.org.getOrgs)

// 任务的方法
router.post('/gettasks', validationMiddleware, controllers.org.getTasks)
router.post('/createnewtask', validationMiddleware, controllers.org.createNewTask)

// 任务类型
router.get('/gettaskkinds', validationMiddleware, controllers.org.getTaskKinds)

// 统计的方法
router.get('/getsummaryinfo', validationMiddleware, controllers.org.getSummaryInfo)

module.exports = router
