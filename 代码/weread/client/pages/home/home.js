var wxutil = require('../../utils/z-util-wx.js')
const { org } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    UserInfo: {},
    SummaryObjects: {},
    SomeTasks: {},
    OrgEntries: {},
  };

  obj.onLoad = onLoad;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  wx.setNavigationBarTitle({
    title: '首页',
  })

  var thePage = this;
  org.checkUserAuth({
    afterNoAuth() {
      wx.reLaunch({ url: '/pages/welcome/welcome' })
    },

    afterHasAuth(userInfo) {
      thePage.setData({ UserInfo: userInfo })
      initSummaryPanel(thePage)
    },

    fail(err) {
      wxutil.showModel('检查用户授权失败', err)
      console.log('检查用户授权失败', err)
    }

  })

}

/**
 * 初始化统计面板 STEP:1
 */
function initSummaryPanel(thePage) {
  // 显示载入动画
  wxutil.showLoading();

  org.getSummaryInfo({
    options: {},

    success(res) {
      // 设置统计面板
      const { SummaryInfo } = res.data
      thePage.setData({ SummaryObjects: SummaryInfo });

      // 初始化任务面板
      initTaskPanel(thePage)
    },

    fail(err) {
      wxutil.showModel('初始化任务面板失败', err)
      console.log('初始化任务面板失败', err)
    }
  })
}


/**
 * 载入任务面板 STEP:2
 */
function initTaskPanel(thePage) {

  org.getTasks({
    options: { Limit: 3, OrderBy: "IsDone" },

    success(res) {

      // 设置任务面板
      const { Tasks } = res.data
      thePage.setData({ SomeTasks: Tasks });

      // 初始化组织面板
      initOrgPanel(thePage)
    },

    fail(err) {
      wxutil.showModel('初始化任务面板失败', err)
      console.log('初始化任务面板失败', err)
    }
  })
}

/**
 * 初始化组织面板 STEP:3
 */
function initOrgPanel(thePage) {

  org.getOrgs({
    options: { Limit: 4 },

    success(res) {
      // 关闭载入动画
      wxutil.hideLoading();

      // 设置任务面板
      const { Orgs } = res.data
      thePage.setData({ OrgEntries: Orgs });

    },

    fail(err) {
      wxutil.showModel('初始化小组面板失败', err)
      console.log('初始化小组面板失败', err)
    }
  })
}

