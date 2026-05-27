# Conventions

> fmby 一方 API 的通用约定。所有域的 API 都满足下面这些规则。

---

## URL

- 所有一方 API 都以 `/api/` 开头
- skin 端请求必须是同源相对路径：`/api/...`。不要传 `http://`、`https://`、`//host` 或含反斜杠的 URL 给 API client
- `window.__FMBY_BOOTSTRAP__.api.base_url` 当前固定为 `/api`；如果封装接受完整路径，直接传 `/api/auth/session` 这类路径即可
- `/api` 和 `/api/*` 未命中时必须返回 JSON 404，不能返回 SPA `index.html`
- 路径段使用 `kebab-case`：`/api/manage/registration-codes`、`/api/manage/task-center/overview`
- 路径参数使用 `{camelCase}`：`/api/items/{itemId}`、`/api/manage/users/{userId}`
- 查询参数使用 `snake_case`（与后端 Rust 风格一致）：`?page_size=20&order_by=updated_at`

---

## HTTP 方法

| 方法 | 语义 |
|---|---|
| `GET` | 读取，幂等，可缓存（除非显式 `Cache-Control: no-store`） |
| `POST` | 创建 / 触发动作（如 `scan`, `claim`, `qr-login`） |
| `PUT` | 整体替换（如 `/api/settings/server/general`） |
| `PATCH` | 部分更新（如 `/api/manage/users/{id}/status`） |
| `DELETE` | 删除 |
| `HEAD` | 读元信息（仅 `/api/assets/streams/{sourceId}`） |

---

## 请求 / 响应 Body

- Content-Type: `application/json; charset=utf-8`（除 streaming 端点）
- 所有 JSON 字段使用 `snake_case`
- 错误响应也是 JSON，结构见 [`errors.md`](./errors.md)
- 空响应体：用 HTTP `204 No Content`，不要返回空对象 `{}`
- 成功响应直接返回 DTO，不包 `{ "data": ... }`
- 大对象优先用嵌套结构，不展开

例：

```json
{
  "id": "item_abc",
  "title": "黑客帝国",
  "library": {
    "id": "lib_001",
    "name": "电影"
  },
  "created_at": "2026-01-15T10:30:00Z"
}
```

---

## 时间

所有时间字段：

- 字段名后缀 `_at`（如 `created_at`、`updated_at`、`completed_at`）
- 类型：ISO 8601 字符串，**始终是 UTC**（带 `Z` 后缀）
- 例：`"2026-01-15T10:30:00Z"`、`"2026-01-15T10:30:00.123Z"`

skin 在前端展示时自行做 timezone 转换（推荐用 `date-fns-tz` 或 `dayjs` 的 `utc` 插件）。

用户可见时间、管理日志和运营统计默认展示时区为 `Asia/Shanghai`。后端存储 / 传输仍使用 UTC ISO 字符串；趋势接口会额外返回 `timezone: "Asia/Shanghai"` 与 `YYYY-MM-DD` 日期键。

---

## ID

- ID 永远是字符串
- 通常使用前缀 + 短 hash 形式：`u_abc123`（user）、`item_xyz789`、`lib_001`、`mount_def`
- skin 不应解析 ID 内部结构（前缀只是惯例，不是契约）
- ID 的字符集：`[A-Za-z0-9_-]`

---

## 分页

支持分页的端点统一使用 query 参数：

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `page` | int | 1 | 1-based 页码 |
| `page_size` | int | 20 | 每页数量，最大 100 |

响应统一结构：

```json
{
  "items": [ /* ... */ ],
  "page": 1,
  "page_size": 20,
  "total": 153,
  "total_pages": 8
}
```

少数端点采用 cursor 分页（如 logs、history）：

| 参数 | 类型 | 说明 |
|---|---|---|
| `cursor` | string | 上一页返回的 `next_cursor` |
| `limit` | int | 每页数量，最大 100 |

响应：

```json
{
  "items": [ /* ... */ ],
  "next_cursor": "eyJ0aW1lIjoiMjAyNi0wMS0xNVQxMDozMFoifQ",
  "has_more": true
}
```

具体哪个端点用哪种，见各 domain 文档。

---

## 排序 / 过滤

支持时统一用 query 参数：

```
?order_by=updated_at&order=desc&q=keyword&library_id=lib_001
```

- `order_by` 字段：每个端点单独定义白名单
- `order`: `asc` / `desc`，默认按 `order_by` 字段语义
- 文本搜索：`q`（全文搜索 / 模糊匹配，由后端实现决定）
- 过滤参数命名：尽量与字段同名（`library_id`、`status`、`role`）

---

## CSRF & Cookies

### Cookies

| Cookie | 设置方 | HttpOnly | Skin 是否可读 | 用途 |
|---|---|---|---|---|
| `fmby_session` | 后端登录时设置 | ✅ | ❌ | 服务器 session |
| `fmby_csrf` | 后端登录时设置 | ❌ | ✅ | CSRF token，skin 取值后回填 header |

> Cookie 名字可能在 `bootstrap.auth.csrf_cookie_name` / `auth.session_cookie_name` 中提供。**强烈建议从 bootstrap 读，不要写死**——后续可能会改名。

### CSRF token 怎么用

写操作（POST / PUT / PATCH / DELETE）必须带 header：

```
X-CSRF-Token: {fmby_csrf cookie 的值}
```

JavaScript 取 cookie 的 helper：

```ts
function getCookie(name: string): string {
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + name + "=([^;]+)")
  );
  return match?.[2] ?? "";
}

const csrf = getCookie(window.__FMBY_BOOTSTRAP__.auth.csrf_cookie_name);

await fetch("/api/playback/sessions", {
  method: "POST",
  credentials: "same-origin",
headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrf,
    "X-Requested-With": "FMBY-Web",
  },
  body: JSON.stringify({ /* ... */ }),
});
```

**漏带 CSRF token 的写操作**：返回 `403 Forbidden` + 扁平 `ApiErrorResponse.code`（当前后端通常是 `PERM_DENIED`，未来可能细化为 CSRF 专用码）。

GET 请求**不**校验 CSRF。

详见 [`auth.md`](./auth.md#csrf)。

---

## 幂等性

- `GET` / `HEAD` / `PUT` / `DELETE`：天然幂等（多次调用结果相同）
- `POST`：默认非幂等。少数端点支持 `Idempotency-Key` header（如 task 触发），具体看域文档
- `PATCH`：部分更新，看实现

skin 实现重试策略时：

- ✅ 安全重试：GET / HEAD / 4xx 部分（按错误码判断）
- ⚠️ 谨慎重试：5xx（先看错误码是不是 `service_unavailable`）
- ❌ 不要重试：401 / 403 / 422

详见 [`errors.md`](./errors.md#重试)。

---

## 速率限制（计划中）

当前 Web API 暂未把限流响应头作为稳定契约。后续如启用，会在响应头加：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1735689600
```

429 响应时带 `Retry-After` header（秒数）。

---

## 国际化

当前所有 API 响应字段值保持数据原貌。错误消息可能是中文或英文，skin 不应依赖 message 做分支。

skin 负责自己的 i18n（用 `code` 做 key，自己映射成本地化文案）。

bootstrap 暂不提供用户语言偏好（计划在用户 settings 里加）。

---

## 字符编码

- 所有响应：UTF-8
- 路径中的中文：必须 percent-encode（`encodeURIComponent`）
- Header：仅 ASCII（如有需要传中文，base64 编码）

---

## 大文件 / streaming

`/api/assets/streams/{sourceId}` 是 streaming 端点（视频流）：

- Content-Type: `video/*` 或 `application/octet-stream`
- 支持 `Range` header（resumable / seek）
- HEAD 请求返回 Content-Length / Accept-Ranges 但 body 为空
- 不要把整个流加载到内存

详见 [`domains/assets.md`](./domains/assets.md)。

---

## 一致性 / 缓存

- 默认所有 `/api/*` 响应带 `Cache-Control: no-store`
- 少数静态字典型端点（如 role-templates 列表）可能带 `max-age=60`，看具体响应头
- skin 自己的缓存层（TanStack Query / SWR）应基于 ETag / 业务字段判断，不依赖 HTTP 缓存

## 客户端响应校验

普通 JSON API 的 2xx 响应也必须是 JSON。skin 的 API client 应校验 `Content-Type`：

- `application/json` 或 `+json`：解析 JSON
- `204 No Content`：返回空值
- `/api/*` 返回 `text/html`：视为后端 / dev proxy 配置错误，显示可诊断错误，不要继续 `response.json()`

这条约束用于避免 `/api` 代理被错误指向前端页面时出现 `Unexpected token '<'`。

---

## 下一步

- [`auth.md`](./auth.md) — 鉴权细节
- [`errors.md`](./errors.md) — 错误处理
- [`domains/README.md`](./domains/README.md) — 端点详解
