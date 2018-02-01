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
  };

  obj.onLoad = onLoad;
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

  // 载入任务列表
  doLoadTasks(this);
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
function doLoadTasks(thePage){
  wxutil.showLoading();
  org.getTasks({
    success(result) {

      wxutil.hideLoading();

      // 载入任务列表
    },
    fail(error) {
      wxutil.showModel('载入任务列表失败', error);
      console.log('载入任务列表失败', error);
    }
  })
}

