# pairAndRank 項目概覽
- 目的：構建一個可展示的 Node.js 後端示例，涵蓋玩家匹配服務與基於 Redis 的排行榜，配合教程式 README 引導讀者從零搭建。
- 技術棧：Node.js（CommonJS 模塊）、Express、Redis（需外部實例或 Docker）；使用 dotenv 管理環境變量。
- 架構：`src/index.js` 為入口，初始化 Express 應用與 Redis 連線；`src/config`/`services`/`routes`/`utils` 提供後續章節擴展的佈局；匹配服務與排行榜服務位於 `src/services`。
- README 提供章節式學習路線（0-11 章）與常見問題、面試題，適合逐步補完功能。
- 目前程式碼多為骨架與示例函數，等待按章節填充路由、排行榜邏輯等細節。