## Node.js 游戏匹配与 Redis 排行榜：从零到一的简历加分项目

本教材带你从空目录开始，手把手搭建一个"可以运行、可展示、可讲述"的 Node.js 游戏后端：包含玩家匹配服务与基于 Redis 的排行榜。你将按章节循序渐进，每一步都知道"在做什么""为什么这么做"，并附上面试官常问的问题与答题要点。

面向读者：后端入门者、转岗同学、需要一个拿得出手的 GitHub 项目的人。

注意：文档以 Windows 命令行示例为主（你的系统为 Windows 10/11，Shell 为 cmd.exe），并补充 macOS/Linux 的替代命令。

### 你将构建什么

- 一个使用 Express 的 HTTP 服务
- 简单的玩家匹配功能：玩家进队列，两两成组
- 基于 Redis Sorted Set 的排行榜：提交分数、获取 TopN、查询个人名次
- 可运行本地环境（含 Docker Compose 方案）
- 发布到 GitHub 的开源仓库，简历中可展示的 README、API 示例与截图建议

### 为什么选择 Node.js + Redis

- Node.js 易上手、生态丰富，适合快速交付 Demo 与作品集
- Redis 提供高性能数据结构（比如 Sorted Set）非常适合排行榜场景
- 架构思路通用：未来可迁移到 TypeScript 或 Go、Rust 等语言

> 说明：你先前提到"Node.js 服务端"，后文也会坚持使用 Node.js。如果你改为希望使用 Go，同样的章节结构可平移过去（我会在后续章节的"可选拓展"里提示 TS/Go 的迁移点）。

---

## 总览与路线图（章节导航）

1. 概览与目标（本章）
2. 第0章：准备环境与工具
3. 第1章：创建与初始化仓库（本地与 GitHub）
4. 第2章：Hello Server（最小可运行 HTTP 服务）
5. 第3章：项目结构与运行脚本（为成长做布局）
6. 第4章：接入 Redis（本地/云端/容器三种方式）
7. 第5章：实现匹配服务（队列 + 两两配对）
8. 第6章：实现排行榜（ZADD/ZINCRBY/排名查询）
9. 第7章：输入校验与错误处理（避免脏数据）
10. 第8章：日志与配置（.env、分环境配置、结构化日志）
11. 第9章：Docker 化与一键启动（含 Redis）
12. 第10章：API 文档与测试（curl/Postman + 自动化测试可选）
13. 第11章：部署与展示（GitHub Actions、线上演示建议）
14. 附录A：常见问题与排错清单
15. 附录B：面试题与回答要点（每章也有小节版）

你可以按顺序学习，也可以在完成第6章后就对外展示作品，后续再逐步完善工程性章节。

---

## 第0章：准备环境与工具

目标：确保你本地具备运行项目所需的基础设施。

### 安装与检查版本

- 必需：Node.js LTS（建议 18.x 或 20.x）、Git
- 推荐：Docker Desktop（可一键启动 Redis）、Postman 或 curl

#### Windows（cmd）

```bat
node -v
npm -v
git --version
```

如果没有安装 Node.js：前往 Node.js 官网安装 LTS 版本。安装后再执行上面命令确认版本。

#### macOS/Linux

```bash
node -v
npm -v
git --version
```

### Redis 的三种使用方式（先了解，后续第4章细讲）

- 本地安装：适合离线开发
- Docker：最省事的一键启动
- 云端服务：如 Upstash/Redis Cloud，免运维，适合展示

本章不做具体操作，仅让你知道选项。第4章会给出三套可选步骤。

### 面试官可能会问

- 为什么选 Node.js 做后端？
  - 事件驱动、生态成熟、快速交付；对 I/O 密集型（如匹配、排行榜查询）足够胜任。
- 为什么排行榜用 Redis？
  - Sorted Set 原生支持按分数排序与排名查询，复杂度和性能都很优秀。

---

## 第1章：创建与初始化仓库（本地与 GitHub）

目标：从空目录开始，建立 Git 仓库与 npm 项目，并推送到 GitHub，形成"可展示"的基础。

> 你的工作目录：`E:\IFile\nodeFile\PairAndRank`（已存在）。

### 1.1 初始化 Git 仓库与 npm 项目

在 Windows cmd（或终端）中执行：

```bat
cd /d E:\IFile\nodeFile\PairAndRank
git init
npm init -y
```

每行命令在做什么：

- `cd /d E:\IFile\nodeFile\PairAndRank`：切换到项目目录（/d 表示切换盘符）。
- `git init`：在当前目录创建 `.git` 隐藏文件夹，开始用 Git 追踪版本。
- `npm init -y`：创建 `package.json`，`-y` 使用默认值，便于快速开始。

> macOS/Linux 等价命令：
```bash
cd /path/to/PairAndRank
git init
npm init -y
```

### 1.2 创建基础文件与 .gitignore

创建一个最小的目录与文件（第2章会往里加代码）：

```bat
mkdir src
echo // entrypoint will be created in Chapter 2> src\index.js
echo node_modules> .gitignore
echo .env>> .gitignore
```

解释：

- `mkdir src`：源码目录。
- `echo // entrypoint... > src\index.js`：先占位一个入口文件，后续第2章会写入真实代码。
- `echo node_modules > .gitignore`：忽略依赖目录，避免上传到 Git。
- `echo .env >> .gitignore`：忽略环境变量文件，避免泄露敏感信息。

### 1.3 首次提交

```bat
git add .
git commit -m "chore: init project structure"
```

解释：

- `git add .`：把当前目录的修改加入暂存区。
- `git commit -m "..."`：创建一次快照，写入提交信息。

### 1.4 连接 GitHub 并推送

两种方案：

- 方案A（手动）：
  1) 在 GitHub 网页创建空仓库（例如 `PairAndRank`）
  2) 执行以下命令将本地仓库与远程绑定并推送：

```bat
git branch -M main
git remote add origin https://github.com/<你的GitHub用户名>/PairAndRank.git
git push -u origin main
```

- 方案B（GitHub CLI）：如果已安装 `gh` 命令行：

```bat
gh repo create PairAndRank --public --source=. --remote=origin --push
```

常见问题：

- 如果提示鉴权失败，请先执行 `git config --global user.name` 与 `git config --global user.email` 配置用户信息，并确保本机已登录 GitHub（令牌或 HTTPS 登录）。

### 本章小结与面试点

- 你已经拥有一个"可推送、可展示"的最小仓库
- 面试官可能问：`package.json` 里最重要的字段有哪些？
  - name/version/scripts/dependencies 等；scripts 在团队协作中非常关键。

---

## 第2章：Hello Server（最小可运行 HTTP 服务）

目标：使用 Express 启动一个本地服务，提供健康检查接口，能被 curl 访问。

### 2.1 安装依赖

```bat
npm install express
npm install --save-dev nodemon
```

解释：

- `express`：Web 框架，负责路由与中间件。
- `nodemon`：开发时自动重启服务，提升效率。

### 2.2 编写入口文件 `src/index.js`

将以下代码写入 `src\index.js`（覆盖第1章占位内容）：

```javascript
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, service: 'pair-and-rank', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
```

你刚做了什么：

- 创建 `app` 应用，启用 JSON 解析中间件
- 定义 `GET /healthz` 健康检查路由
- 启动服务监听 `PORT` 端口

### 2.3 在 `package.json` 添加脚本

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

解释：

- `npm run dev`：开发模式（代码改动自动重启）
- `npm start`：生产或演示模式（手动重启）

### 2.4 启动与验证

启动：

```bat
npm run dev
```

另开一个终端窗口验证（Windows/macOS/Linux 通用）：

```bash
curl http://localhost:3000/healthz
```

期望输出（示例）：

```json
{"ok":true,"service":"pair-and-rank","time":"2025-01-01T12:00:00.000Z"}
```

### 提交到 GitHub

```bat
git add .
git commit -m "feat(server): add express hello server with /healthz"
git push
```

### 本章小结与面试点

- 你完成了最小可运行的 HTTP 服务
- 面试题：Express 中间件是什么？
  - 请求到达与响应返回之间的一段可组合处理逻辑，如解析 JSON、记录日志、校验输入。

---

## 第3章：项目结构与运行脚本（为成长做布局）

目标：整理目录结构，为后续匹配与排行榜模块预留位置。

### 3.1 建议的目录结构

```text
src/
  app/              # 主应用与中间件
  routes/           # 路由模块（matchmaking、leaderboard）
  services/         # 业务服务层（匹配算法、排行榜读写）
  config/           # 配置（redis、env）
  utils/            # 工具（日志、通用方法）
  index.js          # 入口（加载 app 与路由）
```

执行以下命令创建目录与占位文件：

```bat
mkdir src\app src\routes src\services src\config src\utils
echo // routes will be added in Chapter 5/6> src\routes\index.js
echo // matchmaking service placeholder> src\services\matchmaking.js
echo // leaderboard service placeholder> src\services\leaderboard.js
echo // redis config placeholder> src\config\redis.js
echo // logger util placeholder> src\utils\logger.js
```

你刚做了什么：

- 为后续功能拆分出清晰边界：路由层只处理 HTTP，服务层放核心逻辑，配置与工具独立

### 3.2 在入口中预留路由挂载点

将 `src/index.js` 轻微调整（为后续挂路由做准备）：

```javascript
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
```

> 注意：此时 `routes` 仍是占位，等第5/6章再挂上。

### 提交到 GitHub

```bat
git add .
git commit -m "chore: scaffold project structure and placeholders"
git push
```

### 本章小结与面试点

- 你完成了分层与模块边界的初步设计
- 面试题：为什么要服务层与路由层分离？
  - 降低耦合、便于测试与复用、替换 Web 框架时业务逻辑不受影响。

---

## 第4章：接入 Redis（本地/云端/容器三选一）

目标：让服务能与 Redis 通信，为排行榜与可选的共享匹配状态打基础。

### 4.1 安装依赖

```bat
npm install redis dotenv
```

解释：

- `redis`：Node.js 官方 Redis 客户端
- `dotenv`：从 `.env` 文件加载环境变量

### 4.2 选择一种 Redis 运行方式并启动

- 方式A：Docker（推荐）

```bash
docker run -p 6379:6379 --name pr-redis -d redis:7
```

- 方式B：云服务（Upstash/Redis Cloud）
  - 创建免费实例，获得连接 URL（形如 `redis://:<password>@<host>:<port>`）

- 方式C：本地安装
  - Windows 可用 Docker 或借助第三方（如 Memurai 社区版）

### 4.3 配置连接 `src/config/redis.js`

在项目根目录创建 `.env`（不要提交到 Git）：

```env
REDIS_URL=redis://localhost:6379
```

编写 `src/config/redis.js`：

```javascript
const { createClient } = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = createClient({ url: redisUrl });

redis.on('error', (err) => {
  console.error('[redis] error:', err);
});

async function initRedis() {
  if (!redis.isOpen) {
    await redis.connect();
    console.log('[redis] connected:', redisUrl);
  }
  return redis;
}

module.exports = { redis, initRedis };
```

在 `src/index.js` 中初始化 Redis（放在 `app.listen` 之前）：

```javascript
const { initRedis } = require('./config/redis');

(async () => {
  await initRedis();
})();
```

启动服务验证连接日志：

```bat
npm run dev
```

### 提交到 GitHub

```bat
git add .
git commit -m "feat(redis): add redis client and .env support"
git push
```

### 本章小结与面试点

- 你让服务具备了与 Redis 的通信能力
- 面试题：客户端与 Redis 的连接管理要注意什么？
  - 复用连接、错误重试、超时与断线重连、密码保护与网络安全。

---

## 第5章：实现匹配服务（队列 + 两两配对）

目标：

- 提供 API：玩家入队、离队、查看队列长度
- 当队列中人数达到 2，即刻两两配对并返回一个"房间号"（示例用随机 UUID）
- 先使用内存队列实现（简单直观）；第9章提供用 Redis 列表/流扩展为分布式的思路

### 5.1 服务层：`src/services/matchmaking.js`

```javascript
const crypto = require('crypto');

const waitingQueue = [];
const activeMatches = new Map(); // roomId -> [playerA, playerB]

function joinQueue(playerId) {
  if (!playerId) throw new Error('playerId required');
  if (waitingQueue.includes(playerId)) return { status: 'already_in_queue' };
  waitingQueue.push(playerId);

  if (waitingQueue.length >= 2) {
    const a = waitingQueue.shift();
    const b = waitingQueue.shift();
    const roomId = crypto.randomUUID();
    activeMatches.set(roomId, [a, b]);
    return { status: 'matched', roomId, players: [a, b] };
  }
  return { status: 'queued' };
}

function leaveQueue(playerId) {
  const idx = waitingQueue.indexOf(playerId);
  if (idx >= 0) {
    waitingQueue.splice(idx, 1);
    return { status: 'left' };
  }
  return { status: 'not_in_queue' };
}

function getQueueSize() {
  return waitingQueue.length;
}

function getMatch(roomId) {
  return activeMatches.get(roomId) || null;
}

module.exports = {
  joinQueue,
  leaveQueue,
  getQueueSize,
  getMatch,
};
```

### 5.2 路由层：`src/routes/matchmaking.js`

```javascript
const express = require('express');
const { joinQueue, leaveQueue, getQueueSize, getMatch } = require('../services/matchmaking');

const router = express.Router();

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

router.post('/queue/leave', (req, res) => {
  const { playerId } = req.body || {};
  if (!playerId) return res.status(400).json({ error: 'playerId required' });
  const result = leaveQueue(playerId);
  return res.status(200).json(result);
});

router.get('/queue/size', (req, res) => {
  return res.status(200).json({ size: getQueueSize() });
});

router.get('/match/:roomId', (req, res) => {
  const room = getMatch(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'not_found' });
  return res.status(200).json({ roomId: req.params.roomId, players: room });
});

module.exports = router;
```

### 5.3 汇总路由入口 `src/routes/index.js`

```javascript
const express = require('express');
const matchmaking = require('./matchmaking');

const router = express.Router();

router.use('/matchmaking', matchmaking);

module.exports = router;
```

### 5.4 在 `src/index.js` 挂载路由

```javascript
const routes = require('./routes');
app.use('/api', routes);
```

放在 `/healthz` 之后、`app.listen` 之前。

### 5.5 运行与验证（示例用 curl）

```bash
# 入队两名玩家
curl -X POST http://localhost:3000/api/matchmaking/queue/join -H "Content-Type: application/json" -d "{\"playerId\":\"alice\"}"
curl -X POST http://localhost:3000/api/matchmaking/queue/join -H "Content-Type: application/json" -d "{\"playerId\":\"bob\"}"

# 立即返回匹配结果（status=matched），拿到 roomId
# 查询房间
curl http://localhost:3000/api/matchmaking/match/<roomId>

# 查看队列长度
curl http://localhost:3000/api/matchmaking/queue/size
```

### 本章小结与面试点

- 你实现了最小可用的匹配逻辑（内存队列两两配对）
- 面试题：如果服务多副本部署，内存队列如何一致？
  - 需要引入共享存储（Redis 列表/流）或消息队列，确保匹配状态在多个实例之间可见；或使用单独的匹配进程与任务队列。

---

## 第6章：实现排行榜（Redis Sorted Set）

目标：

- API：提交/累加分数、查询榜单 TopN、查询个人排名与分数
- 使用 Redis ZSET：`ZADD`、`ZINCRBY`、`ZREVRANGE`、`ZRANK`/`ZREVRANK`、`ZSCORE`

### 6.1 服务层：`src/services/leaderboard.js`

```javascript
const { redis } = require('../config/redis');

const LEADERBOARD_KEY = 'lb:global';

async function submitScore(playerId, score) {
  if (!playerId) throw new Error('playerId required');
  if (typeof score !== 'number') throw new Error('score must be number');
  await redis.zAdd(LEADERBOARD_KEY, [{ score, value: playerId }]);
  return { ok: true };
}

async function addScore(playerId, delta) {
  if (!playerId) throw new Error('playerId required');
  if (typeof delta !== 'number') throw new Error('delta must be number');
  const newScore = await redis.zIncrBy(LEADERBOARD_KEY, delta, playerId);
  return { ok: true, score: Number(newScore) };
}

async function topN(n = 10) {
  const members = await redis.zRangeWithScores(LEADERBOARD_KEY, -n, -1, { BY: 'SCORE' });
  // zRangeWithScores 按从小到大；取 [-n, -1] 近似末尾 n 个，再反转
  return members.reverse().map((m, idx) => ({ rank: idx + 1, playerId: m.value, score: m.score }));
}

async function rankOf(playerId) {
  // 使用 ZREVRANK 获取从大到小的名次（0 基）
  const r = await redis.zRevRank(LEADERBOARD_KEY, playerId);
  if (r === null) return null;
  const score = await redis.zScore(LEADERBOARD_KEY, playerId);
  return { rank: r + 1, score: Number(score) };
}

module.exports = { submitScore, addScore, topN, rankOf };
```

### 6.2 路由层：`src/routes/leaderboard.js`

```javascript
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
  const n = Number(req.query.n || 10);
  const list = await topN(n);
  return res.status(200).json({ top: list });
});

router.get('/rank/:playerId', async (req, res) => {
  const r = await rankOf(req.params.playerId);
  if (!r) return res.status(404).json({ error: 'not_found' });
  return res.status(200).json(r);
});

module.exports = router;
```

### 6.3 汇总至 `src/routes/index.js`

```javascript
const express = require('express');
const matchmaking = require('./matchmaking');
const leaderboard = require('./leaderboard');

const router = express.Router();

router.use('/matchmaking', matchmaking);
router.use('/leaderboard', leaderboard);

module.exports = router;
```

### 6.4 运行与验证

```bash
# 提交分数
curl -X POST http://localhost:3000/api/leaderboard/submit -H "Content-Type: application/json" -d "{\"playerId\":\"alice\",\"score\":100}"
curl -X POST http://localhost:3000/api/leaderboard/add -H "Content-Type: application/json" -d "{\"playerId\":\"bob\",\"delta\":120}"

# 查看前 N 名
curl "http://localhost:3000/api/leaderboard/top?n=10"

# 查看个人排名
curl http://localhost:3000/api/leaderboard/rank/alice
```

### 本章小结与面试点

- 你完成了排行榜的核心读写与查询
- 面试题：为什么选择 ZSET？复杂度如何？
  - 有序集合按分数排序，插入和更新 O(log N)，取 TopN 与 Rank 查询非常高效。


## 第6章补充：实现猜拳小游戏（Rock-Paper-Scissors）

目标：在不引入复杂重构之前，新增一个最小可用的"猜拳"游戏逻辑与接口，演示如何将纯业务规则落在服务层，并通过路由层对外提供 API。

约定：

- 手势编码：0=石头、1=剪子、2=布
- 判定规则：石头胜剪子；剪子胜布；布胜石头；相同为平局

### 服务层：`src/services/rps.js`

```javascript
// 纯函数：只依赖参数、无副作用，便于单元测试与复用
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

module.exports = { evaluateRps };
```

### 路由层：`src/routes/rps.js`

```javascript
const express = require('express');
const { evaluateRps } = require('../services/rps');

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

module.exports = router;
```

### 汇总路由入口 `src/routes/index.js`

```javascript
const express = require('express');
const matchmaking = require('./matchmaking');
const leaderboard = require('./leaderboard');
const rps = require('./rps');

const router = express.Router();

router.use('/matchmaking', matchmaking);
router.use('/leaderboard', leaderboard);
router.use('/rps', rps);

module.exports = router;
```

将上述三行引入与 `router.use('/rps', rps);` 插入到现有路由聚合文件中（放在其他路由之后、`module.exports` 之前）。

### 运行与验证（示例）

```bash
# 单局对战：A=石头(0) vs B=剪子(1) → A 胜
curl -X POST http://localhost:3000/api/rps/duel \
  -H "Content-Type: application/json" \
  -d '{"playerA":"alice","playerB":"bob","moveA":0,"moveB":1}'

# 平局：A=布(2) vs B=布(2)
curl -X POST http://localhost:3000/api/rps/duel \
  -H "Content-Type: application/json" \
  -d '{"playerA":"alice","playerB":"bob","moveA":2,"moveB":2}'
```

### 本章小结与面试点

- 你把业务规则封装为纯函数，接口层只做输入校验与组装返回
- 模 3 判定技巧：`(a - b + 3) % 3` 映射为平局/胜负，常数时间、无分支表更清晰
- 可扩展方向：三局两胜、积分结算、结合匹配服务生成对局并写入排行榜

---

## 第6章进阶：按房间出招与更新排行榜（对战流程，Redis 存储版）

目标：把"一次性判定"升级为"按房间进行对战"，并将出招/结果全部存入 Redis，便于多实例可见与自动过期。

- 玩家通过匹配拿到 `roomId`
- 两位玩家分别提交各自的出招
- 当两人都出招后立即判定胜负并为获胜者加 1 分到排行榜
- 任意时刻可查询房间的对战状态（pending/resolved）

本章直接使用 Redis Hash 存储对战状态（生产友好）：

### 1. 设计与约定

- 状态容器：`mm:room:<roomId>`（Hash）
- 字段约定：
  - `a`、`b`：两名玩家 ID（由配对脚本写入）
  - `moves`：JSON 字符串，形如 `{ "alice":0, "bob":2 }`
  - `result`、`winner`、`reason`、`winnerId`：判定完成后写入
- TTL 规则（分阶段）：
  - 新建房间：TTL=60 秒（见 12.5 脚本中的 `EXPIRE roomKey 60`）
  - 分出胜负：将 TTL 延长为 3600 秒（便于短期审计/回放）
- 判定复用上一章的 `evaluateRps(a, b)`；加分使用 `addScore(winnerId, 1)`。

### 2. 服务层：提交出招与查询结果（在 `src/services/rps.js`）

仅展示关键片段（其余保持不变）：

```javascript
const { addScore } = require('./leaderboard');
const { getMatch } = require('./matchmaking'); // 读取 a/b（底层已从 Redis Hash 取）
const { redis } = require('../config/redis');

function evaluateRps(moveA, moveB) { /* 同上章：纯函数，略 */ }

// 提交出招
async function submitMove(roomId, playerId, move) {
  const match = await getMatch(roomId);
  if (!match) throw new Error('room_not_found');
  const [aId, bId] = match;
  if (playerId !== aId && playerId !== bId) throw new Error('player_not_in_room');

  const m = Number(move);
  if (!Number.isInteger(m) || m < 0 || m > 2) throw new Error('invalid_move');

  const roomKey = `mm:room:${roomId}`;
  const data = await redis.hGetAll(roomKey);
  const moves = data.moves ? JSON.parse(data.moves) : {};
  if (Object.prototype.hasOwnProperty.call(moves, playerId)) {
    throw new Error('player_already_moved');
  }
  moves[playerId] = m;

  let status = 'pending';
  let resultPayload = {};
  if (Object.keys(moves).length === 2 && !data.result) {
    const { result, winner, reason } = evaluateRps(moves[aId], moves[bId]);
    const winnerId = winner === 'A' ? aId : winner === 'B' ? bId : null;
    if (winnerId) await addScore(winnerId, 1);
    resultPayload = { result, winner, reason, winnerId: winnerId || '' };
    status = 'resolved';
  }

  // 写回 Redis（moves 序列化；若有结果一并写入），并设置 TTL
  await redis.hSet(roomKey, {
    a: aId,
    b: bId,
    moves: JSON.stringify(moves),
    ...resultPayload,
  });
  await redis.expire(roomKey, status === 'resolved' ? 3600 : 60);

  return status === 'resolved'
    ? { status: 'resolved', ...resultPayload, playerA: aId, playerB: bId }
    : { status: 'pending', waitingFor: [aId, bId].filter(id => !(id in moves)) };
}

// 查询结果（从 Redis 读取）
async function getResult(roomId) {
  const data = await redis.hGetAll(`mm:room:${roomId}`);
  if (!data || (!data.a && !data.b)) return null;
  const players = [data.a, data.b];
  const moves = data.moves ? JSON.parse(data.moves) : {};
  if (data.result) {
    return {
      players,
      moves,
      result: {
        result: data.result,
        winner: data.winner || null,
        reason: data.reason || '',
        playerA: players[0],
        playerB: players[1],
        winnerId: data.winnerId || null,
      },
    };
  }
  return { players, moves, result: null };
}
```

### 3. 路由层：提交出招与查询结果（在 `src/routes/rps.js`）

仅展示结果查询的异步版本（提交出招保持不变）：

```javascript
router.get('/result/:roomId', async (req, res) => {
  try {
    const r = await getResult(req.params.roomId);
    if (!r) return res.status(404).json({ error: 'room_not_found' });
    return res.status(200).json(r);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'result_query_failed' });
  }
});
```

### 4. 并发与原子性（可选，生产建议）

为避免同时提交导致的竞态，可用 Lua 将"写出招 → 判定 → 计分 → 设置 TTL"打包为一次原子脚本（思路沿用 12.5 的写法）。演示项目可先使用上述直观实现，生产再切换为 Lua 原子版。

---

## 第12章：用 Redis List 实现匹配队列（分布式雏形）

目标：将"内存队列"重构为 Redis List，使多个实例共享同一匹配队列，避免多副本不一致。

### 12.1 键与队列设计

- 等待队列键：`mm:queue`（List）
  - 入队：`LPUSH mm:queue <playerId>`
  - 出队：阻塞方式 `BRPOP mm:queue 0`（阻塞直到有元素）
- 房间映射：`mm:room:<roomId>`（Hash）存 `{ a: playerA, b: playerB }`
- 房间 ID：仍使用 `crypto.randomUUID()` 生成

注意：若不使用 Lua 原子脚本，建议先只启动一个 Worker 实例消费队列，避免两个 Worker 各取到一个玩家后互相等待。

### 12.2 服务层改造（保持对外 API 不变）

将 `src/services/matchmaking.js` 从"内存数组 + Map"改为 Redis：

```javascript
// src/services/matchmaking.js（重构要点：阻塞命令用独立连接）
const crypto = require('crypto');
const { redis } = require('../config/redis');

const QUEUE_KEY = 'mm:queue';

let blocking;
async function getBlocking() {
  if (!blocking) {
    blocking = redis.duplicate();
    await blocking.connect();
  }
  return blocking;
}

async function joinQueue(playerId) {
  if (!playerId) throw new Error('playerId required');
  await redis.lPush(QUEUE_KEY, playerId);
  return { status: 'queued' };
}

async function leaveQueue(playerId) {
  await redis.lRem(QUEUE_KEY, 0, playerId);
  return { status: 'left' };
}

async function getQueueSize() {
  return await redis.lLen(QUEUE_KEY);
}

async function getMatch(roomId) {
  const data = await redis.hGetAll(`mm:room:${roomId}`);
  if (!data || (!data.a && !data.b)) return null;
  return [data.a, data.b];
}

// 供 Worker 调用：阻塞拿两人并创建房间（单/多 Worker 均可）
async function takePairAndCreateRoom() {
  const b = await getBlocking();
  const r1 = await b.brPop(QUEUE_KEY, 0);
  const r2 = await b.brPop(QUEUE_KEY, 0);
  const a = r1.element; const bPlayer = r2.element;
  const roomId = crypto.randomUUID();
  await redis.hSet(`mm:room:${roomId}`, { a, b: bPlayer });
  return { roomId, players: [a, bPlayer] };
}

module.exports = { joinQueue, leaveQueue, getQueueSize, getMatch, takePairAndCreateRoom };
```

说明（本章已改为 Lua 原子配对方案）：
- 路由层 `src/routes/matchmaking.js` 保持不变（仍调用 `joinQueue/leaveQueue/getQueueSize/getMatch`）。
- Worker 不再使用 `BRPOP` 阻塞连接，统一走 Lua 原子脚本（见 12.5/12.5.1）。
- 冗余代码已删除：去掉了阻塞专用连接与 `BRPOP` 版 `takePairAndCreateRoom` 实现，只保留 `takePairAndCreateRoomAtomic`。

### 12.3 启动一个最简 Worker（先与 API 同进程）

为了演示，在 `src/index.js` 中以后台循环的方式启动 Worker（真实项目建议单独进程/容器）：

```javascript
const { takePairAndCreateRoom } = require('./services/matchmaking');

(async function startWorker() {
  while (true) {
    try {
      const { roomId, players } = await takePairAndCreateRoom();
      console.log('[matchmaking] paired:', roomId, players);
    } catch (e) {
      console.error('[matchmaking] worker error:', e);
    }
  }
})();
```

若将来需要多实例 Worker 并行消费，请参考 12.5 的 Lua 脚本实现原子配对。

### 12.4 运行与验证

```bash
# 入队四名玩家（将被依次两两配对）
curl -X POST http://localhost:3000/api/matchmaking/queue/join -H "Content-Type: application/json" -d '{"playerId":"alice"}'
curl -X POST http://localhost:3000/api/matchmaking/queue/join -H "Content-Type: application/json" -d '{"playerId":"bob"}'
curl -X POST http://localhost:3000/api/matchmaking/queue/join -H "Content-Type: application/json" -d '{"playerId":"carl"}'
curl -X POST http://localhost:3000/api/matchmaking/queue/join -H "Content-Type: application/json" -d '{"playerId":"dora"}'

# 观察控制台输出 roomId 与 players；并可按 roomId 查询：
curl http://localhost:3000/api/matchmaking/match/<roomId>
```

完成一次"猜拳"完整对战（拿到 roomId 后）：

```bash
# 双方提交出招（0=石头 1=剪子 2=布）
curl -X POST http://localhost:3000/api/rps/submit-move -H "Content-Type: application/json" -d '{"roomId":"<roomId>","playerId":"alice","move":0}'
curl -X POST http://localhost:3000/api/rps/submit-move -H "Content-Type: application/json" -d '{"roomId":"<roomId>","playerId":"bob","move":2}'

# 查询对战结果（第二次提交后通常立即变为 resolved）
curl http://localhost:3000/api/rps/result/<roomId>

# 查看排行榜是否为胜者加分
curl "http://localhost:3000/api/leaderboard/top?n=10"
```

### 12.5（可选）Lua 原子配对脚本

为避免并发 Worker 各取一个玩家导致卡住，用 Lua 将"取两人 + 建房"打包为原子操作：

```lua
-- KEYS[1] = queueKey
-- KEYS[2] = roomKeyPrefix (如 'mm:room:')
-- ARGV[1] = roomId

local a = redis.call('RPOP', KEYS[1])
if not a then return { 'empty' } end
local b = redis.call('RPOP', KEYS[1])
if not b then
  redis.call('RPUSH', KEYS[1], a) -- 放回，保持队列完整
  return { 'single' }
end
local roomKey = KEYS[2] .. ARGV[1]
redis.call('HSET', roomKey, 'a', a)
redis.call('HSET', roomKey, 'b', b)
redis.call('EXPIRE', roomKey, 60) -- 新建房间：默认保留 60 秒
return { 'paired', a, b }
```

Node 侧调用示例：

```javascript
const roomId = crypto.randomUUID();
const script = '...上面的脚本...';
const r = await redis.eval(script, { keys: ['mm:queue', 'mm:room:'], arguments: [roomId] });
if (r[1] === 'paired') { /* 成功配对 */ }
```

#### 12.5.A Lua 基础速览（看这一节就能读懂脚本）

- Redis 的 Lua 脚本是"在 Redis 服务器里执行的一段小程序"，一次脚本执行期间是原子的（不会被其他命令插队）。
- 脚本入口拿到两个数组：
  - `KEYS`：键名列表（由调用方传入）
  - `ARGV`：普通参数列表（由调用方传入）
- 通过 `redis.call('<命令>', 参数...)` 调用 Redis 命令，返回值是 Lua 的字符串/数字/表（数组）。

脚本关键点对照：

- `local a = redis.call('RPOP', KEYS[1])`
  - 从队列尾部弹出一个元素（玩家 A）。如果队列空，返回 nil。
- `if not a then return { 'empty' } end`
  - 如果队列本来就空，直接返回 `{'empty'}`。
- `local b = redis.call('RPOP', KEYS[1])`
  - 再取一个（玩家 B）。
- `if not b then redis.call('RPUSH', KEYS[1], a) return { 'single' } end`
  - 如果只取到一个，则把 A 放回队列尾，返回 `{'single'}`，保证不丢玩家。
- `redis.call('HSET', KEYS[2] .. ARGV[1], 'a', a, 'b', b)`
  - 在 `room:{roomId}` Hash 里写入 a、b 两个字段，建立房间。
- `redis.call('EXPIRE', roomKey, 60)`
  - 新建房间：默认保留 60 秒。
- `return { 'paired', a, b }`
  - 返回配对成功以及两名玩家的 ID。

把以上动作放在一个脚本里执行，就实现了"取两人 + 建房"的原子性：要么都成功，要么都失败。

#### 12.5.B Node 调用 Lua 的两种方式

1) 直接 eval（简单入门）

```javascript
const lua = `...脚本源码...`;
const result = await redis.eval(lua, { keys: ['mm:queue', 'mm:room:'], arguments: [roomId] });
```

2) 预加载 + 按 SHA 调用（生产推荐，省流量/更快）

```javascript
const fs = require('fs');
const path = require('path');
let sha;
async function getSha() {
  if (!sha) {
    const script = fs.readFileSync(path.join(__dirname, '../scripts/match_pair.lua'), 'utf8');
    sha = await redis.scriptLoad(script);  // 缓存脚本
  }
  return sha;
}

async function runPair(roomId) {
  const s = await getSha();
  return await redis.evalSha(s, { keys: ['mm:queue', 'mm:room:'], arguments: [roomId] });
}
```

返回值解读：

- `['empty']`：队列为空，无人可配
- `['single']`：只取到 1 人，已放回队列，稍后重试
- `['paired', 'alice', 'bob']`：成功配对

#### 12.5.C 常见坑与对策

- 脚本路径/编码：读取文件请用 `utf8`，确保脚本完整；路径用 `path.join(__dirname, ...)`。
- 键名前缀：`KEYS[2] .. ARGV[1]` 是字符串拼接，确保 `KEYS[2]` 末尾带冒号（如 `mm:room:`）。
- 多实例 Worker：用本脚本即可并发安全；不要再混用阻塞式 BRPOP + 本脚本，避免语义冲突。
- 调试：可用 `redis-cli --ldb --eval script.lua queue room: , <roomId>` 逐步调试（了解即可）。

#### 12.5.D 最小可测试用例（不跑 Node 也能测）

```bash
# 假设 redis-cli 已安装
redis-cli del mm:queue
redis-cli lpush mm:queue alice bob

# 执行脚本（本地文件路径根据实际调整）
redis-cli --eval src/scripts/match_pair.lua mm:queue mm:room: , test-room-1

# 期望：返回 (array) [1] "paired" [2] "bob" [3] "alice"
redis-cli hgetall mm:room:test-room-1
```
#### 12.5.1 工程落地：脚本存放与加载

目录与文件：

- 放置 Lua 脚本：`src/scripts/match_pair.lua`
- 在服务层加载并封装：`src/services/matchmaking.js`

Lua 文件内容（与上文一致，便于直接落盘）：

```lua
-- src/scripts/match_pair.lua
-- KEYS[1] = queueKey
-- KEYS[2] = roomKeyPrefix (如 'mm:room:')
-- ARGV[1] = roomId

local a = redis.call('RPOP', KEYS[1])
if not a then return { 'empty' } end
local b = redis.call('RPOP', KEYS[1])
if not b then
  redis.call('RPUSH', KEYS[1], a)
  return { 'single' }
end
local roomKey = KEYS[2] .. ARGV[1]
redis.call('HSET', roomKey, 'a', a)
redis.call('HSET', roomKey, 'b', b)
redis.call('EXPIRE', roomKey, 60) -- 新建房间：默认保留 60 秒
return { 'paired', a, b }
```

服务层封装（使用 `SCRIPT LOAD` + `EVALSHA`，并提供轮询封装）：

```javascript
// src/services/matchmaking.js（节选）
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { redis } = require('../config/redis');

const QUEUE_KEY = 'mm:queue';
const ROOM_PREFIX = 'mm:room:';

let pairScriptSha;
async function getPairScriptSha() {
  if (!pairScriptSha) {
    const lua = fs.readFileSync(path.join(__dirname, '../scripts/match_pair.lua'), 'utf8');
    pairScriptSha = await redis.scriptLoad(lua);
  }
  return pairScriptSha;
}

async function takePairAndCreateRoomAtomic() {
  const sha = await getPairScriptSha();
  const roomId = crypto.randomUUID();
  const r = await redis.evalSha(sha, { keys: [QUEUE_KEY, ROOM_PREFIX], arguments: [roomId] });
  if (r[1] === 'paired') return { roomId, players: [r[2], r[3]] };
  return null; // 'single' 或 'empty'
}

module.exports = { takePairAndCreateRoomAtomic };
```

Worker 使用（当返回 null 时短暂休眠再重试）：

```javascript
// src/index.js（节选）
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
```

提示：使用 Lua 方案时，已不需要阻塞式 `BRPOP` 的独立连接；上面的脚本采用 `RPOP`，Worker 以短轮询方式调用，逻辑更直观，且可平滑扩展为多实例。

### 12.6 面试要点

- 为什么用 List 而非内存数组？多实例共享，支持阻塞消费（BRPOP）。
- 与 Streams 对比：Streams 有消费组/ACK，适合复杂流水线；List 更轻量、心智负担小。
- 并发安全：单 Worker 或 Lua 原子脚本，避免"各取一人"的竞争问题。
- 容错与去重：Worker 异常可重启；可用 Set 做入队去重，再 LPUSH；或由业务容忍重复。


---

## 第13章：Vue3 极简前端联调（猜拳 + 匹配 + 排行榜）

目标：用最少代码跑通一个可演示的 Vue3 小页面，直接对接你现有的 Node.js API：匹配、提交出招、排行榜。

### 13.1 创建最小 Vue3 项目（Vite）

```bash
# 在仓库同级目录创建前端项目
npm create vue@latest pair-and-rank-ui -- --template vue
cd pair-and-rank-ui
npm install
npm run dev  # 默认 http://localhost:5173
```

### 13.2 配置开发代理（避免跨域）
在前端项目根目录创建或编辑 `vite.config.js`：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端服务地址
        changeOrigin: true,
      },
    },
  },
})
```

说明：你的后端在 `src/index.js` 中将路由挂载在 `/api` 下：
- 匹配：`POST /api/matchmaking/queue/join`、`POST /api/matchmaking/queue/leave`、`GET /api/matchmaking/queue/size`、`GET /api/matchmaking/match/:roomId`
- 猜拳：`POST /api/rps/submit-move`、`GET /api/rps/result/:roomId`（以及演示用 `POST /api/rps/duel`）
- 排行榜：`POST /api/leaderboard/submit`、`POST /api/leaderboard/add`、`GET /api/leaderboard/top?n=10`、`GET /api/leaderboard/rank/:playerId`

### 13.3 最小页面（`src/App.vue`）
将以下内容替换前端项目的 `src/App.vue`：

```vue
<script setup>
import { ref, computed } from 'vue'

const playerId = ref('')
const roomId = ref('')
const opponent = ref('')
const statusMsg = ref('')
const top = ref([])

const canMatch = computed(() => !!playerId.value)

async function joinQueue() {
  statusMsg.value = '正在加入队列...'
  const res = await fetch('/api/matchmaking/queue/join', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: playerId.value })
  }).then(r => r.json())

  if (res.status === 'matched') {
    roomId.value = res.roomId
    opponent.value = res.players.find(p => p !== playerId.value) || ''
    statusMsg.value = `匹配成功，房间 ${roomId.value}，对手 ${opponent.value}`
  } else if (res.status === 'queued') {
    statusMsg.value = '已入队，等待另一位玩家...'
  } else if (res.status === 'already_in_queue') {
    statusMsg.value = '你已在队列中'
  } else {
    statusMsg.value = '匹配状态：' + (res.status || '未知')
  }
}

async function leaveQueue() {
  if (!playerId.value) return
  await fetch('/api/matchmaking/queue/leave', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: playerId.value })
  })
  statusMsg.value = '已离开队列'
}

async function submitMove(move) {
  if (!roomId.value || !playerId.value) return
  statusMsg.value = '已出招，等待对手...'
  const res = await fetch('/api/rps/submit-move', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId: roomId.value, playerId: playerId.value, move })
  }).then(r => r.json())

  if (res.status === 'resolved') {
    statusMsg.value = `结果：${res.result}，胜者：${res.winnerId || '平局'}（${res.reason}）`
    await refreshTop()
  } else if (res.status === 'pending') {
    statusMsg.value = '等待对手出招...'
  } else if (res.error) {
    statusMsg.value = '错误：' + res.error
  }
}

async function refreshTop() {
  const data = await fetch('/api/leaderboard/top?n=10').then(r => r.json())
  top.value = data.top || []
}

// 进入页面时拉取一次排行榜
refreshTop()
</script>

<template>
  <main style="max-width:720px;margin:24px auto;font-family:system-ui,Segoe UI,Arial;">
    <h1>Pair & Rank - 猜拳匹配演示</h1>

    <section style="margin:16px 0;padding:12px;border:1px solid #eee;border-radius:8px;">
      <h3>玩家</h3>
      <input v-model="playerId" placeholder="输入玩家ID" style="padding:8px;margin-right:8px;" />
      <button :disabled="!canMatch" @click="joinQueue">加入匹配</button>
      <button :disabled="!canMatch" @click="leaveQueue" style="margin-left:8px">离开队列</button>
      <p style="margin-top:8px;color:#555;">{{ statusMsg }}</p>
      <p v-if="roomId">房间：{{ roomId }}；对手：{{ opponent || '未知（等待匹配/对方入场）' }}</p>
    </section>

    <section style="margin:16px 0;padding:12px;border:1px solid #eee;border-radius:8px;">
      <h3>出招</h3>
      <button :disabled="!roomId" @click="submitMove(0)">石头</button>
      <button :disabled="!roomId" @click="submitMove(1)" style="margin-left:8px">剪子</button>
      <button :disabled="!roomId" @click="submitMove(2)" style="margin-left:8px">布</button>
    </section>

    <section style="margin:16px 0;padding:12px;border:1px solid #eee;border-radius:8px;">
      <h3>排行榜 Top 10</h3>
      <ol>
        <li v-for="p in top" :key="p.playerId">
          第{{ p.rank }}：{{ p.playerId }}（{{ p.score }}）
        </li>
      </ol>
    </section>
  </main>
</template>
```

### 13.4 启动与联调步骤
1) 启动后端（3000）：
```bash
npm run dev
```
2) 启动前端（5173）：
```bash
cd ../pair-and-rank-ui
npm run dev
```
3) 浏览器打开 `http://localhost:5173`：
- 输入玩家ID（建议开两个浏览器窗口，分别输入不同 ID）
- 点击"加入匹配"，匹配成功后会显示房间与对手
- 双方分别点击"石头/剪子/布"，第二人出招后即刻结算，胜者自动加 1 分
- 刷新"排行榜 Top 10"查看是否更新

### 13.5 常见问题
- 代理未生效：确认前端 `vite.config.js` 的 `/api` 代理与后端端口一致
- 404/路径错误：比对本章"说明"中的接口路径是否与后端一致
- Redis 未连接：检查后端 `.env` 中的 `REDIS_URL` 与控制台连接日志
- CORS 报错：确保通过 Vite 代理访问（前端使用 `/api/...`