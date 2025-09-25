# 代碼風格與約定
- 採用 CommonJS 模塊 (`require`/`module.exports`)，入口與服務均使用簡潔函數導出。
- 當前沒有自動化格式化或 ESLint 配置，代碼風格以教程示例為主：簡單函數、少量中文註釋、同步流程。
- 服務層以純函數與內存結構實現邏輯（如匹配隊列 `waitingQueue`、活動房間 `activeMatches`）。
- README 與示例代碼偏向逐步講解，適合延續中文註釋與章節式說明。
- 建議引用 async 操作時保持 `async/await` 並捕捉錯誤；Redis 連線透過 `initRedis` 單例化。