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
  var thePage = this;


}

/**
 * 设置功能连接
 */
function setFunctionUrl(thePage, orgInfo) {
  var orgPms = util.buildOrgUrlParams(orgInfo);
  var url = "../createOrgTask/createOrgTask?" + orgPms;

  thePage.setData({ CreateOrgTaskUrl: url });
}



