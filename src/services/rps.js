const { addScore } = require('./leaderboard');
const { getMatch } = require('./matchmaking');
const { redis } = require('../config/redis');
const roomStates = new Map(); // 内存态，单实例即可


function evaluateRps(moveA, moveB) {
    const valid = [0, 1, 2];
    if (!valid.includes(moveA) || !valid.includes(moveB)) {
      throw new Error('invalid move: expected 0|1|2');
    }
  
    const names = ['rock', 'scissors', 'paper'];
    const diff = (moveA - moveB + 3) % 3; // 0 平局，2 A 胜，1 B 胜（基于 0=石头 1=剪子 2=布）

    if (diff === 0) {
      return { result: 'draw', winner: null, reason: `${names[moveA]} == ${names[moveB]}` };
    }
    if (diff === 2) {
      return { result: 'A', winner: 'A', reason: `${names[moveA]} beats ${names[moveB]}` };
    }
    return { result: 'B', winner: 'B', reason: `${names[moveB]} beats ${names[moveA]}` };
  }
/**
 * 提交玩家出招。
 * @param {string} roomId 房间 ID
 * @param {string} playerId 玩家 ID
 * @param {number} move 出招（0=石头 1=剪子 2=布）
 * @returns {{ status: 'resolved', ...result } | { status: 'pending', waitingFor: [...] }}
 * @throws {Error} 当参数缺失或无效时抛出
 */
  async function submitMove(roomId, playerId, move) {
    // 1) 校验参数与房间归属
    const match = await getMatch(roomId);
    if (!match) throw new Error('room_not_found');
    const [aId, bId] = match;
    
    if (playerId !== aId && playerId !== bId) throw new Error('player_not_in_room');
    
    const m = Number(move);
    if (!Number.isInteger(m) || m < 0 || m > 2) throw new Error('invalid_move');
    
    const roomKey = `mm:room:${roomId}`;
    const data = await redis.hGetAll(roomKey);
    const moves = data.moves ? JSON.parse(data.moves) : {};
    
    // 防重复出招
    if (Object.prototype.hasOwnProperty.call(moves, playerId)) {
        throw new Error('player_already_moved');
    }
    
    moves[playerId] = m;

    let status = 'pending';
    let resultPayload = null;

    // 3) 若两人都已出招且尚未判定：evaluateRps → 生成 winnerId → addScore(winnerId, 1)
    if (Object.keys(moves).length === 2 && !data.result) {
        const { result, winner, reason } = evaluateRps(Number(moves[aId]), Number(moves[bId]));
        const winnerId = winner === 'A' ? aId : winner === 'B' ? bId : null;
        if (winnerId) {
          await addScore(winnerId, 1);
        }
        resultPayload = { result, winner, reason, winnerId: winnerId || '' };
        status = 'resolved';
    }

    // 4) 将状态写回 Redis，并设置 TTL（未决60秒；已决3600秒）
    await redis.hSet(roomKey, 'a', aId);
    await redis.hSet(roomKey, 'b', bId);
    await redis.hSet(roomKey, 'moves', JSON.stringify(moves));
    if (resultPayload) {
      await redis.hSet(roomKey, 'result', resultPayload.result);
      await redis.hSet(roomKey, 'winner', resultPayload.winner || '');
      await redis.hSet(roomKey, 'reason', resultPayload.reason || '');
      await redis.hSet(roomKey, 'winnerId', resultPayload.winnerId || '');
    }
    await redis.expire(roomKey, status === 'resolved' ? 3600 : 60);

    // 5) 返回状态
    if (status === 'resolved') {
      return { status: 'resolved', ...resultPayload, playerA: aId, playerB: bId };
    }
    const waitingFor = [aId, bId].filter(id => !(id in moves));
    return { status: 'pending', waitingFor };
  }
  
  async function getResult(roomId) {
    // 返回房间当前状态：resolved（带胜负）或 pending（带待出招方）
    const roomKey = `mm:room:${roomId}`;
    const data = await redis.hGetAll(roomKey);
    if (!data || (!data.a && !data.b)) return null;
    const players = [data.a, data.b].filter(Boolean);
    const moves = data.moves ? JSON.parse(data.moves) : {};

    if (data.result) {
      return {
        players,
        moves,
        result: {
          result: data.result,
          winner: data.winner || null,
          reason: data.reason || '',
          playerA: players[0],
          playerB: players[1],
          winnerId: data.winnerId || null,
        },
      };
    }
    return { players, moves, result: null };
  }

  module.exports = { evaluateRps, submitMove, getResult };