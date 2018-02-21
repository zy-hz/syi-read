var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    OrgInfo: {},
    HiddenNoDataPanel: true,
    CreateOrgTaskUrl: null,

    // 列表中最小的任务编号
    MinTaskId: -1,
    // 任务列表
    Tasks: {}
  };

  obj.onLoad = onLoad;
  obj.onShow = onShow;
  obj.onReachBottom = onReachBottom;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  var orgInfo = util.getOrgInfoFromOptions(options);

  wx.setNavigationBarTitle({
    title: orgInfo.OrgName,
  })

  // 设置功能的连接
  setFunctionUrl(this, orgInfo);

  this.setData({ OrgInfo: orgInfo })
  this.setData({ HiddenNoDataPanel: false })
}

/**
 * 载入任务列表
 */
function onShow(){
  // 载入任务列表
  doLoadTasks(this);
}

/**
 * 页面滚到到底部了
 */
function onReachBottom() {
  console.log("on bottom");
}

/**
 * 设置功能连接
 */
function setFunctionUrl(thePage, orgInfo) {
  var orgPms = util.buildOrgUrlParams(orgInfo);
  var url = "../createOrgTask/createOrgTask?" + orgPms;

  thePage.setData({ CreateOrgTaskUrl: url });
}

/**
 * 载入任务
 */
function doLoadTasks(thePage) {
  // 载入的参数
  var pms = {
    OrgId: thePage.data.OrgInfo.OrgId,
    Limit: 20,
    MinTaskId: thePage.data.MinTaskId,
  }

  wxutil.showLoading();
  org.getTasks({
    pms,

    success(result) {
      wxutil.hideLoading();

      // 载入任务列表
      const { Tasks } = result.data
      if (Tasks != null && Tasks.length > 0) {
        thePage.setData({ Tasks, HiddenNoDataPanel: true })
      }
    },
    fail(error) {
      wxutil.showModel('载入任务列表失败', error);
      console.log('载入任务列表失败', error);
    }
  })
}

