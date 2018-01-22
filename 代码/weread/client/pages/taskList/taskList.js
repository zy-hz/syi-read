var org = require('../../vendor/weread-client-sdk/lib/org.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    tasks: {},
  };

  obj.onLoad = onLoad;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  org.checkUserAuth({
    afterNoAuth(){
      wx.reLaunch({ url: '/pages/welcome/welcome' })
    },

    afterHasAuth(){

    },

    fail(err){

    }

  })
}