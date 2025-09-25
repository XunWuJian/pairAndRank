const express = require('express');
const { joinQueue, leaveQueue, getQueueSize, getMatch } = require('../services/matchmaking');

const router = express.Router();

// 玩家加入匹配队列
router.post('/queue/join', (req, res) => {
  const { playerId } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'playerId required' });
  try {
    const result = joinQueue(playerId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 玩家离开匹配队列
router.post('/queue/leave', (req, res) => {
  const { playerId } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'playerId required' });
  const result = leaveQueue(playerId);
  return res.status(200).json(result);
});

// 查询等待队列大小
router.get('/queue/size', (req, res) => {
  return res.status(200).json({ size: getQueueSize() });
});

// 查询房间匹配信息
router.get('/match/:roomId', (req, res) => {
  const room = getMatch(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'not_found' });
  return res.status(200).json({ roomId: req.params.roomId, players: room });
});

module.exports = router;
