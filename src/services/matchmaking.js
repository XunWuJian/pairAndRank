const crypto = require('crypto'); // 引入 Node.js 内置 crypto 模块，用于生成唯一房间 ID

const waitingQueue = []; // 维护等待匹配的玩家 ID 队列
const activeMatches = new Map(); // 使用房间 ID 关联一对匹配玩家列表 [playerA, playerB]

function joinQueue(playerId) { // 处理玩家进入匹配队列的逻辑
  if (!playerId) throw new Error('playerId required'); // 若缺少玩家标识则抛出异常
  if (waitingQueue.includes(playerId)) return { status: 'already_in_queue' }; // 防止玩家重复排队
  waitingQueue.push(playerId); // 将玩家加入等待队列

  if (waitingQueue.length >= 2) { // 当队列中至少存在两名玩家时尝试匹配
    const a = waitingQueue.shift(); // 取出排在最前的玩家作为匹配一方
    const b = waitingQueue.shift(); // 继续取出下一位玩家组成配对
    const roomId = crypto.randomUUID(); // 生成唯一房间 ID 标识当前对局
    activeMatches.set(roomId, [a, b]); // 将配对结果记录到活动房间映射
    return { status: 'matched', roomId, players: [a, b] }; // 返回匹配成功状态和双方玩家信息
  } // 匹配成功分支结束
  return { status: 'queued' }; // 队列人数不足时告知玩家继续排队
} // joinQueue 函数结束

function leaveQueue(playerId) { // 处理玩家主动离开排队的逻辑
  const idx = waitingQueue.indexOf(playerId); // 查找玩家在队列中的位置
  if (idx >= 0) { // 若玩家存在于队列中
    waitingQueue.splice(idx, 1); // 将该玩家从队列中移除
    return { status: 'left' }; // 返回离队成功状态
  } // 玩家存在分支结束
  return { status: 'not_in_queue' }; // 玩家不在队列中时返回提示状态
} // leaveQueue 函数结束

function getQueueSize() { // 获取当前排队人数
  return waitingQueue.length; // 返回等待队列的长度
} // getQueueSize 函数结束

function getMatch(roomId) { // 根据房间 ID 查询匹配结果
  return activeMatches.get(roomId) || null; // 若找到匹配则返回玩家列表，否则返回 null
} // getMatch 函数结束

module.exports = { // 导出匹配服务的外部接口
  joinQueue, // 暴露加入队列方法
  leaveQueue, // 暴露离开队列方法
  getQueueSize, // 暴露获取排队人数方法
  getMatch, // 暴露查询匹配信息方法
}; // 导出对象定义结束
