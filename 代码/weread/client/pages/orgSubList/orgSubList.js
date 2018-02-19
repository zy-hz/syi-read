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
    CreateSubOrgUrl: null,

    // 任务列表
    SubOrgs: {}
  };

  obj.onLoad = onLoad;
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

  // 载入群列表
  doLoadSubOrgs(this);
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
  var url = "../createSubOrg/createSubOrg?" + orgPms;

  thePage.setData({ CreateSubOrgUrl: url });
}

/**
 * 载入小小群
 */
function doLoadSubOrgs(thePage) {
  // 载入的参数
  var pms = {
    OrgId: thePage.data.OrgInfo.OrgId,
  }

  wxutil.showLoading();
  org.getOrgs({
    pms,

    success(result) {
      wxutil.hideLoading();

      // 载入任务列表
      const { Orgs } = result.data
      if (Orgs != null && Orgs.length > 0) {
        thePage.setData({ SubOrgs: Orgs, HiddenNoDataPanel: true })
      }
    },
    fail(error) {
      wxutil.showModel('载入群列表失败', error);
      console.log('载入群列表失败', error);
    }
  })
}

