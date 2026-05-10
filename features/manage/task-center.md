# Features · Manage · Task Center

## 路由
- `/manage/task-center`（推荐；fmby 现行实现入口为 ManageTaskCenterPage）

## 数据
- [../../api/domains/manage/task-center.md](../../api/domains/manage/task-center.md)

## UI

**顶部数字卡**：running / queued / failed_24h / completed_24h  
**任务流**：分类徽标 + 进度条 + 时间 + ref 链接 + 操作按钮  
**筛选**：category / status / since  
**详情面板**：完整 ref + 错误堆栈 + actions

## 操作
- 按 `available_actions` 动态渲染按钮（cancel / retry / pause / resume）
- 批量重试失败：列表多选 + 顶部"重试选中"

## 皮肤建议
- 进度条配色：running 蓝 / failed 红 / paused 灰 / completed 绿
- failed 行 trace_id 一键复制
- 不要默认强制 SSE，按用户开关刷新（默认 5s 轮询）
