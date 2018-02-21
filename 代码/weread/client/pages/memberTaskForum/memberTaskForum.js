var wxutil = require('../../utils/z-util-wx.js')
const { org, util } = require('../../weread.js')

/**
 * 通用更新当前消息集合的方法
 */
function updateMessages(thePage, updater) {
  var messages = thePage.data.messages;
  updater(messages);

  thePage.setData({ messages });

  // 需要先更新 messagess 数据后再设置滚动位置，否则不能生效
  var lastMessageId = messages.length ? messages[messages.length - 1].id : 'none';
  thePage.setData({ lastMessageId });
}

/**
 * 追加一条消息
 */
function pushMessage(thePage, message) {
  updateMessages(thePage, messages => messages.push(message));
}

/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
  if (!msgUuid.next) {
    msgUuid.next = 0;
  }
  return 'msg-' + (++msgUuid.next);
}

/**
 * 生成聊天室的系统消息
 */
function createSystemMessage(content) {
  return { id: msgUuid(), type: 'system', content };
}

/**
 * 生成聊天室的聊天消息
 */
function createUserMessage(content, user, isMe) {
  return { id: msgUuid(), type: 'speak', content, user, isMe };
}

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject(thePage) {
  var obj = new Object();

  obj.data = {
    messages: [],
    inputContent: 'abc',
    lastMessageId: 'none',
  };

  obj.onLoad = onLoad;

  return obj;
}

/**
 * 载入页面
 */
function onLoad(options) {
  const { MemberTaskId } = options;
  doLoadMemberTask(this, MemberTaskId)
}

/**
 * 载入当前的成员任务
 */
function doLoadMemberTask(thePage, mtid) {

  var pms = {
    MemberTaskId: mtid
  }

  wxutil.showLoading();
  org.getTasks({
    pms,

    success(result) {
      wxutil.hideLoading();

      // 载入任务列表
      const { Tasks, Author } = result.data
      if (Tasks != null && Tasks.length > 0) {
        var task = Tasks[0];

        // 初始化任务交流区
        initTaskForum(thePage, task, Author);
      }

    },
    fail(error) {
      wxutil.showModel('载入任务列表失败', error);
      console.log('载入任务列表失败', error);
    }
  })
}

/**
 * 初始化交流区
 */
function initTaskForum(thePage, task, author) {
  console.log(task, author)

  wx.setNavigationBarTitle({ title: task.OrgName })

  var messages = buildInitMessages(thePage, task, author);
  messages.forEach(x => { pushMessage(thePage, x) })

  //thePage.setData({ Task: task })
}

/**
 * 构建初始化的消息队列
 */
function buildInitMessages(thePage, task, author) {
  var msgList = [];
  var ps = getTaskProcessState(task);
  var otherMessage = '';
  if (ps == -1) {
    msgList.push(createSystemMessage('活动未开始'));
    otherMessage = `开始时间 ${util.formatDate2String(new Date(task.TaskBeginOn), 'M月d日 h点m分')}`;
  } else if (ps == 1) {
    msgList.push(createSystemMessage('活动已结束'));
    otherMessage = `开始时间 ${util.formatDate2String(new Date(task.TaskEndOn), 'M月d日 h点m分')}`;
  } else {
    msgList.push(createSystemMessage('活动进行中'));
    otherMessage = `开始时间 ${util.formatDate2String(new Date(task.TaskBeginOn), 'M月d日 h点m分')}`;
  }

  var taskMessages = buildTaskMessage(task, author);
  msgList = msgList.concat(taskMessages);

  msgList.push(createSystemMessage(otherMessage));
  return msgList;
}

/**
 * 获得任务进度阶段 -1 为开始 ，1 已完成，0 进行中
 */
function getTaskProcessState(task) {
  var dt = Date.now();

  if (dt < new Date(task.TaskBeginOn)) return -1;
  if (dt > new Date(task.TaskEndOn)) return 1;

  return 0;
}

/**
 * 构建任务说明
 */
function buildTaskMessage(task,author) {
  if (task.KindId == 1) return buildTaskMessage_1(task, author);
  if (task.KindId == 2) return buildTaskMessage_2(task, author);

  return createUserMessage(task.TaskTitle, author, false);
}

function buildTaskMessage_1(task, author) {
  var msgs = [];
  msgs.push(createUserMessage(`${task.TaskTitle}${task.KindName}`, author, false));
  msgs.push(createUserMessage(`读完1遍获得${task.TaskBaseScore}个积分，多读可以获得额外积分，最多可以读${task.AllowRepeatCount+1}遍`, author, false));
  return msgs;
}

function buildTaskMessage_2(task, author) {
  var msgs = [];
  msgs.push(createUserMessage(`${task.TaskTitle}签到`, author, false));
  msgs.push(createUserMessage(`签到成功获得 ${task.TaskBaseScore} 个积分`, author, false));
  return msgs;
}


