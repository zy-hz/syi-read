var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    HiddenNoDataPanel: true,

    // 列表中最小的任务编号
    MinTaskId: -1,
    // 任务列表
    Tasks: {}
  };

  obj.onLoad = onLoad;
  obj.onShow = onShow;
  obj.onReachBottom = onReachBottom;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {

  wx.setNavigationBarTitle({
    title: "任务",
  })

  this.setData({ HiddenNoDataPanel: false })
}

function onShow() {
  // 载入任务列表
  doLoadTasks(this);
}

/**
 * 页面滚到到底部了
 */
function onReachBottom() {
  console.log("on bottom");
}

/**
 * 载入任务
 */
function doLoadTasks(thePage) {
  // 载入的参数
  var pms = {
    Limit: 20,
    MinTaskId: thePage.data.MinTaskId,
  }

  wxutil.showLoading();
  org.getTasks({
    pms,

    success(result) {
      wxutil.hideLoading();

      // 载入任务列表
      const { Tasks } = result.data
      if (Tasks != null && Tasks.length > 0) {
        var sortedTasks = updateTasks(Tasks);
        thePage.setData({ Tasks: sortedTasks, HiddenNoDataPanel: true })

        console.log(sortedTasks)
      }
    },
    fail(error) {
      wxutil.showModel('载入任务列表失败', error);
      console.log('载入任务列表失败', error);
    }
  })
}

/**
 * 更新任务队列
 */
function updateTasks(tasks) {
  tasks.forEach(x => {
    var ts = getTaskProcessState(x)
    x.TaskStateId = ts.id;
    x.TaskStateName = ts.name;
    x.TaskStateClass = ts.class;

    x.TaskImageUrl = x.KindId == 1 ? '/images/task_kind_bible.png' : '/images/group_1.png';
    x.TaskDisplayTime = util.formatDate2String(new Date(x.TaskBeginOn), 'MM月dd日');
  })

  return tasks.sort(function (x, y) {
    if (x.TaskStateId != y.TaskStateId) return x.TaskStateId - y.TaskStateId;
    return x.TaskBeginOn > y.TaskBeginOn ? 1 : -1;
  });
}

/**
 * 获得任务进度阶段 -1 为开始 ，1 已完成，0 进行中
 */
function getTaskProcessState(task) {
  var dt = Date.now();

  if (dt < new Date(task.TaskBeginOn)) return { id: -1, name: '预告', class: 'weread-task__notice' };
  if (dt > new Date(task.TaskEndOn)) return { id: 1, name: '关闭', class: 'weread-task__expired' };

  return { id: 0, name: '', class: 'weread-task__running' };;
}
