var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject(this));

// 创建页面对象
function createPageObject(thePage) {
  var obj = new Object();

  obj.data = {
    ParentOrgId: {},
    SubOrgId: {},
    SubOrgName: '',
    AdminId: {},
    AdminName: '',
  };

  obj.onLoad = onLoad;
  obj.onShow = onShow;
  obj.onCancel = function () { wx.navigateBack() };
  obj.onSubmit = onSubmit;
  obj.doSelectAdmin = doSelectAdmin;
  obj.onInputOrgName = onInputOrgName;

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
  if (null == theApp.selectedMember) return;

  this.setData({ AdminName: theApp.selectedMember.name, AdminId: theApp.selectedMember.user_id });

  console.log(theApp.selectedMember);
  theApp.selectedMember = null;
}

// 创建或者编辑
function onSubmit() {
  showErrorMessage(this, '');

  if (this.data.SubOrgName == '') {
    showErrorMessage(this, '请输入群名');
    return;
  }

  if (this.data.AdminName == '') {
    showErrorMessage(this, '请选择群主');
    return;
  }

  doCreateNew(this);
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


function onInputOrgName(options) {
  this.setData({ SubOrgName: options.detail.value })
}

/**
 * 创建新小组
 */
function doCreateNew(thePage) {

  wxutil.showLoading();
  org.createSubOrg({
    pms: {
      ParentOrgId: thePage.data.ParentOrgId,
      SubOrgName: thePage.data.SubOrgName,
      AdminId: thePage.data.AdminId,
      AdminName: thePage.data.AdminName,
      Mode: thePage.mode
    },

    success(result) {
      wxutil.hideLoading();

      const { IsSuccess, ErrorMessage, SubOrgId, SubOrgName } = result.data
      if (IsSuccess) {
        var theApp = getApp();
        theApp.createdNewOrg = {
          OrgId: SubOrgId,
          OrgName: thePage.data.SubOrgName,
        }
        wx.navigateBack();
      }
      else {
        showErrorMessage(thePage, ErrorMessage);
      }

    },

    fail(error) {
      wxutil.showModel('创建小小组失败', error);
      console.log('创建小小组失败', error);
    }
  })
}

/**
 * 显示错误消息
 */
function showErrorMessage(thePage, msg) {
  var display = msg == '' ? false : true;
  thePage.setData({ showTopTips: display, errorMessage: msg });
}


