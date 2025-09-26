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
  return null; // 'single' 或 'empty'
}

async function joinQueue(playerId) {
  if (!playerId) throw new Error('playerId required');
  console.log('[joinQueue] pushing', playerId);
  await redis.lPush(QUEUE_KEY, playerId);
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
  const data = await redis.hGetAll(`mm:room:${roomId}`);
  if (!data || (!data.a && !data.b)) return null;
  return [data.a, data.b];
}


module.exports = { joinQueue, leaveQueue, getQueueSize, getMatch, takePairAndCreateRoomAtomic };
