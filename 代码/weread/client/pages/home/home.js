var wxutil = require('../../utils/z-util-wx.js')
const { org, task } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    SummaryObjects: {},
  };

  obj.onLoad = onLoad;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  wx.setNavigationBarTitle({
    title: '随义读书',
  })

  var thePage = this;
  var sobjs = [{ title: "任务", score: 122 }, { title: "小组", score: 1 }, { title: "积分", score: 2233 }];
  this.setData({ SummaryObjects:sobjs });
}

