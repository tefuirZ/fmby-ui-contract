# Authentication

> fmby 鉴权机制完整说明：登录、注册、CSRF、setup、session、注销。

---

## 鉴权模型

fmby 使用 **Cookie session** + **CSRF double-submit token** 模型：

- 用户名 / 密码登录 → 后端发两个 cookie：`fmby_session`（HttpOnly）+ `fmby_csrf`（skin 可读）
- 所有读操作只看 session cookie
- 所有写操作 = session cookie ∧ `X-CSRF-Token` header == `fmby_csrf` cookie
- session 有 TTL，过期后任何请求会被 `401 Unauthorized` 打回

---

## 端点速查

| 路径 | 方法 | 用途 |
|---|---|---|
| `/api/auth/setup/status` | GET | 站点是否已初始化（首次访问要先 setup） |
| `/api/auth/entry/status` | GET | 同上（别名，兼容老路径） |
| `/api/auth/setup` | POST | 首次创建 owner 账号 |
| `/api/auth/login` | POST | 登录 |
| `/api/auth/register` | POST | 用注册码注册新用户 |
| `/api/auth/logout` | DELETE | 注销当前会话 |
| `/api/auth/session` | GET | 查询当前会话信息（含用户、权限、过期时间） |
| `/api/session` | GET | `/api/auth/session` 的别名 |

---

## 1. 站点初始化（setup）

### 1.1 查询 setup 状态

```http
GET /api/auth/setup/status
```

响应：

```json
{
  "needs_setup": false,
  "site_name": "我的小媒体库"
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `needs_setup` | bool | 为 true 时尚未创建 owner，必须先去 `/setup` 页 |
| `site_name` | string | 站点名（用于登录页 title 等） |

### 1.2 完成 setup

```http
POST /api/auth/setup
Content-Type: application/json

{
  "username": "admin",
  "password": "...",
  "display_name": "管理员",
  "email": "admin@example.com"
}
```

成功响应：自动登录（同登录响应），并 set 两个 cookie。

错误：
- `409 already_setup` — 已经初始化过
- `422 weak_password` — 密码强度不足

---

## 2. 登录 / 注销

### 2.1 登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "secret123"
}
```

成功 200：

```json
{
  "user": {
    "id": "u_abc",
    "username": "alice",
    "display_name": "Alice",
    "roles": ["user"],
    "capabilities": ["browse", "playback"],
    "avatar_url": null
  },
  "expires_at": "2026-02-15T10:30:00Z"
}
```

`Set-Cookie` 头会带：
```
fmby_session=...; HttpOnly; SameSite=Lax; Path=/
fmby_csrf=...; SameSite=Lax; Path=/
```

错误：
- `401 invalid_credentials` — 用户名 / 密码错
- `403 account_disabled` — 账号被禁用
- `429 too_many_attempts` — 登录尝试过频

### 2.2 注销

```http
DELETE /api/auth/logout
X-CSRF-Token: {fmby_csrf}
```

成功：`204 No Content`，cookie 被服务器清除（`Set-Cookie: fmby_session=; Max-Age=0`）。

skin 端建议同时清自己的 in-memory state、跳到 `/login`。

---

## 3. 注册（带注册码）

```http
POST /api/auth/register
Content-Type: application/json

{
  "registration_code": "ABCD-EFGH-1234",
  "username": "bob",
  "password": "...",
  "display_name": "Bob"
}
```

成功响应同 `/login`（自动登录）。

错误：
- `404 invalid_registration_code` — 码不存在 / 已过期 / 已用满
- `409 username_taken` — 用户名重复
- `422 weak_password` — 密码弱

> 是否开放注册取决于 `bootstrap.features.registration_enabled`。skin 在登录页应根据这个 flag 决定是否显示"注册"按钮。

---

## 4. 查询当前会话

```http
GET /api/auth/session
```

未登录响应（200，但 user_id 为 null）：

```json
{
  "logged_in": false,
  "user": null,
  "expires_at": null
}
```

已登录响应：

```json
{
  "logged_in": true,
  "user": {
    "id": "u_abc",
    "username": "alice",
    "display_name": "Alice",
    "roles": ["user", "manager"],
    "capabilities": ["browse", "playback", "manage:access"],
    "avatar_url": null
  },
  "expires_at": "2026-02-15T10:30:00Z",
  "session": {
    "id": "sess_xyz",
    "issued_at": "2026-01-15T10:30:00Z",
    "user_agent_summary": "Chrome 130 / macOS"
  }
}
```

skin 通常在启动时调一次：

- ✅ 已登录 → 进入主界面
- ❌ 未登录 → 跳 `/login`
- 网络错误 → 离线模式或重试

---

## 5. CSRF

### 5.1 token 来源

登录 / setup / register 成功后，`Set-Cookie: fmby_csrf=...` 由后端发出。`fmby_csrf` 是非 HttpOnly cookie，skin 可读。

### 5.2 怎么发请求

任何写操作（POST / PUT / PATCH / DELETE）必须带：

```
X-CSRF-Token: {fmby_csrf 当前值}
```

GET / HEAD 请求**不**需要 CSRF token。

### 5.3 token 失效

如果 `fmby_csrf` cookie 不存在或与 header 不一致：

- `403 Forbidden`
- `error_code: csrf_missing` 或 `csrf_mismatch`

skin 应：

- 重新调 `/api/auth/session` 检查是否未登录
- 已登录但 token 缺失 → 提示用户刷新页面
- 不要尝试自己生成 / 伪造 CSRF token

### 5.4 axios / fetch 封装示例

```ts
// shared/api-client.ts
function getCsrfToken(): string {
  const name = window.__FMBY_BOOTSTRAP__.auth.csrf_cookie_name;
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + name + "=([^;]+)")
  );
  return match?.[2] ?? "";
}

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (!["GET", "HEAD"].includes(method)) {
    headers.set("X-CSRF-Token", getCsrfToken());
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(window.__FMBY_BOOTSTRAP__.api.base_url + path, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  if (res.status === 401) {
    window.location.href = "/login";
  }
  return res;
}
```

---

## 6. session 过期 / 续期

- session TTL 默认由后端 `ServerSessionPolicy.session_ttl_seconds` 决定（管理员可配）
- TTL 内的请求会**滑动续期**（每次请求自动延长）
- 长时间不操作 → session 过期 → 任意请求返回 `401 session_expired`

skin 应该：

- 监听 401 响应，全局拦截后跳 `/login`
- 不要在前端"假装"维护 session 状态——以后端为准

---

## 7. 多端 / 多会话

一个用户可同时在多个浏览器 / 设备登录。每个会话独立：

- 不同 `sess_*` ID
- `/api/manage/sessions` 可列出某用户全部 active sessions（管理员视角）
- `/api/auth/session` 只返回**当前请求**所属的 session

用户自己看自己的会话列表（计划中），目前用 `bootstrap.auth.user_id` 调 `/api/manage/sessions?user_id=...` 也行（需要 `manage:sessions:read` 权限）。

---

## 8. 角色 / Capability

`user.roles`：用户角色集合（如 `["user", "manager"]`），用于人类阅读。

`user.capabilities`：实际权限点（细粒度），用于 skin 决定显示哪些按钮 / 菜单。

常见 capability：

| Capability | 含义 |
|---|---|
| `browse` | 浏览媒体（默认所有用户都有） |
| `playback` | 播放媒体 |
| `manage:access` | 进入后台管理界面（最小门槛） |
| `manage:users` | 用户管理 |
| `manage:libraries` | 媒体库管理 |
| `manage:settings:server` | 服务器设置（含改 active_ui_skin） |
| `manage:audit_logs` | 看审计日志 |
| `manage:runtime_logs` | 看运行日志 |
| `manage:pan115` | 115 网盘管理 |
| `manage:imghost` | 图床工具 |

skin 实现 `<CapabilityGuard required="manage:access">` 模式：

```tsx
function CapabilityGuard({ required, children }) {
  const session = useSession();
  if (!session.user.capabilities.includes(required)) {
    return <Forbidden />;
  }
  return children;
}
```

---

## 9. 安全

skin 必须遵守：

- ✅ 不要把 password / token 存 localStorage
- ✅ 不要把 `fmby_csrf` cookie 上送给第三方域
- ✅ 表单提交后立即清空内存中的明文密码
- ❌ 不要 alert / console.log session 信息
- ❌ 不要在 URL 里带 token / password

后端会做：

- 密码 bcrypt / argon2 hash 存储
- 失败登录限流
- 审计日志（写入 `manage/audit-logs`）

---

## 下一步

- [`errors.md`](./errors.md) — 错误码全表
- [`domains/README.md`](./domains/README.md) — 各域端点详解
