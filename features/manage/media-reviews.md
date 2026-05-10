# Features · Manage · Media Reviews

> 注意：fmby 当前 webui 没有独立审核工单页（reviews 嵌入在 items 流程）；这里描述完整能力，皮肤可选实现。

## 路由（建议）
- `/manage/media/reviews`：队列

## 数据
- [../../api/domains/manage/media-reviews.md](../../api/domains/manage/media-reviews.md)

## UI

**双栏**：左侧队列（按 library 折叠）+ 右侧候选对比卡  
候选卡：海报 + 标题年份 + provider + score  
顶栏筛选：open / claimed / resolved；"我的认领"

## 状态
- claim 冲突（409）：toast + 自动刷新该行
- resolve 后 5s 自动从 open 队列移除

## 皮肤建议
- 候选按 score 降序
- 决议有「跳过 / 标记忽略」选项
- 队列空时显示 zen 图 + "没有待处理工单"
