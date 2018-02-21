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

/**
 * 创建签到的信息
 */
function createCheckInMessage(name, dt, cnt) {
  var dtString = util.formatDate2String(new Date(dt), 'MMdd');
  return `${name}+${dtString}+${cnt}`;
}

// 页面函数，传入一个object对象作为参数
Page(createPageObject());

// 创建页面对象
function createPageObject(thePage) {
  var obj = new Object();

  obj.data = {
    IsTaskClose: false,
    ProcessState: 0,
    messages: [],
    lastMessageId: 'none',

    FuncPanel: [{
      FuncName: '打卡',
      ShowRepeatSelector: true
    },
    {
      FuncName: '签到',
      ShowRepeatSelector: false
    }],
    FuncIndex: 1,

    RepeatCountArray: [],
    RepeatNumber: 0,

  };

  obj.onLoad = onLoad;
  obj.bindRepeatCountChange = bindRepeatCountChange;
  obj.onExit = () => { wx.navigateBack() };
  obj.onSubmit = onSubmit;

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
      const { Tasks, Author, Me } = result.data
      if (Tasks != null && Tasks.length > 0) {
        var task = Tasks[0];

        // 初始化任务交流区
        initTaskForum(thePage, task, Author);

        // 载入历史
        doLoadTaskHistory(thePage, task);
      }

      thePage.Me = Me;

    },
    fail(error) {
      wxutil.showModel('载入任务列表失败', error);
      console.log('载入任务列表失败', error);
    }
  })
}

/**
 * 载入历史
 */
function doLoadTaskHistory(thePage, task) {

  wxutil.showLoading();
  org.getMemberTaskDoneLog({
    pms: {
      TaskId: task.TaskId,
      OrgId: task.OrgId,
    },

    success(result) {
      wxutil.hideLoading();

      // 载入任务列表
      const { DoneLogs } = result.data
      if (DoneLogs != null && DoneLogs.length > 0) {
        DoneLogs.reverse();

        // 设置历史消息
        var messages = buildHistoryMessages(thePage, DoneLogs);
        messages.forEach(x => { pushMessage(thePage, x) })

      }

    },
    fail(error) {
      wxutil.showModel('载入历史列表失败', error);
      console.log('载入历史列表失败', error);
    }
  })
}

/**
 * 初始化交流区
 */
function initTaskForum(thePage, task, author) {
  wx.setNavigationBarTitle({ title: task.OrgName })

  // 设置初始化消息
  var messages = buildInitMessages(thePage, task, author);
  messages.forEach(x => { pushMessage(thePage, x) })

  // 设置操作面板
  var funcIndex = task.KindId == 1 ? 0 : 1;

  // 设置重复次数
  var RepeatCountArray = [];
  for (var i = 0; i <= task.AllowRepeatCount; i++) {
    RepeatCountArray.push(i + 1);
  }

  // 数据设置
  thePage.setData({ RepeatCountArray, FuncIndex: funcIndex, Task: task });

  if (task.is_done) {  // 任务完成
    thePage.setData({ IsTaskClose: true, ProcessState: 0 })
  } else {
    // 检查任务进度
    var ps = getTaskProcessState(task);
    thePage.setData({ IsTaskClose: ps == 0 ? false : true, ProcessState: ps })
  }
}

/**
 * 构建初始化的消息队列
 */
function buildInitMessages(thePage, task, author) {
  var ps = getTaskProcessState(task);

  var msgList = [];
  var otherMessage = '';
  if (ps == -1) {
    msgList.push(createSystemMessage('活动未开始'));
    otherMessage = `开始时间 ${util.formatDate2String(new Date(task.TaskBeginOn), 'M月d日 H点m分')}`;
  } else if (ps == 1) {
    msgList.push(createSystemMessage('活动已结束'));
    otherMessage = `结束时间 ${util.formatDate2String(new Date(task.TaskEndOn), 'M月d日 H点m分')}`;
  } else {
    msgList.push(createSystemMessage('活动进行中'));
    otherMessage = `截止时间 ${util.formatDate2String(new Date(task.TaskEndOn), 'M月d日 H点m分')}`;
  }

  var taskMessages = buildTaskMessage(task, author);
  msgList = msgList.concat(taskMessages);

  msgList.push(createSystemMessage(otherMessage));
  return msgList;
}

/**
 * 历史信息
 */
function buildHistoryMessages(thePage, hisLogs) {
  if (hisLogs.length == 0) return [];

  return hisLogs.map(x => {
    var txt = createCheckInMessage(x.NickName, new Date(x.ExecuteOn), x.RepeatNumber - 0 + 1);
    var isMe = thePage.Me.id == x.UserId ? true : false;
    var msg = createUserMessage(txt, { NickName: x.NickName, AvatarUrl: x.AvatarUrl }, isMe);

    return msg;
  })
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
function buildTaskMessage(task, author) {
  if (task.KindId == 1) return buildTaskMessage_1(task, author);
  if (task.KindId == 2) return buildTaskMessage_2(task, author);

  return createUserMessage(task.TaskTitle, author, false);
}

function buildTaskMessage_1(task, author) {
  var msgs = [];
  msgs.push(createUserMessage(`${task.TaskTitle}${task.KindName}`, author, false));
  msgs.push(createUserMessage(`读完1遍获得${task.TaskBaseScore}个积分，多读可以获得额外积分，最多可以读${task.AllowRepeatCount + 1}遍`, author, false));
  return msgs;
}

function buildTaskMessage_2(task, author) {
  var msgs = [];
  msgs.push(createUserMessage(`${task.TaskTitle}签到`, author, false));
  msgs.push(createUserMessage(`签到成功获得 ${task.TaskBaseScore} 个积分`, author, false));
  return msgs;
}

/**
 * 重复次数
 */
function bindRepeatCountChange(options) {
  this.setData({ RepeatNumber: options.detail.value })
}

/**
 * 提交
 */
function onSubmit() {
  this.setData({ IsSubmiting: true });
  var thePage = this;

  org.setMemberTaskDone({
    pms: {
      MemberTaskId: thePage.data.Task.id,
      TaskAuthorId: thePage.data.Task.TaskAuthorId,
      KindId: thePage.data.Task.KindId,
      RepeatNumber: thePage.data.RepeatNumber,
      TaskBaseScore: thePage.data.Task.TaskBaseScore,
      TaskBeginOn: thePage.data.Task.TaskBeginOn,
      TaskEndOn: thePage.data.Task.TaskEndOn,
    },

    success(result) {
      thePage.setData({ IsSubmiting: false });

      // 打卡签到完成
      const { IsDone, TaskScore } = result.data
      if (IsDone == true) onTaskDone(thePage, TaskScore);
    },

    fail(error) {
      wxutil.showModel('标记成员任务完成失败', error);
      console.log('标记成员任务完成失败', error);
    }
  })
}

/**
 * 任务完成
 */
function onTaskDone(thePage, score) {
  //  推送成功的消息
  var txt = createCheckInMessage(thePage.Me.NickName, new Date(), thePage.data.RepeatNumber - 0 + 1);
  var msg = createUserMessage(txt, thePage.Me, true);
  pushMessage(thePage, msg);

  var task = thePage.data.Task;
  task.TaskScore = score;
  task.is_done = true;

  // 设置任务关闭
  thePage.setData({ IsTaskClose: true, Task: task })
}