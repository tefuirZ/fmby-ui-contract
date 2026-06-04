# Features · Manage · Media Reviews

待审核队列是自动识别 / 刮削失败后的人工兜底入口，skin 必须让管理员能确认来源路径、搜索候选并提交人工匹配。

## 路由

- `/manage/media/reviews`：队列

## 数据

- [../../api/domains/manage/media-reviews.md](../../api/domains/manage/media-reviews.md)

## UI

- 左侧队列：按 stage/status/page 筛选，可看 open / claimed / resolved。
- 右侧详情：标题、媒体类型、季集号、失败原因、候选和原始 JSON 摘要。
- 来源上下文：必须展示数据源、provider、`displayPath` 和 `filePath`。
- 人工匹配：provider 下拉 + 搜索下拉候选 + 直接填写外部 ID。
- 提交：`action: "ManualMatch"`，payload 带 `provider/externalId/entityType/title/originalTitle/year`。

## 状态

- claim 冲突（409）：toast + 自动刷新该行
- provider 搜索失败：保留直接填写外部 ID
- provider 搜索空结果：显示空态，不阻断手填
- resolve 后立即从 open 队列移除或标记 resolved
- resolve 成功只代表已提交人工匹配，后端会异步重新刮削

## 皮肤建议

- 候选按 score 降序
- 决议有「跳过 / 标记忽略」选项
- 队列空时显示明确空态
- 长路径允许换行或中间省略，但 hover / copy 必须能拿到完整路径
