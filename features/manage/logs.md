# Features · Manage · Logs

## 路由
- `/manage/site/security/audit-logs`：审计日志（写操作）
- `/manage/site/security/runtime-logs`：运行日志（错误/告警）

## 数据
- [../../api/domains/manage/logs.md](../../api/domains/manage/logs.md)

## UI

**审计**：表格列 ts / actor / action / target / summary；行展开看 diff（before/after JSON 对比器）  
**运行**：表格列 ts / level / module / msg；level 彩色徽标；trace_id 复制按钮  
快捷时间窗：1h / 24h / 7d / 自定义

## 状态
- 时间窗过大返回 413 → 提示用户缩小范围
- 0 条 → 友好 empty 图

## 皮肤建议
- diff 对比器用 deep-equal + 字段级高亮
- 模糊搜索：q 参数（msg LIKE）
- 导出 CSV（前端组装）
