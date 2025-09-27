const express = require('express');
const { joinQueue, leaveQueue, getQueueSize, getMatch, getPlayerRoom } = require('../services/matchmaking');

const router = express.Router();

// 玩家加入匹配队列
router.post('/queue/join', async (req, res) => {
  const { playerId } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'playerId required' });
  try {
    const result = await joinQueue(playerId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 玩家离开匹配队列
router.post('/queue/leave', async (req, res) => {
  const { playerId } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'playerId required' });
  try {
    const result = await leaveQueue(playerId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 查询等待队列大小
router.get('/queue/size', async (req, res) => {
  try {
    const size = await getQueueSize();
    return res.status(200).json({ size });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 查询房间匹配信息
router.get('/match/:roomId', async (req, res) => {
  const room = await getMatch(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'not_found' });
  return res.status(200).json({ roomId: req.params.roomId, players: room });
});

// 按玩家查询房间（用于前端轮询匹配结果）
router.get('/my-room/:playerId', async (req, res) => {
  try {
    const r = await getPlayerRoom(req.params.playerId);
    if (!r) return res.status(404).json({ error: 'not_found' });
    return res.status(200).json(r);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
