// YZhang 的常用函数

//
// 日期和时间 相关
//


// -----------------------------------------------------


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
function buildOrgUrlParams(o){
  return `OrgId = ${o.OrgId}&OrgName=${encodeURI(o.OrgName)}&OrgAvater=${encodeURI(o.OrgAvatar)}`;
}

module.exports = {
  buildOrgUrlParams,
  getOrgInfoFromOptions,
}