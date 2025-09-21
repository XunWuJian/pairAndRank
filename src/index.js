const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// health
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, service: 'pair-and-rank', time: new Date().toISOString() });
});

// placeholder for routes (Chapter 5 & 6)
// const routes = require('./routes');
// app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});