# Development · API Client

## 必备能力

1. **同源相对路径限制**：只允许 `/api/...`，拒绝绝对 URL、协议相对 URL、反斜杠和控制字符。
2. **Cookie session**：请求使用 `credentials: "same-origin"`，不要实现 access token / refresh token。
3. **CSRF**：POST / PUT / PATCH / DELETE 自动读取 `fmby_csrf` 并写入 `X-CSRF-Token`。
4. **请求标识**：所有 Web API 请求带 `X-Requested-With: FMBY-Web`。
5. **JSON 校验**：2xx 和非 2xx JSON API 都要校验 `Content-Type`；`/api/*` 返回 HTML 必须视为契约错误。
6. **错误归一**：把后端 `ApiErrorResponse` 映射为前端 `ApiError`。
7. **取消与超时**：路由切换时取消未完成请求，普通请求建议 30 秒超时。
8. **缓存**：用 TanStack Query / SWR 等统一 query key，不要散落裸 fetch。

## 示例（精简 TS）

```ts
interface ApiError {
  code: string;
  message: string;
  hint?: string;
  retryable: boolean;
  traceId?: string;
  status?: number;
}

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]+)"));
  return match?.[2] ?? "";
}

function buildUrl(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
    throw new Error("API client only accepts same-origin relative paths");
  }
  return new URL(path, window.location.origin).toString();
}

function isJson(contentType: string): boolean {
  const value = contentType.toLowerCase();
  return value.includes("application/json") || value.includes("+json");
}

async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!isJson(contentType)) {
    const path = new URL(response.url).pathname;
    throw {
      code: "HTTP_INVALID_RESPONSE",
      message: path.startsWith("/api/")
        ? `API 请求 ${path} 返回了非 JSON 响应，请检查后端进程和 /api 代理`
        : "服务端返回了非 JSON 响应",
      retryable: false,
      status: response.status,
    } satisfies ApiError;
  }
  return response.json() as Promise<T>;
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  headers.set("X-Requested-With", "FMBY-Web");
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (unsafeMethods.has(method) && !headers.has("X-CSRF-Token")) {
    const csrfName = window.__FMBY_BOOTSTRAP__?.auth?.csrf_cookie_name ?? "fmby_csrf";
    const csrf = readCookie(csrfName);
    if (csrf) headers.set("X-CSRF-Token", csrf);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    method,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    const error = await parseJson<ApiError>(response);
    error.status = response.status;
    if (response.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
    }
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return parseJson<T>(response);
}
```

## 长轮询（pan115 / license）

用 self-rescheduling `setTimeout`，不要 `setInterval`：

```ts
async function pollUntilDone<T>(
  run: () => Promise<T>,
  isDone: (value: T) => boolean,
  delayMs: number,
): Promise<T> {
  const value = await run();
  if (isDone(value)) return value;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return pollUntilDone(run, isDone, delayMs);
}
```

## 文件上传

multipart 走原生 `FormData`；不要手动设置 `Content-Type`。显示上传进度用 XHR + `upload.onprogress`，fetch 没有标准 upload progress。

## SSE / WebSocket

普通浏览主题不依赖 SSE / WebSocket；任务中心、license 设备码、115 扫码仍可用轮询实现。

管理端运营看板使用第一方同源 WebSocket：

```ts
function buildOperationsRealtimeWsUrl(): string {
  const url = new URL("/api/playback/realtime/ws", window.location.origin);
  url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("scope", "admin");
  return url.toString();
}
```

约束：

1. WS URL 必须从 `window.location.origin` 派生，不接受外部绝对地址、协议相对 URL、反斜杠或控制字符。
2. `scope=admin` 只是订阅范围，不是认证材料。
3. 第一方 WS 只使用同源 Cookie session + Origin 校验；不要在 query、header 或 Web Storage 中传 `token`、`api_key`、Bearer。
4. 连接断开、浏览器不支持或消息解析失败时，UI 进入 `degraded` / `disabled`，保留 HTTP fallback。
5. 重连使用退避策略；不要每个 WS 连接直接轮询 PG。
6. 不把 realtime envelope、session id、用户 id、client info、token、URL 或连接状态写入 localStorage / sessionStorage / IndexedDB。
7. 兼容入口 `/embywebsocket`、`/jellyfinwebsocket` 的 `api_key` 语义不得复用到第一方 `/api/playback/realtime/ws`。
