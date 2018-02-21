// YZhang 的常用函数

//
// 日期和时间 相关
//

// 时间格式转换 yyyy/MM/dd HH:mm:ss
function formatDate2String(date, fmt) {
  var o = {
    "M+": date.getMonth() + 1, //月份         
    "d+": date.getDate(), //日         
    "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时         
    "H+": date.getHours(), //小时         
    "m+": date.getMinutes(), //分         
    "s+": date.getSeconds(), //秒         
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度         
    "S": date.getMilliseconds() //毫秒         
  };
  var week = {
    "0": "/u65e5",
    "1": "/u4e00",
    "2": "/u4e8c",
    "3": "/u4e09",
    "4": "/u56db",
    "5": "/u4e94",
    "6": "/u516d"
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

// 计算变化多少天后的日期
function addDay(d, days) {
  var d = new Date(d);
  return new Date(d.setDate(d.getDate() + days));
}

function dateDiff(startTime, endTime, diffType) {
  //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式 
  startTime = startTime.replace(/\-/g, "/");
  endTime = endTime.replace(/\-/g, "/");

  //将计算间隔类性字符转换为小写
  diffType = diffType.toLowerCase();
  var sTime = new Date(startTime); //开始时间
  var eTime = new Date(endTime); //结束时间
  //作为除数的数字
  var divNum = 1;
  switch (diffType) {
    case "second":
      divNum = 1000;
      break;
    case "minute":
      divNum = 1000 * 60;
      break;
    case "hour":
      divNum = 1000 * 3600;
      break;
    case "day":
      divNum = 1000 * 3600 * 24;
      break;
    default:
      break;
  }
  return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
}

// 获得本周周日的日期
function FirstDayInThisWeek(d) {
  var d = new Date(d);
  return DateAddDay(d, 0 - d.getDay());
}

// 判断类型
function Type(obj) {
  var typeStr = Object.prototype.toString.call(obj).split(" ")[1];
  return typeStr.substr(0, typeStr.length - 1).toLowerCase();
}

function isEmpty(obj) {
  for (var i in obj) return false;
  return true;
}

// 获得中文的星期
function getDay_zh(obj) {
  var week = obj.getDay();
  if (week == 1) return "星期一";
  if (week == 2) return "星期二";
  if (week == 3) return "星期三";
  if (week == 4) return "星期四";
  if (week == 5) return "星期五";
  if (week == 6) return "星期六";
  return "星期天";
}

//
// 字符串 相关
//

/**
 * 获得一个文件的简介
 */
function getTextSummary(txt, len) {
  if (txt == null) return "";
  txt = txt.trim();
  
  return txt.substr(0, len);
}

/**
 * 验证输入的字符串是否符合标准
 */
function verifyInputName(txt,len){
  if (txt.length > len ) return `不能超过${len}个字符`;
  if (txt.match(/[^\u4e00-\u9fa5A-Za-z0-9-]/)) return '只能包括中文英文和数字';
  
  return ""
}

// -----------------------------------------------------

// 构建连接带入对象参数,使用json
function buildUrlWithObjectParams(url, obj) {
  if (obj == null) return url;

  var str = encodeURI(JSON.stringify(obj));
  return `${url}?json=${str}`;
}

// 获得json对象
function getObjectFromOptions(options) {
  if (options == null || options.json == null) return null;

  var str = decodeURI(options.json);
  return JSON.parse(str);
}


/**
 * 从传入的参数获得小组信息
 */
function getOrgInfoFromOptions(options) {
  return {
    OrgId: options.OrgId,
    OrgName: decodeURI(options.OrgName),
    OrgAvater: decodeURI(options.OrgAvater)
  }
}

/**
 * 构建组织的url参数
 */
function buildOrgUrlParams(o) {
  return `OrgId=${o.OrgId}&OrgName=${encodeURI(o.OrgName)}&OrgAvater=${encodeURI(o.OrgAvatar)}`;
}

module.exports = {
  buildOrgUrlParams,
  getOrgInfoFromOptions,
  formatDate2String,
  addDay,

  getTextSummary,
  verifyInputName,
}

