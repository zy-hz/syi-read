var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {


  };

  obj.onLoad = onLoad;
  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  const { MemberTaskId } = options;

  //wx.setNavigationBarTitle({ title: orgInfo.OrgName })


  doLoadMemberTask(this, MemberTaskId)
}

/**
 * 载入当前的成员任务
 */
function doLoadMemberTask(thePage, mtid) {

  var pms = {
    MemberTaskId: mtid
  }

  wxutil.showLoading();
  org.getTasks({
    pms,

    success(result) {
      wxutil.hideLoading();

      // 载入任务列表
      const { Tasks } = result.data
      if (Tasks != null && Tasks.length > 0) {
        var task = Tasks[0];

        thePage.setData({ Task: task })
      }

      console.log(Tasks)

    },
    fail(error) {
      wxutil.showModel('载入任务列表失败', error);
      console.log('载入任务列表失败', error);
    }
  })
}