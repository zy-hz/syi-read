var wxutil = require('../../utils/z-util-wx.js')
const { org , util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    OrgInfo: {},
    OpUrl:{},
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

  this.setData({ OrgInfo: orgInfo })
  var thePage = this;

  // 获得导航url
  var opUrl = getoOperatorUrl(orgInfo);
  this.setData({ OpUrl: opUrl })
}

// 获得操作员的url（根据用户的权限不同，可以有不同的url）
function getoOperatorUrl(orgInfo){
  var orgPms = util.buildOrgUrlParams(orgInfo);
  return {
    OrgTaskListUrl: "../orgTaskList/orgTaskList?" + orgPms,
  }
}



