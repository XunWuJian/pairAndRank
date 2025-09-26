const { redis } = require('../config/redis');

const LEADERBOARD_KEY = 'lb:global';

/**
 * 写入或覆盖玩家分数（ZADD）。
 * 不存在则新增，存在则覆盖。
 */
async function submitScore(playerId, score) {
  if (!playerId) throw new Error('playerId required');
  if (typeof score !== 'number') throw new Error('score must be number');
  await redis.zAdd(LEADERBOARD_KEY, [{ score, value: playerId }]);
  return { ok: true };
}

/**
 * 为玩家分数累加增量（ZINCRBY）。
 */
async function addScore(playerId, delta) {
  if (!playerId) throw new Error('playerId required');
  if (typeof delta !== 'number') throw new Error('delta must be number');
  const newScore = await redis.zIncrBy(LEADERBOARD_KEY, delta, playerId);
  return { ok: true, score: Number(newScore) };
}

/**
 * 获取分数最高的前 n 名（降序）。
 */
async function topN(n = 10) {
  const limit = Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
  const members = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, limit - 1, { REV: true });
  return members.map((m, idx) => ({ rank: idx + 1, playerId: m.value, score: m.score }));
}

/**
 * 查询指定玩家的当前名次与分数（按分数降序）。
 */
async function rankOf(playerId) {
  const r = await redis.zRevRank(LEADERBOARD_KEY, playerId);
  if (r === null) return null;
  const score = await redis.zScore(LEADERBOARD_KEY, playerId);
  return { rank: r + 1, score: Number(score) };
}

module.exports = { submitScore, addScore, topN, rankOf };