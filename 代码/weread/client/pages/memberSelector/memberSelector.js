var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    Members: {}
  };

  obj.onLoad = onLoad;
  obj.onSelected = onSelected;
  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  const { Title, OrgId } = options;

  var title = decodeURI(Title);
  wx.setNavigationBarTitle({ title });

  var thePage = this;

  wxutil.showLoading();
  org.getMembers({
    pms: { OrgId },

    success(result) {
      wxutil.hideLoading();

      const { Members } = result.data
      thePage.setData({ Members});

      console.log(Members);
    },

    fail(error) {
      wxutil.showModel('获取成员列表失败', error);
      console.log('获取成员列表失败', error);
    }
  })
}

function onSelected(options){
  var theApp = getApp();
  theApp.selectedMember = options.currentTarget.dataset.member;
  wx.navigateBack();
}



