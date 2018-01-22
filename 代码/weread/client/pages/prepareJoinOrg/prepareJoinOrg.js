var wxutil = require('../../utils/z-util-wx.js')
const { org, task } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    NoticeTitle:"你好",
    NoticeContent:"欢迎来到随义读书",
    RecommendOrgs: {},
  };

  obj.onLoad = onLoad;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  wx.setNavigationBarTitle({
    title: '发现',
  })

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