const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // 引入 Node.js 内置 crypto 模块，用于生成唯一房间 ID
const { redis } = require('../config/redis');

const QUEUE_KEY = 'mm:queue';
const ROOM_PREFIX = 'mm:room:';

let pairScriptSha;
async function getPairScriptSha() {
  if (!pairScriptSha) {
    const lua = fs.readFileSync(path.join(__dirname, '../scripts/match_pair.lua'), 'utf8');
    pairScriptSha = await redis.scriptLoad(lua);
  }
  return pairScriptSha;
}

async function takePairAndCreateRoomAtomic() {
  const sha = await getPairScriptSha();
  const roomId = crypto.randomUUID();
  const r = await redis.evalSha(sha, { keys: [QUEUE_KEY, ROOM_PREFIX], arguments: [roomId] });
  if (r[1] === 'paired') return { roomId, players: [r[2], r[3]] };
  return null; // 'single' 或 'empty' 或 'duplicate'
}

async function joinQueue(playerId) {
  if (!playerId) throw new Error('playerId required');

  // 若已在房间（映射存在），直接返回匹配结果或清理映射后继续
  const existingRoom = await redis.get(`mm:player-room:${playerId}`);
  if (existingRoom) {
    const roomKey = `${ROOM_PREFIX}${existingRoom}`;
    const data = await redis.hGetAll(roomKey);
    if (data && Object.keys(data).length > 0 && !data.result) {
      const players = [data.a, data.b].filter(Boolean);
      return { status: 'matched', roomId: existingRoom, players };
    }
    await redis.del(`mm:player-room:${playerId}`);
  }

  // 队列去重：使用 LPOS 判断是否已在队列
  const pos = await redis.lPos(QUEUE_KEY, playerId);
  if (pos !== null && pos !== undefined) {
    return { status: 'already_in_queue' };
  }

  console.log('[joinQueue] pushing', playerId);
  await redis.lPush(QUEUE_KEY, playerId);

  // 尝试立即原子配对，若该玩家被配中则直接返回 matched
  const res = await takePairAndCreateRoomAtomic();
  if (res && Array.isArray(res.players) && res.players.includes(playerId)) {
    return { status: 'matched', roomId: res.roomId, players: res.players };
  }
  return { status: 'queued' };
}

async function leaveQueue(playerId) {
  await redis.lRem(QUEUE_KEY, 0, playerId); // 删除所有匹配项
  return { status: 'left' };
}

async function getQueueSize() {
  return await redis.lLen(QUEUE_KEY);
}

async function getMatch(roomId) {
  const data = await redis.hGetAll(`${ROOM_PREFIX}${roomId}`);
  if (!data || (!data.a && !data.b)) return null;
  return [data.a, data.b];
}

async function getPlayerRoom(playerId) {
  const roomId = await redis.get(`mm:player-room:${playerId}`);
  if (!roomId) return null;
  const players = await getMatch(roomId);
  if (!players) return null;
  return { roomId, players };
}

module.exports = { joinQueue, leaveQueue, getQueueSize, getMatch, takePairAndCreateRoomAtomic, getPlayerRoom };
