# Features · Routes

完整路由清单（与 fmby 现行 webui 对齐，皮肤可重排顺序但不可漏）。

## 公开 / 普通用户

| Path | 鉴权 | 用途 | 关联 API |
|------|------|------|----------|
| `/login` | 无 | 登录 | `POST /api/auth/login` |
| `/register` | 无 | 注册（site.security.allow_registration=true 时） | `POST /api/auth/register` |
| `/` | 已登录 | 首页：默认重定向到 `/discover` 或 `/library/:default` | `GET /api/site/info` |
| `/discover` | 已登录 | 综合发现页 | `GET /api/browse/recent`、`/api/browse/recommend` |
| `/library` | 已登录 | 媒体库总览 | `GET /api/browse/libraries` |
| `/library/:libraryId` | 已登录 | 单库浏览 + 筛选 | `GET /api/browse/libraries/{id}/items` |
| `/library/:libraryId/items/:itemId` | 已登录 | 条目详情 | `GET /api/items/{id}` |
| `/play/:itemId` | 已登录 | 播放页 | `GET /api/items/{id}/play-target`、`/playback/heartbeat` |
| `/profile` | 已登录 | 个人资料 | `GET /api/me` |
| `/settings/profile` | 已登录 | 资料设置 | `PATCH /api/me` |
| `/settings/playback` | 已登录 | 播放设置 | `PATCH /api/me/preferences` |
| `/settings/appearance` | 已登录 | 外观（皮肤选择） | `GET /api/site/skins`、`PATCH /api/me/preferences` |

## 管理（admin）

| Path | 用途 | 关联 API |
|------|------|----------|
| `/manage/overview` | 站点概览 | `GET /api/manage/overview` |
| `/manage/advanced` | 高级状态 | `GET /api/manage/advanced` |
| `/manage/media/items` | 资源管理 | `GET /api/manage/media-items` |
| `/manage/media/items/:itemId` | 资源详情 | `GET /api/manage/media-items/{id}` |
| `/manage/media/add` | 新增条目 | (若有) |
| `/manage/media/libraries` | 媒体库管理 | `GET /api/manage/libraries` |
| `/manage/media/mounts` | 数据源 | `GET /api/manage/mounts` |
| `/manage/media/probe-tasks` | 探针任务 | `GET /api/manage/probe-tasks` |
| `/manage/media/naming-scrape` | 命名刮削设置 | `GET /api/manage/naming-scrape` |
| `/manage/site/users/registration-codes` | 注册码 | `GET /api/manage/registration-codes` |
| `/manage/site/users/accounts` | 用户列表 | `GET /api/manage/users` |
| `/manage/site/users/role-templates` | 角色模板 | `GET /api/manage/role-templates` |
| `/manage/site/security/sessions` | 会话 | `GET /api/manage/sessions` |
| `/manage/site/security/audit-logs` | 审计日志 | `GET /api/manage/audit-logs` |
| `/manage/site/security/runtime-logs` | 运行日志 | `GET /api/manage/runtime-logs` |
| `/manage/site/developer-api` | 开发者 API / API Token / Explorer | `GET /api/manage/developer/endpoints`、`GET /api/manage/developer/api-tokens` |
| `/manage/site/settings` | 站点设置 | `GET /api/site/settings` |
| `/manage/site/advanced` | 高级设置 | `GET /api/manage/advanced` |
| `/manage/tools/pan115-share-download` | 旧分享 Cookie 工具兼容跳转 | 重定向到 `/manage/media/mounts` |
| `/manage/tools/pan115-imghost` | 115 图床治理 / 观测 | `GET /api/manage/pan115/imghost/*` |

## 历史路径重定向

皮肤可不实现，但若实现需保留旧路径的 301：

```
/manage/items           -> /manage/media/items
/manage/libraries       -> /manage/media/libraries
/manage/mounts          -> /manage/media/mounts
/manage/probe-tasks     -> /manage/media/probe-tasks
/manage/naming-rules    -> /manage/media/naming-scrape
/manage/registration-codes -> /manage/site/users/registration-codes
/manage/users           -> /manage/site/users/accounts
/manage/role-templates  -> /manage/site/users/role-templates
/manage/sessions        -> /manage/site/security/sessions
/manage/audit-logs      -> /manage/site/security/audit-logs
/manage/runtime-logs    -> /manage/site/security/runtime-logs
/manage/advanced        -> /manage/site/advanced
```

## 默认落地策略

- 已登录访问 `/login` → 重定向 `/`
- 未登录访问 `/manage/*` → 重定向 `/login?next=...`
- 非 admin 访问 `/manage/*` → 渲染 403 页面（不要静默 404）
- 未启用 imghost 后端服务 → `/manage/tools/pan115-imghost` 仍渲染页面，并在凭据 / 资产区展示配置引导
