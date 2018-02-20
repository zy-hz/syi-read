var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

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
  var orgInfo = util.getOrgInfoFromOptions(options);

  wx.setNavigationBarTitle({
    title: orgInfo.OrgName,
  })

  this.setData({ OrgInfo: orgInfo })
  doLoadMember(this)
}

/**
 * 载入成员
 */
function doLoadMember(thePage) {
  wxutil.showLoading();
  org.getMembers({
    pms: { OrgId: thePage.data.OrgInfo.OrgId },

    success(result) {
      wxutil.hideLoading();

      const { Members } = result.data
      thePage.setData({ Members });

    },

    fail(error) {
      wxutil.showModel('获取成员列表失败', error);
      console.log('获取成员列表失败', error);
    }
  })
}