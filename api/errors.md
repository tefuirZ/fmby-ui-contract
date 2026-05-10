# Errors

> fmby 一方 API 错误响应统一格式与错误码总表。

---

## 错误响应 envelope

所有非 2xx 响应（除 streaming 端点外）body 形如：

```json
{
  "error": {
    "code": "library_not_found",
    "message": "library lib_xyz does not exist",
    "details": null,
    "trace_id": "tr_abc123"
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `error.code` | string | 稳定的机器识别码（snake_case），用于 i18n / 分支处理 |
| `error.message` | string | 人类可读的英文短语（**仅做 fallback**，skin 应用 i18n 表替换） |
| `error.details` | object \| array \| null | 结构化补充信息，不同 code 含义不同 |
| `error.trace_id` | string | 后端 tracing span id，方便排障时给运维报 |

skin 错误处理推荐：

```ts
async function callApi<T>(...): Promise<T> {
  const res = await apiFetch(...);
  if (!res.ok) {
    const err = await res.json();
    throw new ApiError(err.error.code, err.error.message, err.error.details, res.status);
  }
  return res.json();
}

// 调用方
try {
  const lib = await callApi<Library>("/api/browse/libraries/lib_xyz");
} catch (e) {
  if (e instanceof ApiError && e.code === "library_not_found") {
    showToast(t("errors.library_not_found"));
  } else {
    showToast(t("errors.unknown"));
  }
}
```

---

## HTTP 状态码与含义

| 状态码 | 通用含义 | 是否应该重试 |
|---|---|---|
| 200 | 成功 | — |
| 201 | 创建成功 | — |
| 204 | 成功，无 body | — |
| 301 / 302 | 重定向（如 `/api/playback/items/{id}` redirect 到 CDN） | 客户端自动 follow |
| 400 | 请求格式错（JSON 解析失败 / 缺字段 / 类型错） | ❌ 改请求 |
| 401 | 未登录 / session 过期 | ❌ 跳 `/login` |
| 403 | 已登录但无权限 / CSRF 校验失败 | ❌ 提示用户 |
| 404 | 资源不存在 | ❌ |
| 409 | 冲突（如重名） | ❌ 改请求 |
| 410 | 资源已被删除 | ❌ |
| 413 | 请求 body 太大 | ❌ |
| 422 | 业务校验失败（值合法但语义错） | ❌ |
| 423 | 资源被锁 / 处理中 | ⚠️ 看 `Retry-After` |
| 429 | 速率限制（计划中） | ⚠️ 看 `Retry-After` |
| 500 | 服务端 bug | ⚠️ 偶发可重试 |
| 502 / 503 / 504 | 上游 / 服务不可用 | ✅ 指数退避重试 |

---

## 错误码（code）总表

按域分类。每条给出最常见的 HTTP 状态码、含义、details 字段补充（如有）。

### 通用 / 鉴权类

| code | HTTP | 含义 |
|---|---|---|
| `unauthorized` | 401 | 未登录 |
| `session_expired` | 401 | session 已过期 |
| `forbidden` | 403 | 已登录但无对应 capability |
| `csrf_missing` | 403 | 写请求漏带 `X-CSRF-Token` |
| `csrf_mismatch` | 403 | header 和 cookie 不一致 |
| `invalid_credentials` | 401 | 用户名密码错 |
| `account_disabled` | 403 | 账号被禁用 |
| `too_many_attempts` | 429 | 登录尝试过频 |
| `weak_password` | 422 | 密码强度不足 |
| `username_taken` | 409 | 用户名重复 |
| `invalid_registration_code` | 404 | 注册码错 / 失效 |
| `already_setup` | 409 | 站点已 setup 不能再次初始化 |

### 请求格式类

| code | HTTP | 含义 |
|---|---|---|
| `invalid_json` | 400 | body 不是合法 JSON |
| `missing_field` | 400 | 必填字段缺失（details: `{"field": "..."}`） |
| `invalid_type` | 400 | 字段类型错（details: `{"field": "...", "expected": "string"}`） |
| `invalid_value` | 422 | 字段值不在合法范围（details: `{"field": "...", "allowed": [...]}`） |
| `unknown_field` | 400 | 多余字段（严格模式时） |
| `payload_too_large` | 413 | 请求 body 超限 |

### 资源类

| code | HTTP | 含义 |
|---|---|---|
| `not_found` | 404 | 通用 not found |
| `library_not_found` | 404 | 媒体库不存在 |
| `item_not_found` | 404 | 媒体不存在 |
| `mount_not_found` | 404 | 挂载点不存在 |
| `user_not_found` | 404 | 用户不存在 |
| `session_not_found` | 404 | session 不存在 |
| `task_not_found` | 404 | task 不存在 |
| `provider_not_configured` | 422 | provider 未绑定凭据 |
| `mount_not_ready` | 422 | 挂载点未 ready（如 115 凭据失效） |

### 业务规则类

| code | HTTP | 含义 |
|---|---|---|
| `conflict` | 409 | 通用冲突 |
| `duplicate` | 409 | 重名 |
| `invalid_state` | 422 | 状态机不允许该操作（如已 resolved 的 review 再次 claim） |
| `quota_exceeded` | 422 | 配额满 |
| `dependency_missing` | 422 | 依赖资源缺失（如挂载点缺 provider 凭据） |
| `referer_blocked` | 422 | 远端禁用（图床镜像专用） |

### 服务端类

| code | HTTP | 含义 |
|---|---|---|
| `internal_error` | 500 | 后端 panic / unexpected |
| `service_unavailable` | 503 | 服务降级中（如 DB 连不上） |
| `timeout` | 504 | 上游超时 |
| `provider_error` | 502 | 上游 provider（如 115）报错（details: `{"provider": "pan115", "raw": "..."}`） |

---

## details 字段约定（按 code）

只列举几个常见的，让 skin 知道怎么解析。

### `missing_field` / `invalid_type` / `invalid_value`

```json
{
  "code": "missing_field",
  "message": "field 'username' is required",
  "details": { "field": "username" }
}
```

```json
{
  "code": "invalid_value",
  "message": "role must be one of [user, manager, owner]",
  "details": {
    "field": "role",
    "allowed": ["user", "manager", "owner"]
  }
}
```

### `provider_error`

```json
{
  "code": "provider_error",
  "message": "115 returned 401 unauthorized",
  "details": {
    "provider": "pan115",
    "upstream_status": 401,
    "raw": "{...}"
  }
}
```

### `quota_exceeded`

```json
{
  "code": "quota_exceeded",
  "message": "imghost storage quota exceeded",
  "details": {
    "scope": "imghost",
    "used": 1073741824,
    "limit": 1073741824
  }
}
```

---

## 重试

| 情况 | 是否重试 | 怎么做 |
|---|---|---|
| 网络错误（fetch reject） | ✅ | 指数退避，最多 3 次 |
| 5xx | ✅ | 指数退避，最多 3 次 |
| 503 / 504 + `Retry-After` | ✅ | 等待 `Retry-After` 秒 |
| 429 | ✅ | 等待 `Retry-After` 秒 |
| 423 | ⚠️ | 仅当用户明确触发（按钮）才重试 |
| 4xx（非 401/429） | ❌ | 提示用户改请求 |
| 401 | ❌ | 跳 `/login` |

推荐用 TanStack Query / SWR 的内置重试策略，配置：

```ts
{
  retry: (failureCount, error) => {
    if (error instanceof ApiError) {
      if (error.status >= 500) return failureCount < 3;
      return false;
    }
    return failureCount < 3;
  },
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
}
```

---

## i18n 错误消息

skin 应该有一份 `errorCodes.json`：

```json
{
  "library_not_found": "找不到该媒体库",
  "csrf_missing": "请刷新页面后重试",
  "session_expired": "登录已过期，请重新登录",
  "quota_exceeded": "已达配额上限",
  "unknown": "出错了，请稍后重试"
}
```

fallback 时显示 `errorCodes[code] ?? errorCodes.unknown`。

---

## 下一步

- [`domains/README.md`](./domains/README.md) — 各域端点详解
