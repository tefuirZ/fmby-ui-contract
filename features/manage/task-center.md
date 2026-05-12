# Features · Manage · Task Center

## 路由
- `/manage/task-center`（推荐；fmby 现行实现入口为 ManageTaskCenterPage）

## 数据
- [../../api/domains/manage/task-center.md](../../api/domains/manage/task-center.md)

## UI

**顶部数字卡**：按类别展示 KPI，至少覆盖 `Identify / Scrape / Imghost / AiAssist / Scan / Review / Tombstone`
**任务流**：分类徽标 + 状态 + 时间 + ref 链接 + 操作按钮
**筛选**：category / status / from / to
**详情面板**：完整 ref + 错误堆栈 + actions

## 操作
- 当前统一动作：`Retry / Cancel / Skip / Resolve`
- `Imghost` 类别至少支持：
  - `Retry`
  - `Cancel`
- Review 类别在任务中心只给跳转提示，不直接在这里处理审核领取/释放

## 皮肤建议
- 进度条配色：running 蓝 / failed 红 / paused 灰 / completed 绿
- failed 行 trace_id 一键复制
- 不要默认强制 SSE，按用户开关刷新（默认 5s 轮询）
