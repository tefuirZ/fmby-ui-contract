# Development · API Client

## 必备能力

1. **统一 fetch 封装**：base URL / Authorization / JSON 解析 / 错误归一
2. **token 自动刷新**：401 时调 refresh，原请求自动重放
3. **错误归一**：把后端 `{ error: { code, message, ... } }` 转成 Error 子类
4. **取消**：路由切换时取消未完成请求（AbortController）
5. **缓存**：用 React Query / SWR / TanStack Query 等

## 示例（伪 TS）

```ts
import { z } from 'zod';

class ApiError extends Error {
  constructor(public code: string, message: string, public fields?: Record<string,string>) {
    super(message);
  }
}

let accessToken: string | null = localStorage.getItem('access_token');
let refreshToken: string | null = localStorage.getItem('refresh_token');

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Content-Type', 'application/json');

  let res = await fetch(`/api${path}`, { ...init, headers });

  if (res.status === 401 && refreshToken) {
    const r = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (r.ok) {
      const data = await r.json();
      accessToken = data.data.access_token;
      refreshToken = data.data.refresh_token;
      localStorage.setItem('access_token', accessToken!);
      localStorage.setItem('refresh_token', refreshToken!);
      headers.set('Authorization', `Bearer ${accessToken}`);
      res = await fetch(`/api${path}`, { ...init, headers });
    } else {
      // refresh failed -> redirect to login
      location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
      throw new ApiError('unauthorized', 'session expired');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error?.code ?? 'unknown', body.error?.message ?? res.statusText, body.error?.fields);
  }

  return res.json() as Promise<T>;
}
```

## 长轮询（pan115 扫码）

用 self-rescheduling setTimeout，**不要** setInterval：

```ts
const terminalStatuses = new Set(['signed', 'expired', 'canceled', 'aborted']);

function pollPan115QrStatus(sessionId: string) {
  request(`/manage/pan115/qr-status?session_id=${encodeURIComponent(sessionId)}`).then(r => {
    if (r.data.status === 'signed') { /* create preview or activate */ return; }
    if (terminalStatuses.has(r.data.status)) { /* show retry */ return; }
    setTimeout(() => pollPan115QrStatus(sessionId), 2000);
  }).catch(e => {
    if (e.code === 'request_timeout') setTimeout(() => pollPan115QrStatus(sessionId), 1000); // 容错
    else { /* show error */ }
  });
}
```

同一个轮询组件可复用到三条 115 扫码线，但 endpoint 必须按场景切换：

| 场景 | 状态端点 | 成功后动作 |
|---|---|---|
| 我的 115 网盘创建态 | `/manage/pan115/qr-status?session_id=` | `POST /manage/pan115/previews`，再 browse 选目录 `cid` |
| 115 分享创建态 Cookie 预览 | `/manage/pan115/share-download-preview/qr-status?session_id=` | `POST /manage/pan115/share-download-preview/create`，创建 mount 后 activate |
| 已有 115 分享数据源绑定 Cookie | `/manage/pan115/share-mounts/{mountId}/qr-status?session_id=` | `POST /manage/pan115/share-mounts/{mountId}/activate` |
| 115 图床凭据 | `/manage/pan115/imghost/qr-status?session_id=` | `POST /manage/pan115/imghost/activate` |

## 文件上传

multipart 走原生 FormData；显示进度用 XHR + onprogress（fetch 不支持 upload progress）。

## SSE / WebSocket

当前 fmby 不强依赖；任务中心轮询足够。如未来引入 SSE，会在 [api/conventions.md] 加端点说明。
