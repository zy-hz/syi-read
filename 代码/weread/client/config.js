/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://bgn7tmky.qcloud.la';
var baseUrl = `${host}/weread`;

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,
        baseUrl,

        // 登录地址，用于建立会话
        loginUrl: `${baseUrl}/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${baseUrl}/user`,

        // 测试的信道服务地址
        tunnelUrl: `${baseUrl}/tunnel`,

        // 上传图片接口
        uploadUrl: `${baseUrl}/upload`

        
    }
};

module.exports = config;
