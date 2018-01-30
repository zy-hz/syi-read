var wxutil = require('../../utils/z-util-wx.js')
const { org, util, dateTimePicker } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    OrgInfo: {},
    TaskKinds: {},
    TaskInfo: {},

    BeginDateTimeSelector: {},
    BeginDateTime: null,
    EndDateTimeSelector: {},
    EndDateTime: null,

    RepeatCountArray: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    RepeatCount: 0,
    TaskScore: 0,

    AssignOptions: [
      { name: '本小组所有成员', value: '1', checked: true },
      { name: '下属小组组长', value: '2' },
      { name: '下属小组所有成员', value: '4' }
    ],

    PublishWays: [
      { name: '立刻发布', value: '1', checked: true },
      { name: '暂不发布', value: '2' }
    ]
  };

  obj.onLoad = onLoad;
  obj.taskContentDone = taskContentDone;
  obj.changeBeginDateTimeColumn = changeBeginDateTimeColumn;
  obj.changeBeginDateTime = changeBeginDateTime;
  obj.changeEndDateTimeColumn = changeEndDateTimeColumn;
  obj.changeEndDateTime = changeEndDateTime;

  obj.bindRepeatChange = bindRepeatChange;
  obj.taskKindsChange = taskKindsChange;
  obj.assignOptionsChange = assignOptionsChange;
  obj.publishWaysChange = publishWaysChange;

  obj.createTaskTitle = createTaskTitle;
  obj.onCancel = onCancel;
  obj.onSubmit = onSubmit;

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

  createDateTimeSelector(this);
  createTaskKindSelector(this);
}

/**
 * 任务内容完成
 */
function taskContentDone(e) {
  var task = this.data.TaskInfo;
  task.TaskContent = e.detail.value;

  this.setData({ TaskInfo: task });
}

function createTaskTitle(e){
  var task = this.data.TaskInfo;
  
  task.TaskTitle = util.getTextSummary(task.TaskContent,32);
  this.setData({ TaskInfo: task });
}

/**
 * 任务类型选择器
 */
function createTaskKindSelector(thePage) {
  wxutil.showLoading();

  org.getTaskKinds({
    OrgId: thePage.data.OrgInfo.OrgId,

    success(result) {
      wxutil.hideLoading();
      // 获得任务类型
      const { TaskKinds } = result.data;
      thePage.setData({ TaskKinds });

      // 获得默认类型的积分
      var score = -1;
      TaskKinds.forEach(x => {
        if (x.IsDefault && score == -1) {
          score = x.KindScore;
          thePage.setData({ TaskScore: score });
        }
      })

    },
    fail(error) {
      wxutil.showModel('获得任务类型失败', error);
      console.log('获得任务类型失败', error);
    }
  })

}

function taskKindsChange(e) {

  var radioItems = this.data.TaskKinds;
  var taskScore = 0;
  for (var i = 0, len = radioItems.length; i < len; ++i) {
    radioItems[i].IsDefault = radioItems[i].KindId == e.detail.value;
    if (radioItems[i].IsDefault) taskScore = radioItems[i].KindScore;
  }

  this.setData({
    TaskKinds: radioItems,
    TaskScore: taskScore,
  });
}

/**
 * 指派类型
 */
function assignOptionsChange(e) {

  var checkboxItems = this.data.AssignOptions, values = e.detail.value;
  for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
    checkboxItems[i].checked = false;

    for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
      if (checkboxItems[i].value == values[j]) {
        checkboxItems[i].checked = true;
        break;
      }
    }
  }

  this.setData({
    AssignOptions: checkboxItems
  });
}

/**
 * 发布方式
 */
function publishWaysChange(e) {

  var radioItems = this.data.PublishWays;
  for (var i = 0, len = radioItems.length; i < len; ++i) {
    radioItems[i].checked = radioItems[i].value == e.detail.value;
  }

  this.setData({
    PublishWays: radioItems
  });
}

/**
 * 创建时间日期选择器
 */
function createDateTimeSelector(thePage) {

  // 开始时间
  createBeginDateTimeSelector(thePage);

  // 截至时间 ,默认三天后
  var end = util.addDay(Date.now(), 3);
  createEndDateTimeSelector(thePage, util.formatDate2String(end, 'yyyy-MM-dd HH:mm:ss'));
}

function createBeginDateTimeSelector(thePage) {

  var begin = dateTimePicker.dateTimePicker(2011, 2100);
  // 精确到分的处理，将数组的秒去掉
  begin.dateTimeArray.pop();
  begin.dateTime.pop();

  thePage.setData({ BeginDateTimeSelector: begin.dateTimeArray, BeginDateTime: begin.dateTime });
}

function createEndDateTimeSelector(thePage, dtString) {

  // 截至时间
  var end = dateTimePicker.dateTimePicker(2011, 2100, dtString);
  // 精确到分的处理，将数组的秒去掉
  end.dateTimeArray.pop();
  end.dateTime.pop();

  thePage.setData({ EndDateTimeSelector: end.dateTimeArray, EndDateTime: end.dateTime });
}

function changeBeginDateTime(e) {
  this.setData({ BeginDateTime: e.detail.value });
}

function changeEndDateTime(e) {
  this.setData({ EndDateTime: e.detail.value });
}

function changeBeginDateTimeColumn(e) {
  var arr = this.data.BeginDateTime, dateArr = this.data.BeginDateTimeSelector;

  arr[e.detail.column] = e.detail.value;
  dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

  this.setData({
    BeginDateTimeSelector: dateArr,
    BeginDateTime: arr
  });
}

function changeEndDateTimeColumn(e) {
  var arr = this.data.EndDateTime, dateArr = this.data.EndDateTimeSelector;

  arr[e.detail.column] = e.detail.value;
  dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

  this.setData({
    EndDateTimeSelector: dateArr,
    EndDateTime: arr
  });
}

/**
 * 重复次数
 */
function bindRepeatChange(e) {
  this.setData({ RepeatCount: e.detail.value });
}

/**
 * 取消
 */
function onCancel() {
  wx.navigateBack();
}

/**
 * 提交
 */
function onSubmit() {
  if (!verifyInputContent(this)) {
    this.setData({ showTopTips: true })
    return;
  }

  setSubmitState(this, true);
}

function verifyInputContent(thePage) {
  return true;
}

function setSubmitState(thePage, begin) {
  thePage.setData({ BeginSubmit: begin })
}