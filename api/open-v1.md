# Open API v1

`/api/open/v1/*` 是面向第三方开发者、自动化脚本和非内置客户端的稳定开放 API。

它不同于内置 skin 使用的 `/api/*`：开放 API 只接受 `Authorization: Bearer <api_token>`，不接受 Cookie session、CSRF token、query token 或 compat `api_key`。

## 边界

| 边界 | 路径 | 凭证 | 消费方 |
|---|---|---|---|
| 内置 Web API | `/api/*` | Cookie session + CSRF | 内置 skin / 受信前端 |
| 开放 API | `/api/open/v1/*` | Header Bearer API Token | 第三方开发者 / 自动化脚本 |
| Compat API | `/emby/*`、`/jellyfin/*` | compat token / `api_key` / Emby header | Emby / Jellyfin 兼容客户端 |

第三方 Bearer 不能访问内部 `/api/*`。内置 skin 也不能把 `/api/open/v1/*` 当页面数据源；它只能在开发者 API Explorer 的 Bearer 模式里用于测试开放合同。

## Token 模型

API Token 由管理员在内置管理页创建：

```http
POST /api/manage/developer/api-tokens
```

Token 创建规则：

1. 明文由后端随机生成，只在创建响应返回一次。
2. 数据库只保存 `token_hash`、`token_prefix` 和生命周期元数据。
3. 创建请求必须显式传 `owner_user_id`。
4. owner 可以是 `human` 或 `service` 主体。
5. `service` 主体不能交互式 Web 登录。
6. `scopes` 必须非空。
7. `expires_at` 可省略；省略时后端默认 `created_at + 365 天`。
8. 本期没有 rotate，只支持创建、列表、吊销、过期失效。

Token 使用规则：

```http
GET /api/open/v1/browse/home
Authorization: Bearer fmby_xxx...
```

禁止：

1. 在 query string 传 Token。
2. 在 Cookie 中传 Token。
3. 把 Token 写入 localStorage / sessionStorage / IndexedDB。
4. 在 console、审计日志、错误上报或 URL 中输出明文 Token。

## Scope

Scope 只定义 Token 的权限上限。最终是否放行还会实时叠加 owner 当前状态、有效期、`must_change_password`、角色能力和来源授权。

| Scope | 语义 |
|---|---|
| `open:browse.read` | 读取首页聚合、媒体库列表和站内搜索结果 |
| `open:items.read` | 读取条目详情、子集和媒体来源摘要 |
| `open:items.write` | 触发条目刷新等条目级写操作 |
| `open:assets.read` | 读取图片、字幕和媒体流资源 |
| `open:playback.read` | 读取播放决策和播放会话 |
| `open:playback.write` | 创建播放会话并回写进度、心跳和停止事件 |
| `open:manage.libraries.read` | 读取管理端媒体库列表与详情 |
| `open:manage.libraries.write` | 触发媒体库扫描等写操作 |
| `open:manage.mounts.read` | 读取来源挂载列表与详情 |
| `open:manage.mounts.write` | 触发挂载校验、刷新访问等写操作 |
| `open:manage.users.read` | 读取管理端用户列表与详情 |
| `open:manage.users.write` | 更新账号状态等用户管理写操作 |

前端实现必须从 `GET /api/manage/developer/endpoints` 返回的 `scopes` 渲染管理页选项。若实现代码保留本地枚举，本地枚举必须与后端 endpoint catalog 同步；未知 scope 必须显式失败，不能静默降级成已知 scope。

## Endpoint Catalog

开放 API 目录的真相源是后端 `OpenApiEndpointDescriptor` catalog，并由管理接口暴露给内置 skin：

```http
GET /api/manage/developer/endpoints?page=1&page_size=20&q=&scope=&method=
```

catalog 响应包含：

```json
{
  "items": [
    {
      "method": "GET",
      "path": "/api/open/v1/browse/home",
      "summary": "浏览首页聚合数据",
      "required_scope": "open:browse.read",
      "auth_modes": ["bearer"],
      "request_body": null,
      "response_body": "OpenJsonValue",
      "destructive": false,
      "notes": []
    }
  ],
  "total": 20,
  "page": 1,
  "page_size": 20,
  "constraints": {
    "allowed_path_prefix": "/api/open/v1/",
    "forbidden_path_prefixes": [
      "/api/auth/",
      "/api/session",
      "/api/site/",
      "/api/settings/",
      "/api/install/",
      "/emby/",
      "/jellyfin/"
    ],
    "allow_absolute_url": false,
    "allow_query_token": false,
    "bearer_credentials": "omit",
    "session_credentials": "same-origin"
  },
  "scopes": [
    {
      "value": "open:browse.read",
      "label": "浏览读取",
      "description": "读取首页聚合、媒体库列表和站内搜索结果"
    }
  ]
}
```

skin 必须使用后端分页、搜索、scope 和 method 过滤结果，不允许一次性拉全量后在前端本地过滤。

## 首批端点

| Method | Path | Scope | 说明 |
|---|---|---|---|
| `GET` | `/api/open/v1/browse/home` | `open:browse.read` | 浏览首页聚合数据 |
| `GET` | `/api/open/v1/browse/libraries` | `open:browse.read` | 媒体库列表 |
| `GET` | `/api/open/v1/browse/search` | `open:browse.read` | 站内搜索 |
| `GET` | `/api/open/v1/items/{itemId}` | `open:items.read` | 条目详情 |
| `POST` | `/api/open/v1/items/{itemId}/refresh-metadata` | `open:items.write` | 刷新条目元数据 |
| `GET` | `/api/open/v1/assets/items/{itemId}/images/{kind}` | `open:assets.read` | 条目图片资源 |
| `GET` | `/api/open/v1/assets/people/{personId}/primary` | `open:assets.read` | 人物主图资源 |
| `GET` | `/api/open/v1/assets/subtitles/{assetId}` | `open:assets.read` | 字幕资源 |
| `GET` | `/api/open/v1/assets/streams/{sourceId}` | `open:assets.read` | 媒体流读取 |
| `HEAD` | `/api/open/v1/assets/streams/{sourceId}` | `open:assets.read` | 媒体流 HEAD 探测 |
| `GET` | `/api/open/v1/playback/items/{itemId}` | `open:playback.read` | 播放决策 |
| `GET` | `/api/open/v1/playback/sessions` | `open:playback.read` | 用户播放会话列表 |
| `POST` | `/api/open/v1/playback/sessions` | `open:playback.write` | 创建或恢复播放会话 |
| `POST` | `/api/open/v1/playback/sessions/{sessionId}/progress` | `open:playback.write` | 回写播放进度 |
| `POST` | `/api/open/v1/playback/sessions/{sessionId}/heartbeat` | `open:playback.write` | 回写播放心跳 |
| `POST` | `/api/open/v1/playback/sessions/{sessionId}/stop` | `open:playback.write` | 停止播放会话 |
| `GET` | `/api/open/v1/manage/libraries` | `open:manage.libraries.read` | 管理端媒体库列表 |
| `POST` | `/api/open/v1/manage/libraries/{libraryId}/scan` | `open:manage.libraries.write` | 触发媒体库扫描 |
| `GET` | `/api/open/v1/manage/mounts` | `open:manage.mounts.read` | 管理端挂载列表 |
| `POST` | `/api/open/v1/manage/mounts/{mountId}/validate` | `open:manage.mounts.write` | 校验挂载可用性 |
| `GET` | `/api/open/v1/manage/users` | `open:manage.users.read` | 管理端用户列表 |
| `PATCH` | `/api/open/v1/manage/users/{userId}/status` | `open:manage.users.write` | 更新用户状态 |

## 审计

后端会审计 Token 创建、使用、拒绝、过期和吊销。审计 detail 可以包含 request id、method、path、http status、token id、prefix、owner、required scope、granted scopes、user agent、IP 和 decision。

严禁任何实现把明文 Authorization、Cookie、query token 或请求体写入审计、前端日志或错误上报。
