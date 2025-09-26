const express = require('express');
const matchmaking = require('./matchmaking');
const leaderboard = require('./leaderboard');
const rps = require('./rps');

const router = express.Router();

router.use('/matchmaking', matchmaking);
router.use('/leaderboard', leaderboard);
router.use('/rps', rps);

module.exports = router;