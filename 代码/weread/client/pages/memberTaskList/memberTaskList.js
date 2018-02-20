var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    HiddenNoDataPanel: true,

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

  wx.setNavigationBarTitle({
    title: "任务",
  })

  this.setData({ HiddenNoDataPanel: false })
}

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
 * 载入任务
 */
function doLoadTasks(thePage) {
  // 载入的参数
  var pms = {
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

