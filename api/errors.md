# Errors

> fmby 一方 API 错误响应统一格式与错误码总表。

---

## 错误响应体

所有非 2xx 响应（除 streaming 端点外）body 形如扁平 `ApiErrorResponse`：

```json
{
  "code": "AUTH_REQUIRED",
  "message": "未登录或会话已过期",
  "hint": null,
  "retryable": false,
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | string | 稳定的机器识别码（当前为全大写 snake case），用于 i18n / 分支处理 |
| `message` | string | 人类可读短语（仅做 fallback，skin 应用 i18n 表替换） |
| `hint` | string \| null | 可选修复提示 |
| `retryable` | boolean | 后端判断该错误是否适合重试 |
| `traceId` | string | 后端追踪 ID，方便排障时给运维报 |

安装模式 `/api/install/*` 的错误体是一个兼容子集：`{ "code", "message", "retryable" }`，没有 `traceId`。

skin 错误处理推荐：

```ts
async function callApi<T>(...): Promise<T> {
  const res = await apiFetch(...);
  if (!res.ok) {
    const err = await res.json();
    throw new ApiError(err.code, err.message, res.status, err.retryable, err.traceId);
  }
  return res.json();
}

// 调用方
try {
  const lib = await callApi<Library>("/api/browse/libraries/lib_xyz");
} catch (e) {
  if (e instanceof ApiError && e.code === "VALID_ENTITY_NOT_FOUND") {
    showToast(t("errors.VALID_ENTITY_NOT_FOUND"));
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

当前主仓的通用错误码来自 `crates/fmby-common/src/error_code.rs`。不要依赖旧版 snake_case code。

### 通用 / 鉴权类

| code | HTTP | 含义 |
|---|---|---|
| `AUTH_REQUIRED` | 401 | 未登录、session 缺失或过期 |
| `PERM_DENIED` | 403 | 已登录但无对应 capability，或 CSRF 校验失败 |
| `VALID_FIELD_INVALID` | 400/422 | 请求参数或业务字段不合法 |
| `VALID_ENTITY_NOT_FOUND` | 404 | 资源不存在 |
| `SOURCE_UNREACHABLE` | 502/503 | 上游来源不可达 |
| `PLAYBACK_STREAM_UNAVAILABLE` | 502/503 | 播放流不可用 |
| `TASK_FAILED` | 500 | 任务执行失败 |
| `SYSTEM_DATABASE_ERROR` | 500 | 数据库错误 |
| `SYSTEM_INTERNAL` | 500 | 未分类内部错误 |
| `HTTP_INVALID_RESPONSE` | client | skin 客户端发现 `/api/*` 返回非 JSON 或 JSON 无法解析 |

安装模式 `/api/install/*` 另有 `INSTALL_BAD_REQUEST`、`INSTALL_CONFLICT`、`INSTALL_FORBIDDEN`、`INSTALL_INTERNAL_ERROR`，返回体是兼容子集。

---

## hint 字段约定（按 code）

只列举几个常见的，让 skin 知道怎么解析。

### `VALID_FIELD_INVALID`

```json
{
  "code": "VALID_FIELD_INVALID",
  "message": "field 'username' is required",
  "hint": null,
  "retryable": false,
  "traceId": "..."
}
```

### `SOURCE_UNREACHABLE`

```json
{
  "code": "SOURCE_UNREACHABLE",
  "message": "115 returned 401 unauthorized",
  "hint": null,
  "retryable": true,
  "traceId": "..."
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
      return error.retryable && failureCount < 3;
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
  "VALID_ENTITY_NOT_FOUND": "找不到该资源",
  "PERM_DENIED": "没有权限执行该操作",
  "AUTH_REQUIRED": "登录已过期，请重新登录",
  "SOURCE_UNREACHABLE": "远端来源暂时不可用",
  "unknown": "出错了，请稍后重试"
}
```

fallback 时显示 `errorCodes[code] ?? errorCodes.unknown`。

---

## 下一步

- [`domains/README.md`](./domains/README.md) — 各域端点详解
