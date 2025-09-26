const express = require('express');
const { evaluateRps, submitMove, getResult } = require('../services/rps');

const router = express.Router();

// 单局对战判定
router.post('/duel', (req, res) => {
  const { playerA, playerB, moveA, moveB } = req.body || {};
  if (!playerA || !playerB) return res.status(400).json({ error: 'playerA and playerB required' });
  const a = Number(moveA), b = Number(moveB);
  if (!Number.isInteger(a) || !Number.isInteger(b)) return res.status(400).json({ error: 'moveA/moveB must be integer 0|1|2' });
  try {
    const verdict = evaluateRps(a, b);
    const winnerId = verdict.winner === 'A' ? playerA : verdict.winner === 'B' ? playerB : null;
    return res.status(200).json({ ...verdict, playerA, playerB, winnerId });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// 提交出招
router.post('/submit-move', async (req, res) => {
    const { roomId, playerId, move } = req.body || {};
    if (!roomId || !playerId) return res.status(400).json({ error: 'roomId and playerId required' });
    try {
      const r = await submitMove(roomId, playerId, move);
      return res.status(200).json(r);
    } catch (err) {
      const message = err?.message || 'submit_move_failed';
      const status = message === 'room_not_found' || message === 'player_not_in_room' ? 404 : 400;
      return res.status(status).json({ error: message });
    }
  });
  
  // 查询结果
  router.get('/result/:roomId', (req, res) => {
    const r = getResult(req.params.roomId);
    if (!r) return res.status(404).json({ error: 'room_not_found' });
    return res.status(200).json(r);
  });

module.exports = router;