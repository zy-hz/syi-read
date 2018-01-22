var org = require('../../vendor/weread-client-sdk/lib/org.js')
var wxutil = require('../../utils/z-util-wx.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    tasks: {},
  };

  obj.onLoad = onLoad;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  var thePage = this;

  org.checkUserAuth({
    afterNoAuth() {
      wx.reLaunch({ url: '/pages/welcome/welcome' })
    },

    afterHasAuth() {
      doLoadTaskList(thePage)
    },

    fail(err) {
      wxutil.showModel('检查用户授权失败', err)
      console.log('检查用户授权失败', err)
    }

  })
}

/**
 * 载入用户列表
 */
function doLoadTaskList(thePage) {

}