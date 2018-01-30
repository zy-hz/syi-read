var wxutil = require('../../utils/z-util-wx.js')
const { org, util, dateTimePicker } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    OrgInfo: {},

    BeginDateTimeSelector: {},
    BeginDateTime:null,
    EndDateTimeSelector: {},
    EndDateTime: null,
  };

  obj.onLoad = onLoad;
  obj.changeBeginDateTimeColumn = changeBeginDateTimeColumn;
  obj.changeBeginDateTime = changeBeginDateTime;
  obj.changeEndDateTimeColumn = changeEndDateTimeColumn;
  obj.changeEndDateTime = changeEndDateTime;
  
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
}

/**
 * 创建时间日期选择器
 */
function createDateTimeSelector(thePage) {

  // 开始时间
  var begin = dateTimePicker.dateTimePicker(2011, 2100);
  // 精确到分的处理，将数组的秒去掉
  begin.dateTimeArray.pop();
  begin.dateTime.pop();

  thePage.setData({ BeginDateTimeSelector: begin.dateTimeArray, BeginDateTime: begin.dateTime});

  // 截至时间
  var end = dateTimePicker.dateTimePicker(2011, 2100,"2018-02-01 11:22:33");
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