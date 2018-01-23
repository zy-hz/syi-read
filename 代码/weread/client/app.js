//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
  EntryOptions: null,

  onLaunch: function (options) {
    qcloud.setLoginUrl(config.service.loginUrl);
    this.EntryOptions = options;
  }
})