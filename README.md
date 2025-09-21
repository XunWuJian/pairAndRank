## Node.js 游戏匹配与 Redis 排行榜：从零到一的简历加分项目

本教材带你从空目录开始，手把手搭建一个“可以运行、可展示、可讲述”的 Node.js 游戏后端：包含玩家匹配服务与基于 Redis 的排行榜。你将按章节循序渐进，每一步都知道“在做什么”“为什么这么做”，并附上面试官常问的问题与答题要点。

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

> 说明：你先前提到“Node.js 服务端”，后文也会坚持使用 Node.js。如果你改为希望使用 Go，同样的章节结构可平移过去（我会在后续章节的“可选拓展”里提示 TS/Go 的迁移点）。

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

目标：从空目录开始，建立 Git 仓库与 npm 项目，并推送到 GitHub，形成“可展示”的基础。

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

- 你已经拥有一个“可推送、可展示”的最小仓库
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
- 当队列中人数达到 2，即刻两两配对并返回一个“房间号”（示例用随机 UUID）
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

---

## 第7章：输入校验与错误处理（简化版）

目标：保证接口收到的数据是可用的，并在出错时提供稳定的错误格式。

建议：

- 在路由层对 body/query/path 进行类型与必填校验（目前已做基础判断）
- 返回统一结构：`{ error: string, details?: any }`
- 记录错误日志，避免把内部错误信息直接暴露给客户端

可选升级：引入 `zod` 或 `joi` 做可复用的 schema 校验，在服务层前就拦截无效输入。

面试点：

- 如何设计错误码与 HTTP 状态码的对应关系？
- 校验失败与系统异常应如何区分？

---

## 第8章：日志与配置

目标：结构化日志与可切换的配置管理。

建议：

- 使用 `.env` 管理敏感与可变配置
- 日志工具可以选 `pino`（高性能）、或 `morgan`（HTTP 访问日志）

示例（简化）：

```bash
npm install pino morgan
```

`src/utils/logger.js`

```javascript
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
module.exports = logger;
```

在 `src/index.js` 中引入并打印启动信息，路由中记录关键操作。

面试点：

- 生产环境日志与本地开发日志的差异（JSON vs pretty print）
- 如何通过环境变量切换日志等级

---

## 第9章：Docker 化与一键启动

目标：一条命令拉起服务与 Redis，方便评审者快速体验。

最小示例（将在后续实现）：

- `Dockerfile`：构建 Node.js 应用镜像
- `docker-compose.yml`：同时启动 app 与 redis，并通过环境变量注入连接地址

面试点：

- 容器内服务如何与另一个容器（Redis）通信？
- 多阶段构建如何减小镜像体积？

---

## 第10章：API 文档与测试

目标：提供最基本的 API 说明与用例脚本；可选增加 Jest 自动化测试。

建议：

- 在 README 中维护“如何运行”“如何调用”的示例（你现在看到的这些 curl 就是）
- 可选：使用 Swagger/OpenAPI 生成可视化文档

面试点：

- 如何在 CI 中执行测试并出报告？
- 如何为外部用户提供稳定的 API 版本？

---

## 第11章：部署与展示（GitHub Actions 可选）

目标：让你的仓库“看起来专业、能跑起来”。

建议：

- 在 README 顶部放置运行截图、接口示例、技术要点
- 使用 GitHub Actions：在 push 时自动 `npm ci && npm test && docker build`（可选）
- 提供一键部署脚本或 Render/Heroku 的免费部署指南（如适用）

---

## 附录A：常见问题与排错清单

- 服务启动报端口被占用：修改 `PORT` 或关闭占用端口的进程
- Redis 连接失败：检查 `REDIS_URL`、网络、防火墙，尝试 `docker ps` 确认容器已启动
- curl 显示无法连接：确认服务已启动且监听 `http://localhost:3000`

---

## 附录B：面试题速查（汇总）

- 为什么排行榜适合用 Redis 的 Sorted Set？复杂度与常见操作？
- 多实例服务如何做匹配一致性？（共享队列、分布式锁、队列/流、单点匹配器）
- 如何防止恶意刷分？（鉴权、服务端校验、限流、异常检测）
- 如何保证排行榜的原子性更新？（单条命令、Lua 脚本、事务）
- 如何做可观测性？（结构化日志、指标、追踪）

---

## 下一步（你现在可以做什么）

1) 按照第2–6章完成代码与本地验证，并提交到 GitHub（在提交信息中体现你的学习路径）
2) 选择第9章 Docker 化，让评审者“一键可运行”
3) 在仓库 README 顶部补充：项目截图、快速开始、API 示例与技术要点清单
4) 如需加分：把服务改写为 TypeScript（保留相同结构），或将匹配队列迁移到 Redis 以支持多实例

> 提醒：本教材采用“引导—实现—总结—面试点”的节奏。你可以逐章提交，每次提交都能在面试中讲述“我为什么这样做”。


