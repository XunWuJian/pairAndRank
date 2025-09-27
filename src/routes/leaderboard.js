const express = require('express');
const { submitScore, addScore, topN, rankOf } = require('../services/leaderboard');

const router = express.Router();

router.post('/submit', async (req, res) => {
  try {
    const { playerId, score } = req.body || {};
    if (!playerId || typeof score !== 'number') return res.status(400).json({ error: 'playerId and numeric score required' });
    const result = await submitScore(playerId, score);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { playerId, delta } = req.body || {};
    if (!playerId || typeof delta !== 'number') return res.status(400).json({ error: 'playerId and numeric delta required' });
    const result = await addScore(playerId, delta);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/top', async (req, res) => {
  try {
    const n = Number(req.query.n || 10);
    const list = await topN(n);
    return res.status(200).json({ top: list });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'top_query_failed' });
  }
});

router.get('/rank/:playerId', async (req, res) => {
  try {
    const r = await rankOf(req.params.playerId);
    if (!r) return res.status(404).json({ error: 'not_found' });
    return res.status(200).json(r);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'rank_query_failed' });
  }
});

module.exports = router;