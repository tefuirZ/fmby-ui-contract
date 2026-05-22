# Manage · Developer API

开发者 API 管理面用于管理第三方开放 API 的 endpoint catalog、API Token 和 Explorer。

所有接口都属于内部管理 API，要求 Cookie session、CSRF 和管理权限。它们不是第三方开放 API 本身。

## 端点

| Method | Path | 说明 |
|---|---|---|
| `GET` | `/api/manage/developer/endpoints` | 开放 API endpoint catalog |
| `GET` | `/api/manage/developer/subjects` | Token owner 选择器数据源 |
| `GET` | `/api/manage/developer/api-tokens` | Token 列表 |
| `POST` | `/api/manage/developer/api-tokens` | 创建 Token |
| `POST` | `/api/manage/developer/api-tokens/{tokenId}/revoke` | 吊销 Token |

## Endpoint Catalog

```http
GET /api/manage/developer/endpoints?page=1&page_size=20&q=&scope=&method=
```

Query：

| 参数 | 类型 | 说明 |
|---|---|---|
| `page` | int | 1-based 页码 |
| `page_size` | int | 每页数量 |
| `q` | string | 按 method、path、summary、required scope 搜索 |
| `scope` | string | 必须来自开放 API scope 集合 |
| `method` | string | `GET` / `POST` / `PUT` / `PATCH` / `DELETE` / `HEAD` |

响应：

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
    "forbidden_path_prefixes": ["/api/auth/", "/api/session", "/emby/", "/jellyfin/"],
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

前端必须以后端返回的 `scopes` 渲染 scope 选择器，并用后端分页结果渲染目录。不能一次性拉全量再本地筛选。

## Subject Lookup

```http
GET /api/manage/developer/subjects?q=robot&page=1&page_size=25&account_kind=service
```

Query：

| 参数 | 类型 | 说明 |
|---|---|---|
| `q` | string | 搜索用户名或显示名 |
| `page` | int | 1-based 页码 |
| `page_size` | int | 每页数量 |
| `account_kind` | string | `human` / `service`，可省略；也兼容 `accountKind` |

响应：

```json
{
  "items": [
    {
      "id": "u_service_abc",
      "username": "svc-transcoder",
      "display_name": "转码服务账号",
      "account_kind": "service"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 25
}
```

后端只返回可绑定的 Active human/service 主体。服务账号不能交互式登录。

## Token 列表

```http
GET /api/manage/developer/api-tokens
```

响应：

```json
{
  "items": [
    {
      "id": "tok_abc",
      "name": "internal-integration",
      "note": "optional note",
      "token_prefix": "fmby_xxx",
      "owner_user_id": "u_service_abc",
      "owner_username": "svc-transcoder",
      "owner_display_name": "转码服务账号",
      "owner_account_kind": "service",
      "created_by_user_id": "u_admin",
      "created_by_username": "admin",
      "scopes": ["open:browse.read"],
      "status": "Active",
      "expires_at": "2027-05-22T05:00:00Z",
      "last_used_at": null,
      "last_used_ip": null,
      "revoked_at": null,
      "revoked_by": null,
      "revoked_by_username": null,
      "revoked_reason": null,
      "created_at": "2026-05-22T05:00:00Z",
      "updated_at": "2026-05-22T05:00:00Z"
    }
  ]
}
```

状态合法值：

```text
Active
Expired
Revoked
```

## 创建 Token

```http
POST /api/manage/developer/api-tokens
Content-Type: application/json
X-CSRF-Token: <csrf>

{
  "owner_user_id": "u_service_abc",
  "name": "internal-integration",
  "note": "optional note",
  "scopes": ["open:browse.read"],
  "expires_at": null
}
```

请求规则：

1. `owner_user_id` 必填。
2. `scopes` 必填且非空。
3. `expires_at` 可为 `null` 或省略；省略时后端默认一年后过期。
4. 前端不得允许自由输入未知 scope。

响应：

```json
{
  "token": {
    "id": "tok_abc",
    "name": "internal-integration",
    "token_prefix": "fmby_xxx",
    "owner_user_id": "u_service_abc",
    "owner_username": "svc-transcoder",
    "owner_account_kind": "service",
    "scopes": ["open:browse.read"],
    "status": "Active"
  },
  "plaintext_token": "fmby_generated_secret"
}
```

`plaintext_token` 只显示一次。skin 不得写入持久存储，也不得放入 query cache。

## 吊销 Token

```http
POST /api/manage/developer/api-tokens/{tokenId}/revoke
Content-Type: application/json
X-CSRF-Token: <csrf>

{
  "reason": "权限收回"
}
```

吊销必须二次确认，并允许管理员填写原因。吊销后 Token 立即不能用于 Bearer 鉴权。

## 前端映射要求

1. raw DTO 只能出现在 domain API、raw types 和 mapper。
2. 页面只消费 camelCase domain type。
3. 未知 `status`、`account_kind`、`scope`、Explorer constraints 必须显式失败。
4. 后端 catalog 新增 scope 时，skin 的本地枚举、schema 和 mapper 必须同步。
5. `datetime-local` 输入按皮肤统一时区展示，提交前转换为 UTC ISO 字符串。
