# Features · Manage · Sessions

## 路由
- `/manage/site/security/sessions`

## 数据
- [../../api/domains/manage/sessions.md](../../api/domains/manage/sessions.md)

## UI

表格列：用户名 / 客户端 / IP / 最后活跃 / 过期 / 操作  
筛选：按用户、按 client  
操作：踢下线（踢自己需二次确认）

## 皮肤建议
- 默认按 last_seen_at 倒序
- "踢自己"按钮文案要明确（避免误操作）
- 实时性：mutation 后立即刷新列表
