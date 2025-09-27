## PairAndRank

轻量的 Node.js + Redis 实时匹配与排行榜示例，包含：
- 玩家匹配（队列 -> 两两成组），房间状态存储在 Redis
- 石头剪子布对战（提交出招 -> 自动判定 -> 更新排行榜）
- 排行榜（ZSet）查询 TopN、个人排名
- Vue3 前端演示（Vite 构建）

本 README 面向“项目使用者”，提供快速运行、API 说明与部署指引。

---

### 目录结构

```
PairAndRank/
├─ package.json
├─ src/
│  ├─ index.js                # Express 入口 + 匹配 worker
│  ├─ config/redis.js         # Redis 连接（REDIS_URL）
│  ├─ routes/
│  │  ├─ index.js             # 路由聚合 /api
│  │  ├─ matchmaking.js       # 匹配相关 HTTP API
│  │  ├─ leaderboard.js       # 排行榜 HTTP API
│  │  └─ rps.js               # 出招/结果 HTTP API
│  ├─ services/
│  │  ├─ matchmaking.js       # 队列、原子配对、房间查询
│  │  ├─ leaderboard.js       # zAdd/zIncrBy/topN/rankOf
│  │  └─ rps.js               # 出招持久化、判定、写回
│  └─ scripts/match_pair.lua  # Redis Lua 原子配对
└─ pairAndRank-UI/            # 前端（Vite + Vue3）
```

---

### 运行环境

- Node.js >= 18（建议 20）
- Redis >= 6.0.10
- 环境变量：
  - `PORT`（可选，默认 3000）
  - `REDIS_URL`（可选，默认 `redis://localhost:6379`）

---

### 快速开始（后端）

```bash
cd PairAndRank
npm install
npm run start
```

启动后：
- 健康检查：`GET /healthz`
- API 前缀：`/api`

---

### 关键点说明

- 匹配队列：`mm:queue`（Redis List）
- 房间数据：`mm:room:<roomId>`（Redis Hash）
- 玩家-房间映射：`mm:player-room:<playerId>`（String，TTL 同房间未决 60s）
- 原子配对：`src/scripts/match_pair.lua`，创建房间并设置 60s 初始 TTL
- 游戏判定：两人都出招即写入结果并将 TTL 延长至 3600s，同时为胜者 `+1` 分

---

### HTTP API（摘要）

所有路径均带前缀 `/api`。

1) 匹配 Matchmaking（`src/routes/matchmaking.js`）

- `POST /matchmaking/queue/join`
  - body: `{ playerId: string }`
  - 200: `{ status: 'matched', roomId, players } | { status: 'queued' } | { status: 'already_in_queue' }`

- `POST /matchmaking/queue/leave`
  - body: `{ playerId: string }`
  - 200: `{ status: 'left' }`

- `GET /matchmaking/queue/size`
  - 200: `{ size: number }`

- `GET /matchmaking/match/:roomId`
  - 200: `{ roomId, players: [a, b] }` 或 404

- `GET /matchmaking/my-room/:playerId`
  - 200: `{ roomId, players }` 或 404（未匹配或房间过期）

2) 出招与结果 RPS（`src/routes/rps.js`）

- `POST /rps/submit-move`
  - body: `{ roomId: string, playerId: string, move: 0|1|2 }`
  - 200: `{ status: 'pending', waitingFor: [...] } | { status: 'resolved', result, winner, reason, winnerId, playerA, playerB }`
  - 400/404: `{ error: string }`

- `GET /rps/result/:roomId`
  - 200: `{ players, moves, result | null }` 或 404

3) 排行榜 Leaderboard（`src/routes/leaderboard.js`）

- `POST /leaderboard/submit`
  - body: `{ playerId: string, score: number }`
  - 200: `{ ok: true }`

- `POST /leaderboard/add`
  - body: `{ playerId: string, delta: number }`
  - 200: `{ ok: true, score }`

- `GET /leaderboard/top?n=10`
  - 200: `{ top: [{ rank, playerId, score }] }`

- `GET /leaderboard/rank/:playerId`
  - 200: `{ rank, score }` 或 404

---

### 前端（Vue3）

开发：
```bash
cd pairAndRank-UI
npm install
npm run dev
```

构建：
```bash
npm run build
```

Vite 代理：`pairAndRank-UI/vite.config.js` 将 `/api` 代理到 `http://localhost:3000`。

页面逻辑摘要：
- 加入队列后开启轮询查询 `my-room` → 一旦匹配到房间开始轮询结果
- 出招后后端落库 Redis；双方都出招后返回胜负并更新排行榜
- 排行榜只展示 `playerId:score`

---

### 部署（Docker Compose 示例）

最简方案：Nginx 托管前端静态文件，Node 进程跑 API，Redis 官方镜像。

示例 `docker-compose.yml`：
```yaml
version: "3.9"
services:
  api:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    command: sh -c "npm install && npm run start"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./pairAndRank-UI/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
```

示例 `nginx.conf`：
```nginx
server {
    listen 80;
    server_name _;

    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://api:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

一键启动：
```bash
docker compose up -d --build
```

---

### 故障排查

- `vite 不是内部或外部命令`：前端目录执行 `npm install` 后再 `npm run build`，或 `npx vite --version` 验证。
- `ERR wrong number of arguments for 'hset'`：确认后端使用逐字段 `hSet(key, field, value)`，Lua 中按单字段多次 HSET。
- `LPOS unknown command`：需 Redis >= 6.0.6；本项目要求 6.0.10+。
- 前端 404 `my-room`：未匹配属正常，轮询继续；房间过期会返回 404。
- 二次开局残留状态：前端在重新加入前会停止所有轮询并清空状态；后端在判定后将房间 TTL 延至 3600 秒。
- Docker 容器启动慢：首次运行会下载依赖，后续启动会快很多。可用 `docker compose logs api` 查看后端启动日志。

---

### 许可证

ISC
