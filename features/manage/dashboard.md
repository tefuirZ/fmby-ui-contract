# Features · Manage · Dashboard

## 路由
- `/manage/site/advanced`

## 数据
- API：[../../api/domains/manage/dashboard.md](../../api/domains/manage/dashboard.md)
- 管理首页运营看板：[operations-dashboard.md](./operations-dashboard.md)

## UI

**概览数据**：用于 `/manage` 的首次配置引导和健康提醒。
**高级页**：runtime 指标 + scrape_workers + errors_recent。

## 皮肤建议
- 卡片可配色用 design tokens（[design/tokens.md](../../design/tokens.md)）
- errors_recent 行支持复制 trace_id（HTTP 走 fallback）
- 默认不要高频自动刷新；手动刷新或低频轮询即可
