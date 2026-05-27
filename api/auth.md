# Authentication

> fmby Web UI 使用 Cookie session + CSRF double-submit。不要在主题里实现 access token / refresh token 流程；Bearer token 只属于 `/api/open/v1/*` 开放 API。

---

## 鉴权模型

- 登录 / setup / 注册成功后，后端设置两个 Cookie：
  - `fmby_session`：HttpOnly，浏览器自动随同源请求带上。
  - `fmby_csrf`：非 HttpOnly，skin 读取后写入 `X-CSRF-Token`。
- GET / HEAD 只需要 session cookie。
- POST / PUT / PATCH / DELETE 必须带 `X-CSRF-Token`，并保持 `credentials: "same-origin"`。
- 建议所有 Web API 请求带 `X-Requested-With: FMBY-Web`。
- 当前用户真实权限看 `capabilities`，不要只看角色名。

---

## 端点速查

| 路径 | 方法 | 用途 |
|---|---|---|
| `/api/auth/entry/status` | GET | 登录入口状态：是否需要 setup、是否开放注册 |
| `/api/auth/setup/status` | GET | 同上，兼容别名 |
| `/api/auth/setup` | POST | 首次创建超级管理员并自动登录 |
| `/api/auth/login` | POST | 用户名密码登录 |
| `/api/auth/mfa/totp/verify` | POST | TOTP 登录二次验证 |
| `/api/auth/register` | POST | 使用注册码注册 |
| `/api/auth/logout` | DELETE | 注销当前会话并清 Cookie |
| `/api/auth/session` | GET | 当前会话用户 |
| `/api/session` | GET | 当前会话用户，当前 classic skin 使用该别名 |
| `/api/auth/mfa/totp` | GET | 当前用户 TOTP 状态 |
| `/api/auth/mfa/totp` | POST | 开始 TOTP enroll，返回 secret / otpauth_url |
| `/api/auth/mfa/totp/confirm` | POST | 确认 TOTP code，返回 recovery codes |
| `/api/auth/mfa/totp/recovery-codes` | POST | 用当前密码重置 recovery codes |
| `/api/auth/mfa/totp` | DELETE | 用当前密码关闭 TOTP |

---

## 登录入口状态

```http
GET /api/auth/entry/status
```

```json
{
  "needs_setup": false,
  "registration_enabled": true,
  "registration_requires_code": true
}
```

`needs_setup=true` 时渲染 `/install` 或首次管理员创建入口；不要继续展示普通登录表单。

---

## Setup

```http
POST /api/auth/setup
Content-Type: application/json

{
  "username": "admin",
  "password": "...",
  "display_name": "管理员"
}
```

成功响应：

```json
{
  "user": {
    "id": "u_xxx",
    "name": "admin",
    "display_name": "管理员",
    "roles": ["SuperAdmin"],
    "capabilities": ["manage:access"]
  }
}
```

响应会同时设置 `fmby_session` 与 `fmby_csrf`。

---

## 登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "secret123"
}
```

### 已认证

```json
{
  "status": "authenticated",
  "user": {
    "id": "u_abc",
    "name": "alice",
    "display_name": "Alice",
    "roles": ["User"],
    "capabilities": ["browse", "playback"]
  },
  "challenge_id": null,
  "expires_at": null
}
```

### 需要 TOTP

启用 TOTP 的账号不会立即下发 Cookie，而是返回 challenge：

```json
{
  "status": "mfa_required",
  "user": null,
  "challenge_id": "totp_challenge_xxx",
  "expires_at": "2026-05-27T10:30:00Z"
}
```

随后调用：

```http
POST /api/auth/mfa/totp/verify
Content-Type: application/json

{
  "challenge_id": "totp_challenge_xxx",
  "code": "123456"
}
```

成功响应同 setup 的 `{ "user": ... }`，并设置两个 Cookie。

---

## 注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "code": "ABCD-EFGH",
  "username": "bob",
  "password": "...",
  "display_name": "Bob"
}
```

响应：

```json
{
  "status": "authenticated",
  "message": "注册成功",
  "user": {
    "id": "u_bob",
    "name": "bob",
    "display_name": "Bob",
    "roles": ["User"],
    "capabilities": ["browse", "playback"]
  }
}
```

如果需要管理员审批：

```json
{
  "status": "pending_approval",
  "message": "账号已提交审核",
  "user": null
}
```

是否显示注册入口看 `GET /api/auth/entry/status` 或 `bootstrap.features.registration_enabled`。

---

## 当前会话

```http
GET /api/session
```

已登录响应：

```json
{
  "id": "u_abc",
  "name": "alice",
  "display_name": "Alice",
  "roles": ["User"],
  "capabilities": ["browse", "playback", "manage:access"]
}
```

未登录返回 `401` + `ApiErrorResponse`。`GET /api/session` 成功时还会刷新 `fmby_csrf` Cookie，客户端可以用它恢复丢失的 CSRF token。

---

## 注销

```http
DELETE /api/auth/logout
X-CSRF-Token: {fmby_csrf}
```

成功响应：

```json
{ "ok": true }
```

后端会清除 `fmby_session` 与 `fmby_csrf`。skin 端应同时清自己的 in-memory auth state，并跳转 `/login`。

---

## TOTP 管理

| 操作 | 请求 | 响应 |
|---|---|---|
| 查询状态 | `GET /api/auth/mfa/totp` | `{ enabled, pending_confirmation, recovery_codes_remaining }` |
| 开始 enroll | `POST /api/auth/mfa/totp` | `{ secret, otpauth_url }` |
| 确认 enroll | `POST /api/auth/mfa/totp/confirm` body `{ code }` | `{ enabled, pending_confirmation, recovery_codes_remaining, recovery_codes }` |
| 重置 recovery codes | `POST /api/auth/mfa/totp/recovery-codes` body `{ current_password }` | `{ recovery_codes, recovery_codes_remaining }` |
| 关闭 TOTP | `DELETE /api/auth/mfa/totp` body `{ current_password }` | TOTP 状态 |

这些都是已登录用户自己的安全设置；写操作仍需要 CSRF。

---

## Capability

`roles` 只适合展示；按钮、路由和管理面可见性必须看 `capabilities`。

常见 capability：

| Capability | 含义 |
|---|---|
| `browse` | 浏览媒体 |
| `playback` | 播放媒体 |
| `manage:access` | 进入后台管理界面 |
| `manage:users` | 用户管理 |
| `manage:libraries` | 媒体库管理 |
| `manage:mounts` | 挂载点 / 上游源 / Microsoft 授权管理 |
| `system:security` | 授权、许可证和安全类管理 |
| `manage:audit_logs` | 看审计日志 |
| `manage:runtime_logs` | 看运行日志 |
| `manage:pan115` | 115 网盘管理 |
| `manage:imghost` | 115 图床工具 |

管理路由统一用 `<CapabilityGuard required="manage:access">` 做入口保护，高危操作在页面内再按更细 capability 和接口返回做降级。

---

## 安全要求

- 不要把密码、Cookie、CSRF、OAuth token 写入 localStorage。
- 不要把 `fmby_csrf` 或任何管理 API 响应发送到第三方域。
- 不要在 URL query 中携带密码、token 或注册码。
- API 失败分支只看 `ApiErrorResponse.code`，不要解析 `message`。
- 401 全局跳 `/login?next=...`；403 渲染 forbidden 状态，不要静默 404。

---

## 下一步

- [`conventions.md`](./conventions.md) — 通用请求约定
- [`errors.md`](./errors.md) — 错误结构
- [`domains/site.md`](./domains/site.md) — bootstrap 字段
