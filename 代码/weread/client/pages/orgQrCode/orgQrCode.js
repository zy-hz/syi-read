var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject() {
  var obj = new Object();

  obj.data = {
    OrgInfo: {},
  
  };

  obj.onLoad = onLoad;
  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  var orgInfo = util.getOrgInfoFromOptions(options);

  wx.setNavigationBarTitle({
    title: "二维码名片",
  })

  this.setData({ OrgInfo: orgInfo })
  doLoadQrCode(this, orgInfo )
}

/**
 * 获得二维码
 */
function doLoadQrCode(thePage,orgInfo){
  wx.request({
    url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=6_nnUOXuuTwUplIzJcYRTV-IhfUsm0wRvrpg8odq8y7O-3EAerPObVdk9XyH6_bjEbKPLjTReLxvv2eO1v7fvLcbexqbKCHS835j4uYRsCT_USxXFQWTfKvLIYBfz8Exuvq5TtiaJlrCUQKh1YKLAbAFAYZO', //仅为示例，并非真实的接口地址
    data: {
      scene: 'JOINORG',
      page: '',
      auto_color:true
    },

    method:'POST',
    responseType:'arraybuffer',

    success: function (res) {
      const base64 = wx.arrayBufferToBase64(res.data)  
      thePage.setData({ QrCodeUrl: "data:image/png;base64," + base64 });

      console.log(res)
    }
  })
}


