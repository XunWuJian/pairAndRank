# 任務完成檢查清單
- 如修改依賴，執行 `npm install` 並更新 `package-lock.json`。
- 服務啟動前確認環境變量（如 `REDIS_URL`、`PORT`）；可先本地啟動 Redis 或使用雲端實例。
- 運行 `npm run dev`（nodemon）或 `npm start` 驗證服務可啟動，測試 `/healthz`。
- 目前缺少自動化測試與 lint；建議在提交前做基礎手測或補充單元測試。
- 更新教程文檔時保持章節結構與中文說明，必要時附帶面試題/面試點。