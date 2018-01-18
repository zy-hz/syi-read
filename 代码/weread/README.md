# WeRead 微信小程序开发手册

WeRead 采用微信 Wafer2 开发套件提供底层会话、用户验证以及长连接服务。

## 目录

- 数据库初始化工具
- 服务端开发文档
- 客户端开发文档

## 数据库初始化工具

本工具是为了让用户快速的按照腾讯云制定的数据库 schema 创建符合 SDK 标准的数据库结构。

_**注意**：本工具支持的 MySQL 版本为 **5.7**，并且需提前在数据库中创建名为 `cAuth` 的数据库。`charset` 设置为 `utf8mb4`。_

快速使用：

```bash
npm run initdb
```

或直接执行 `tools` 目录下的 `initdb.js` 文件：

```bash
# 请保证已经执行了 npm install 安装了所需要的依赖
node tools/initdb.js
```

我们提供了初始化的 SQL 文件，你也可以用其他数据库工具（如 Navicat）直接导入 SQL 文件。

## 服务端开发文档

- 代码部署目录：`/data/release/node-weread`
- 运行 Node 版本：`v8.1.0`
- Node 进程管理工具：`pm2`

### 项目结构

```
koa-weread
├── README.md
├── app.js
├── controllers
│   ├── index.js
│   ├── login.js
│   ├── message.js
│   ├── tunnel.js
│   ├── upload.js
│   └── user.js
├── middlewares
│   └── response.js
├── config.js
├── package.json
├── process.json
├── nodemon.json
├── qcloud.js
└── routes
    └── index.js
```

`app.js` 是 WeRead 主入口文件，WeRead 使用 Koa 框架，在 `app.js` 创建一个 Koa 实例并响应请求。

`routes/index.js` 是 WeRead 的路由定义文件

`controllers` 存放 WeRead 所有业务逻辑的目录，`index.js` 不需要修改，他会动态的将 `controllers` 文件夹下的目录结构映射成 modules 的 Object，例如 WeRead 中的目录将会被映射成如下的结构：

```javascript
// index.js 输出
{
  login: require('login'),
  message: require('message'),
  tunnel: require('tunnel'),
  upload: require('upload'),
  user: require('user')
}
```

`qcloud.js` 导出了一个 SDK 的单例，包含了所有的 SDK 接口，之后使用的时候只需要 `require` 这个文件就行，无需重复初始化 SDK。

`config.js` 主要的配置如下：

```javascript
{
  port: '5757',                             // 项目启动的端口

  appId: 'wx00dd00dd00dd00dd',              // 微信小程序 App ID
  appSecret: 'abcdefg',                     // 微信小程序 App Secret
  wxLoginExpires: 7200,                     // 微信登录态有效期
  useQcloudLogin: false,                    // 是否使用腾讯云代理登录

  /**
   * MySQL 配置，用来存储用户登录态和用户信息
   * 如果不提供 MySQL 配置，模式会使用自动配置好的本地镜像中的 MySQL 储存信息
   * 具体查看文档-登录态储存和校验
   **/
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    db: 'cAuth',
    pass: '',
    char: 'utf8'
  },
  
  // COS 配置，用于上传模块使用
  cos: {
    /**
     * 区域
     * 华北：cn-north
     * 华东：cn-east
     * 华南：cn-south
     * 西南：cn-southwest
     */
    region: 'cn-south',
    fileBucket: 'test',                    // Bucket 名称
    uploadFolder: ''                       // 文件夹
  }
}
```

除了 `config.js` ，腾讯云还会在你初始化小程序解决方案的时候，向你的机器下发 `/data/release/sdk.config.json`，里面包含了你的腾讯云 AppId、SecretId、SecretKey 和服务器等信息，无需修改，`qcloud.js` 会自动引入。如果想要在自己的机器上部署 SDK 的 Demo，请查看[自行部署 Demo 说明]()。

除此以外，关于 SDK 的详细配置信息，还可以查看 [SDK 的 API 文档]()。

##客户端开发文档