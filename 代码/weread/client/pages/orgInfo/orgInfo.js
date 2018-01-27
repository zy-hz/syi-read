var wxutil = require('../../utils/z-util-wx.js')
const { org } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    OrgInfo: {},
  };

  obj.onLoad = onLoad;
  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  var orgInfo = getOrgInfoFromOptions(options);

  wx.setNavigationBarTitle({
    title: orgInfo.OrgName,
  })

  this.setData({ OrgInfo: orgInfo })

  var thePage = this;
}

/**
 * 从传入的参数获得小组信息
 */
function getOrgInfoFromOptions(options) {
  return {
    OrgId: options.OrgId,
    OrgName: decodeURI(options.OrgName),
    OrgAvater: decodeURI(options.OrgAvater)
  }
}


