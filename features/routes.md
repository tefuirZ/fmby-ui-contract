# Features · Routes

完整路由清单（与当前 `apps/web/src/app/router/index.tsx` 对齐）。皮肤可调整导航组织，但不要漏掉契约功能。

## 公开 / 普通用户

| Path | 鉴权 | 用途 | 关联 API |
|---|---|---|---|
| `/install` | 无 | 首次安装 / 恢复模式 | `/api/install/status` |
| `/login` | 无 | 登录、TOTP challenge 入口 | `POST /api/auth/login` |
| `/register` | 无 | 注册（registration_enabled 时显示） | `POST /api/auth/register` |
| `/` | 已登录 | 首页 | `GET /api/browse/home/bootstrap` |
| `/history` | 已登录 | 播放历史 | `GET /api/browse/history` |
| `/libraries` | 已登录 | 媒体库总览 | `GET /api/browse/libraries/home`、`GET /api/browse/libraries` |
| `/libraries/:libraryId` | 已登录 | 单库浏览 + 筛选 | `GET /api/browse/libraries/{libraryId}` |
| `/item/:itemId` | 已登录 | 条目详情 | `GET /api/items/{itemId}` |
| `/play/:itemId` | 已登录 | 播放页 | `GET /api/playback/items/{itemId}`、`POST /api/playback/sessions` |
| `/settings/profile` | 已登录 | 资料设置 | `GET/PUT /api/settings/user/profile` |
| `/settings/playback` | 已登录 | 播放设置 | `GET/PUT /api/settings/user/playback` |
| `/settings/appearance` | 已登录 | 外观 / 主题选择 | `GET/PUT /api/settings/user/appearance`、`GET /api/site/skins` |
| `/settings/server/general` | `manage:access` | 服务器通用设置 | `GET/PUT /api/settings/server/general` |
| `/settings/server/security` | `manage:access` | 服务器安全设置 | `GET/PUT /api/settings/server/security` |
| `/settings/server/session-policy` | `manage:access` | 会话策略 | `GET/PUT /api/settings/server/session-policy` |

## 管理（manage:access）

| Path | 用途 | 关联 API |
|---|---|---|
| `/manage` | 运营看板 / 首次配置引导 | `GET /api/manage/operations/overview`、`GET /api/manage/overview` |
| `/manage/task-center` | 任务中心 | `GET /api/manage/task-center/overview`、`GET /api/manage/task-center/items` |
| `/manage/media/add` | 新增媒体引导 | 媒体库 / 挂载相关 API |
| `/manage/media/items` | 资源管理 | `GET /api/manage/media-items` |
| `/manage/media/items/:itemId` | 资源详情 | `GET /api/manage/media-items/{itemId}` |
| `/manage/media/libraries` | 媒体库管理 | `GET /api/manage/libraries` |
| `/manage/media/mounts` | 数据来源 / 挂载点 | `GET /api/manage/mounts` |
| `/manage/media/upstreams` | 上游源网关 | `GET /api/manage/upstreams` |
| `/manage/media/probe-tasks` | 技术探测任务 | `GET /api/manage/probe-tasks` |
| `/manage/media/naming-scrape` | 命名刮削设置 | `GET /api/manage/naming-scrape` |
| `/manage/media/naming-cleanup` | 兼容重定向到 naming-scrape | - |
| `/manage/media/pan115-imghost` | 115 图床治理 / 观测 | `GET /api/manage/pan115/imghost/*` |
| `/manage/site/users/registration-codes` | 注册码 | `GET /api/manage/registration-codes` |
| `/manage/site/users/accounts` | 用户列表 | `GET /api/manage/users` |
| `/manage/site/users/role-templates` | 角色模板 | `GET /api/manage/role-templates` |
| `/manage/site/security/sessions` | 会话 | `GET /api/manage/sessions` |
| `/manage/site/security/audit-logs` | 审计日志 | `GET /api/manage/audit-logs` |
| `/manage/site/security/runtime-logs` | 运行日志 | `GET /api/manage/runtime-logs` |
| `/manage/site/license` | 授权与订阅 | `GET /api/manage/license/status` |
| `/manage/site/developer-api` | 开发者 API / API Token / Explorer | `GET /api/manage/developer/endpoints`、`GET /api/manage/developer/api-tokens` |
| `/manage/site/settings` | 站点设置聚合页 | settings + manage overview API |
| `/manage/site/advanced` | 高级状态 | `GET /api/manage/advanced` |

## 默认落地策略

- 已登录访问 `/login`：重定向 `/`。
- 未登录访问受保护路由：重定向 `/login?next=...`。
- 无 `manage:access` 访问 `/manage/*`：渲染 403 页面。
- `/api/*` 未命中：显示 API JSON 错误，不允许当作 SPA 页面。
- `/_assets/{skin}/manage/...` 这类旧式深链由后端重定向回 `/manage/...`。

## 兼容路径

旧版文档出现过 `/manage/overview`、`/discover`、`/library/:id`、`/library/:id/items/:itemId` 等路径。当前路由真相以上表为准；第三方 skin 不应新增这些作为主路径，除非自己做显式重定向。
