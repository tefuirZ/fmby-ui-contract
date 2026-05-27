# Development · Getting Started

## 环境

- Node >= 20
- 包管理器：pnpm 推荐
- fmby 后端实例（本地 dev 或 staging）

## 1. 创建 skin 工程

当前合同仓不强制某个模板。最小工程建议：

```text
my-skin/
├── manifest.json
├── package.json
├── vite.config.ts
├── index.html
└── src/
```

## 2. 配置 dev proxy

`.env.development`：

```env
VITE_FMBY_BACKEND=http://127.0.0.1:18125
```

`vite.config.ts`：

```ts
server: {
  proxy: {
    "/api": {
      target: process.env.VITE_FMBY_BACKEND ?? "http://127.0.0.1:18125",
      changeOrigin: true,
    },
  },
}
```

前端代码始终请求 `/api/...`，不要请求跨域绝对地址。

## 3. 提供 dev bootstrap

Vite dev server 不会注入 `window.__FMBY_BOOTSTRAP__`。开发期可先请求 `/api/site/bootstrap`，失败时使用 mock：

```ts
const bootstrap =
  window.__FMBY_BOOTSTRAP__ ??
  (await fetch("/api/site/bootstrap", { credentials: "same-origin" }).then((r) => r.json()));
```

## 4. 写 manifest

参考 [`../schemas/manifest.schema.json`](../schemas/manifest.schema.json)：

```json
{
  "contract_version": "0.1.0",
  "name": "my-skin",
  "display_name": "My Skin",
  "version": "0.1.0",
  "description": "A custom FMBY skin.",
  "author": { "name": "Your Team" },
  "license": "MIT",
  "entry": "dist/index.html",
  "capabilities": ["auth", "browse", "playback", "assets", "settings", "manage"],
  "localStorage_keys": ["my-skin:"],
  "min_fmby_version": "0.2.0"
}
```

## 5. 构建

生产构建必须满足：

- Vite `base` = `/_assets/{manifest.name}/`
- Router basename = `/`
- 入口文件 = `dist/index.html`
- `dist/index.html` 包含 `</head>`

详见 [`../skin-package/build-output.md`](../skin-package/build-output.md)。

## 6. 本地验证

最小 smoke：

1. `/api/site/bootstrap` 返回 JSON。
2. `/api/does-not-exist` 返回 JSON 404，不返回 HTML。
3. `/login` 能登录并设置 `fmby_session` / `fmby_csrf`。
4. 一个写操作带 `X-CSRF-Token` 后成功。
5. 深链刷新 `/manage`、`/item/{id}` 返回 SPA HTML。

## 常见坑

- `Unexpected token '<'`：`/api/*` 被代理到了前端 HTML，修 dev proxy 或重启后端。
- 401：Cookie session 失效，跳 `/login?next=...`，不要调 refresh token。
- CSRF 403：先调 `/api/session` 刷新 csrf cookie；仍失败则让用户刷新页面。
- 静态资源 404：检查 Vite `base`，不是 router basename。
