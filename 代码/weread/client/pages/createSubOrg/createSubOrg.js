var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    ParentOrgId: {},
    SubOrgId: {},
    SubOrgName: {},
    AdminId: {},
    AdminName: {},
  };

  obj.onLoad = onLoad;
  obj.onShow = onShow;
  obj.onCancel = function () { wx.navigateBack() };
  obj.onSubmit = onSubmit;
  obj.doSelectAdmin = doSelectAdmin;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {

  const { ParentOrgId, SubOrgId, SubOrgName, AdminId, AdminName, IsCreateNew } = options;
  this.mode = IsCreateNew == null || IsCreateNew == true ? 'Create' : 'Edit';
  var subOrgId = SubOrgId || 0;
  var subOrgName = SubOrgName || '';
  var adminId = AdminId || '';
  var adminName = AdminName || '';

  wx.setNavigationBarTitle({
    title: this.mode == 'Create' ? '新建' : '编辑',
  })

  this.setData({
    ParentOrgId,
    SubOrgId: subOrgId,
    SubOrgName: subOrgName,
    AdminId: adminName,
    AdminName: adminName
  })
}

function onShow(options) {
  var theApp = getApp();
  console.log(theApp.selectedMember);
  theApp.selectedMember = null;
}

// 创建或者编辑
function onSubmit() {
  var thePage = this;

  wxutil.showLoading();
  org.createSubOrg({
    pms: { OrgId: orgInfo.OrgId },

    success(result) {
      wxutil.hideLoading();

      const { Permission } = result.data

      console.log(Permission);
    },

    fail(error) {
      wxutil.showModel('创建小小组失败', error);
      console.log('创建小小组失败', error);
    }
  })
}

/**
 * 选择管理员
 */
function doSelectAdmin() {
  var title = encodeURI('选择群主');
  wx.navigateTo({
    url: `/pages/memberSelector/memberSelector?OrgId=${this.data.ParentOrgId}&Title=${title}`,
  })
}



