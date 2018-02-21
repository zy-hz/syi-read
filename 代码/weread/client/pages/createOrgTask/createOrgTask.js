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

    TaskContent: '',
    TaskTitle: '',
    TaskScore: 0,

    BeginDateTimeSelector: {},
    BeginDateTime: null,
    EndDateTimeSelector: {},
    EndDateTime: null,

    RepeatCountArray: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    RepeatCount: 0,

    AssignOptions: [
      { name: '本小组所有成员', value: '1', attr: "ToMemberOrg", checked: true },
      //{ name: '由下属小组组长转发', value: '2', attr: "ToMemberAll" },
      //{ name: '下属小组所有成员', value: '4', attr: "ToSubOrg" }
    ],

    VisiableForRange: [
      { name: '无', value: '0' },
      { name: '同组成员', value: '1', checked: true },
      { name: '参与任务的所有成员', value: '2' }
    ],
    VisiableFor: 1,

    PublishWays: [
      { name: '立刻发布', value: '1', checked: true },
      { name: '暂不发布', value: '0' }
    ],
    IsPublished: 1,

    TypeView: [{
      Label: '书目',
      InputTips: '请选择 ...',
      InputDisabled: false,
    },
    {
      Label: '标题',
      InputTips: '不超过10个中文英文数字字符',
      InputDisabled: false,
    }],
    TypeIndex: 0,
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
  obj.visiableForRangeChange = visiableForRangeChange;
  obj.publishWaysChange = publishWaysChange;

  obj.createTaskTitle = createTaskTitle;
  obj.onInputTaskTitle = onInputTaskTitle;
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
  this.setData({ TaskContent: e.detail.value });
}

function createTaskTitle(e) {
  var title = util.getTextSummary(this.data.TaskContent, 32);
  this.setData({ TaskTitle: title });
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
      var kind = getSelectedTaskKind(thePage);
      thePage.setData({ TaskScore: kind.KindScore });

    },
    fail(error) {
      wxutil.showModel('获得任务类型失败', error);
      console.log('获得任务类型失败', error);
    }
  })

}

function taskKindsChange(e) {

  var radioItems = this.data.TaskKinds;
  var task = this.data.TaskInfo;

  var taskScore = 0;
  for (var i = 0, len = radioItems.length; i < len; ++i) {
    radioItems[i].IsDefault = radioItems[i].KindId == e.detail.value;
    if (radioItems[i].IsDefault) taskScore = radioItems[i].KindScore;
  }

  this.setData({
    TaskKinds: radioItems,
    TaskScore: taskScore,
    TypeIndex: e.detail.value - 1,
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
  var isPublished = -1;
  for (var i = 0, len = radioItems.length; i < len; ++i) {
    radioItems[i].checked = radioItems[i].value == e.detail.value;
    if (radioItems[i].checked) isPublished = radioItems[i].value;
  }

  this.setData({
    PublishWays: radioItems,
    IsPublished: isPublished
  });
}

/**
 * 任务交流范围
 */
function visiableForRangeChange(e) {

  var radioItems = this.data.VisiableForRange;
  var vf = -1;
  for (var i = 0, len = radioItems.length; i < len; ++i) {
    radioItems[i].checked = radioItems[i].value == e.detail.value;
    if (radioItems[i].checked) vf = radioItems[i].value;
  }

  this.setData({
    VisiableForRange: radioItems,
    VisiableFor: vf
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
 * 输入任务标题
 */
function onInputTaskTitle(options) {
  this.setData({ TaskTitle: options.detail.value })
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
  // 数据检查
  var resultMsg = verifyInputContent(this);
  if (resultMsg != '') {
    showErrorMessage(this, resultMsg);
    return;
  } else {
    showErrorMessage(this, '');
  }
  var task = getTaskInfoFromInput(this);

  setSubmitState(this, true);
  var thePage = this;

  org.createNewTask({
    Task: task,
    success(result) {
      setSubmitState(thePage, false);

      // 创建任务成功
      const { TaskId } = result.data;
      wx.navigateBack();
    },
    fail(error) {
      wxutil.showModel('创建任务失败', error);
      console.log('创建任务失败', error);

      setSubmitState(thePage, false);
    }
  })
}

function verifyInputContent(thePage) {
  if (thePage.data.TaskTitle == '') return `${thePage.data.TypeView[thePage.data.TypeIndex].Label}不能为空。`;
  var len = thePage.data.TypeIndex == 0 ? 32 : 10;
  return util.verifyInputName(thePage.data.TaskTitle, len);;
}

function getTaskInfoFromInput(thePage) {
  var task = thePage.data.TaskInfo;
  task.OrgId = thePage.data.OrgInfo.OrgId;

  var kind = getSelectedTaskKind(thePage);
  task.KindId = kind.KindId;

  task.TaskContent = thePage.data.TaskContent;
  task.TaskTitle = thePage.data.TaskTitle;
  task.TaskScore = parseInt(thePage.data.TaskScore);
  task.RepeatCount = parseInt(thePage.data.RepeatCount);
  task.BeginDateTime = getDateTimeFromSelector(thePage.data.BeginDateTimeSelector, thePage.data.BeginDateTime);
  task.EndDateTime = getDateTimeFromSelector(thePage.data.EndDateTimeSelector, thePage.data.EndDateTime);
  task.VisiableFor = parseInt(thePage.data.VisiableFor);
  task.IsPublished = parseInt(thePage.data.IsPublished);

  task = setTaskAssignOptions(thePage, task);
  return task;
}

function getSelectedTaskKind(thePage) {
  var taskKinds = thePage.data.TaskKinds;
  return taskKinds.find(x => {
    return x.IsDefault;
  })
}

function getDateTimeFromSelector(BeginDateTimeSelector, BeginDateTime) {
  return `${BeginDateTimeSelector[0][BeginDateTime[0]]}-${BeginDateTimeSelector[1][BeginDateTime[1]]}-${BeginDateTimeSelector[2][BeginDateTime[2]]} ${BeginDateTimeSelector[3][BeginDateTime[3]]}:${BeginDateTimeSelector[4][BeginDateTime[4]]}:00`;
}

function setTaskAssignOptions(thePage, task) {
  var opts = thePage.data.AssignOptions;
  opts.forEach(x => {
    var attr = x.attr
    var result = x.checked == true ? 1 : 0;
    task[attr] = result;
  })

  return task;
}

function setSubmitState(thePage, begin) {
  thePage.setData({ BeginSubmit: begin })
}

/**
 * 显示错误消息
 */
function showErrorMessage(thePage, msg) {
  var display = msg == '' ? false : true;
  thePage.setData({ showTopTips: display, errorMessage: msg });
}