var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    OrgInfo: {},
    OpUrl: {},
    IsAdmin: false,
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

  // 根据权限设置可见
  wxutil.showLoading();
  org.getPermission({
    pms: { OrgId: orgInfo.OrgId },

    success(result) {
      wxutil.hideLoading();

      // 载入任务列表
      const { Permission } = result.data

      var isAdmin = Permission.ShowGroupManagerPanel == true ? true : false;
      thePage.setData({ IsAdmin: isAdmin });
      console.log(Permission);
    },
    fail(error) {
      wxutil.showModel('载入权限列表失败', error);
      console.log('载入权限列表失败', error);
    }
  })
}

// 获得操作员的url（根据用户的权限不同，可以有不同的url）
function getoOperatorUrl(orgInfo) {
  var orgPms = util.buildOrgUrlParams(orgInfo);
  return {
    OrgTaskListUrl: "../orgTaskList/orgTaskList?" + orgPms,
    QrCodeUrl: "../orgQrCode/orgQrCode?" + orgPms,
    OrgSubListUrl: "../orgSubList/orgSubList?" + orgPms,
  }
}



