# Features · Manage · Dashboard

## 路由
- `/manage/overview`
- `/manage/site/advanced`

## 数据
- API：[../../api/domains/manage/dashboard.md](../../api/domains/manage/dashboard.md)

## UI

**概览页**：6 张卡（用户 / 库 / 条目 / 任务 / 会话 / 存储），点击卡片下钻。  
**高级页**：runtime 指标 + scrape_workers + errors_recent。

## 皮肤建议
- 卡片可配色用 design tokens（[design/tokens.md](../../design/tokens.md)）
- errors_recent 行支持复制 trace_id（HTTP 走 fallback）
- 默认 30s 自动刷新（用户可关）
