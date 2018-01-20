const { org } = require('../../weread.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasAuthorized: false,
    NoticeTitle: "嗨，",
    NoticeContent: "我们在产品中需要用到您在微信上的公开信息，比如：昵称和头像。请前往授权。",
  },

  // 点击用户授权
  doGetUserInfo: function (options) {
    if (options.detail.userInfo != null) {
      this.doRegistUser()
    }
    else {
      this.setData({
        NoticeTitle: "亲爱的，",
        NoticeContent: "您的公开信息不会涉及您的个人隐私信息。您可以放心授权。",
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '欢迎',
    })
    var thePage = this;

    wx.getSetting({
      success(res) {
        var isAuth = res.authSetting['scope.userInfo'];
        if (isAuth == undefined) isAuth = false;

        thePage.setData({ hasAuthorized: isAuth });
      }
    })
  },

  // 用户注册
  doRegistUser: function () {
    org.registUser({
      success(result) {
        // 注册成功后的转向
        wx.reLaunch({ url: '/pages/taskBlock/taskBlock' })
      },
      fail(error) {
        console.log('用户注册失败', error);
      }
    })
  },

})