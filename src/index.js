const express = require('express');

const app = express();
const PORT = process.env.PORT||3000

app.use(express.json())

// health
app.get('/healthz',(req,res)=>{
    res.status(200).json({
        ok:true,service:'pair-adn-rank',time:new Date().toISOString()
    })
})

const { initRedis } = require('./config/redis');

(async () => {
  await initRedis();
})();

const routes = require('./routes');
app.use('/api', routes);

app.listen(PORT,()=>{
    console.log(`[server] listening on http://localhost:${PORT}`);
})

const { takePairAndCreateRoomAtomic } = require('./services/matchmaking');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async function startWorker() {
    while (true) {
      try {
        const res = await takePairAndCreateRoomAtomic();
        if (!res) { await sleep(200); continue; }
        console.log('[matchmaking] paired:', res.roomId, res.players);
      } catch (e) {
        console.error('[matchmaking] worker error:', e);
        await sleep(500);
      }
    }
  })();