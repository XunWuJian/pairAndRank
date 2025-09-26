const { addScore } = require('./leaderboard');
const { getMatch } = require('./matchmaking');

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
    
    const state = roomStates.get(roomId) || { players: [aId, bId], moves: {}, result: null };
    
    // 判重要判“是否存在该键”，避免 0 被当作 falsy
    if (Object.prototype.hasOwnProperty.call(state.moves, playerId)) {
        throw new Error('player_already_moved');
    }
    
    state.moves[playerId] = m;
    // 2) 记录玩家出招
    roomStates.set(roomId, state);

    // 3) 若两人都已出招且尚未判定：evaluateRps → 生成 winnerId → addScore(winnerId, 1)
    if (Object.keys(state.moves).length === 2) {
        const { result, winner, reason } = evaluateRps(state.moves[aId], state.moves[bId]);
        const winnerId = winner === 'A' ? aId : winner === 'B' ? bId : null;
        state.result = { result, winner, reason, playerA: aId, playerB: bId, winnerId };
        addScore(winnerId, 1);
    }
    // 4) 返回 { status: 'resolved', ...result } 或 { status: 'pending', waitingFor: [...] }
    return { status: 'resolved', ...state.result };
  }
  
  function getResult(roomId) {
    // 返回房间当前状态：resolved（带胜负）或 pending（带待出招方）
    return roomStates.get(roomId) || null;
  }
  
  module.exports = { evaluateRps, submitMove, getResult };