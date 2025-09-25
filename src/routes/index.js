const express = require('express');
const matchmaking = require('./matchmaking');

const router = express.Router();

router.use('/matchmaking', matchmaking);

module.exports = router;