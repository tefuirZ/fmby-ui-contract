# Manage Domain — Admin Surface

`/api/manage/**` 是站点管理面，所有端点要求登录态 + 管理员角色（`auth.roles` 包含 `admin` 或 `superadmin`）。  
普通用户访问会得到 `403 forbidden`。

## 子文档

| 文档 | 范围 | 关键端点示例 |
|------|------|---------------|
| [dashboard.md](./manage/dashboard.md) | 站点概览 / 高级状态 | `GET /api/manage/overview`、`GET /api/manage/advanced` |
| [users.md](./manage/users.md) | 用户、角色模板、批量操作 | `GET /api/manage/users`、`POST /api/manage/users/batch/disable` |
| [registration-codes.md](./manage/registration-codes.md) | 注册码与批次 | `POST /api/manage/registration-codes`、`PATCH /api/manage/registration-codes/{id}` |
| [sessions.md](./manage/sessions.md) | 在线会话 / 强制下线 | `GET /api/manage/sessions`、`DELETE /api/manage/sessions/{id}` |
| [libraries.md](./manage/libraries.md) | 媒体库定义 / 扫描触发 | `POST /api/manage/libraries`、`POST /api/manage/libraries/{id}/scan` |
| [mounts.md](./manage/mounts.md) | 数据源挂载 / 浏览 / 校验 | `POST /api/manage/mounts/browse-directories`、`POST /api/manage/mounts/{id}/validate` |
| [media-items.md](./manage/media-items.md) | 媒体条目细管 / 刮削 / artwork / subtitle | `GET /api/manage/media-items`、`POST /api/manage/media-items/{id}/scrape` |
| [media-reviews.md](./manage/media-reviews.md) | 元数据审核工单 | `GET /api/manage/media-reviews`、`POST /api/manage/media-reviews/{id}/resolve` |
| [tasks.md](./manage/tasks.md) | 扫描 / 探针 / 命名刮削 / 命名清理 | `GET /api/manage/scans`、`PUT /api/manage/naming-scrape` |
| [task-center.md](./manage/task-center.md) | 任务中心聚合视图 | `GET /api/manage/task-center/overview`、`POST /api/manage/task-center/items/{cat}/{id}/actions` |
| [source-availability.md](./manage/source-availability.md) | 数据源可用性恢复 | `POST /api/manage/source-availability/{id}/recover` |
| [logs.md](./manage/logs.md) | 审计日志 / 运行日志 | `GET /api/manage/audit-logs`、`GET /api/manage/runtime-logs` |
| [pan115.md](./manage/pan115.md) | 115 网盘 / 115 分享账号绑定与浏览 | `POST /api/manage/pan115/qr-login`、`POST /api/manage/pan115/share-mounts/{id}/activate` |
| [pan115-imghost.md](./manage/pan115-imghost.md) | 115 图床治理 / 观测 | `POST /api/manage/pan115/imghost/upload`、`GET /api/manage/pan115/imghost/raw/{sha1}` |

## 通用约定

- 所有响应遵循 [api/conventions.md](../../conventions.md)：成功 `{ data, meta? }`，失败 `{ error }`。
- 列表端点支持 `?page=&page_size=` 与领域内的 `?status=&q=` 等过滤；具体见各子文档。
- 写操作（POST/PATCH/PUT/DELETE）写入 `audit_logs`；皮肤端可通过 `logs.md` 反查谁在何时改了什么。
- 长任务（扫描、批量刮削、回填）走 task-center；皮肤需要自己做"提交后跳到任务中心"的引导。
- 皮肤可探测 bootstrap / `GET /api/site/info` 中的 `features.pan115_imghost_enabled` 展示图床服务可用性，但不应把图床治理页直接隐藏或改成 404；后端未启用时页面内展示配置引导。
