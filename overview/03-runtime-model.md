# 03 - Runtime Model

> 详细说明 fmby 后端如何加载、注册、路由、切换 skin，以及给 skin 注入了什么。

---

## 启动时序

fmby-server 启动时围绕 skin 的关键步骤：

```
┌────────────────────────────────────────────────────────────────┐
│ 1. fmby-server 启动                                              │
└──────────────────────┬─────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. ThemeRegistry::scan() 扫描两个目录：                          │
│    - $FMBY_THEMES_DIR (默认 ./themes/, Docker 内 /app/themes/)  │
│    - $FMBY_DATA_DIR/themes/ (默认 ./data/themes/)               │
│    每个子目录尝试读 manifest.json，校验 contract_version        │
│    校验通过 → 注册                                               │
│    校验失败 → 记 warn 日志，跳过（不阻塞启动）                    │
└──────────────────────┬─────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. SettingsService 读 active_ui_skin                            │
│    - 如果该 skin 在 registry 里 → 设为 active                   │
│    - 如果不在（被删了 / 拼错） → fallback 到 "classic"          │
│    - 如果 classic 也没了 → fallback 到 registry 第一个          │
│    - 如果 registry 空 → 启动失败，提示运维（缺至少一个 skin）   │
└──────────────────────┬─────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. axum Router 组装：API + 静态资源 + fallback                  │
└──────────────────────┬─────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. 监听 :$PORT                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## 路由优先级

fmby-server 收到一个 HTTP 请求时，按下面顺序匹配：

| 优先级 | 路径 | 处理 |
|---|---|---|
| 1 | `/api/health` | 健康检查 |
| 2 | `/api/openapi.json` | utoipa 自动生成的 OpenAPI 3.1 spec |
| 3 | `/api/*` | API handler（auth / browse / items / playback / assets / settings / manage） |
| 4 | `/emby/*`, `/jellyfin/*` | 兼容层（**skin 不应触碰**） |
| 5 | `/_assets/{skin}/*` | 主题静态资源，路径相对该 skin 的 `dist/` |
| 6 | `/` 或 `/login`、`/manage/*`、`/settings/*` 等非 API 路径 | **fallback**：返回 active skin 的 `dist/index.html`（已注入 `window.__FMBY_BOOTSTRAP__`） |

**重要约定**：

- `/_assets/{skin}/` 前缀里的 `{skin}` 必须和 manifest 里的 `name` 一致
- vite build 时必须设置 `base: '/_assets/{skin-name}/'`，否则 `index.html` 引用 `/assets/...` 会被 fallback 到自己（无限循环）
- React Router / Vue Router 的 basename 是 `/`，不要设成 `/_assets/{skin-name}/`
- `/api` 与 `/api/*` 永远不走 SPA fallback；未命中时返回 JSON 404
- 详见 [`../skin-package/build-output.md`](../skin-package/build-output.md)

---

## Bootstrap 注入

每次返回 `index.html` 时，fmby 后端会在 `</head>` 之前插入一段 `<script>`，把站点级数据注入 `window.__FMBY_BOOTSTRAP__`：

```html
<head>
  ...
  <script>
    window.__FMBY_BOOTSTRAP__ = {
      "contract_version": "0.1.0",
      "fmby_version": "0.2.5",
      "active_skin": "classic",
      "site": {
        "site_name": "我的小媒体库",
        "homepage_message": "",
        "maintenance_banner": "",
        "support_contact": ""
      },
      "auth": {
        "csrf_cookie_name": "fmby_csrf",
        "session_cookie_name": "fmby_session",
        "csrf_header_name": "X-CSRF-Token",
        "logged_in": true,
        "user_id": "u_xxx",
        "username": "admin",
        "display_name": "管理员",
        "roles": ["SuperAdmin"],
        "capabilities": ["manage:access"]
      },
      "api": {
        "base_url": "/api"
      },
      "features": {
        "pan115_imghost_enabled": true,
        "pan115_provider_enabled": true,
        "registration_enabled": true
      },
      "install": {
        "required": false,
        "installed": true
      }
    };
  </script>
</head>
```

**字段说明**（完整 schema 见 [`../schemas/bootstrap.schema.json`](../schemas/bootstrap.schema.json)）：

| 字段 | 说明 |
|---|---|
| `contract_version` | 当前后端遵循的 contract 版本，skin 应据此判断兼容性 |
| `fmby_version` | 后端 Rust 二进制版本（仅诊断展示用） |
| `active_skin` | 当前激活的 skin 名（应该等于自己的 manifest name） |
| `site.*` | 站点级文案，从 `ServerGeneralSettings` 读 |
| `auth.csrf_cookie_name` 等 | cookie 和 header 名字（避免 skin 写死） |
| `auth.logged_in` | 当前请求**是否已登录**——未登录时 `user_id` 为 null，skin 应跳到 `/login` |
| `auth.user_id`, `username`, `display_name` | 登录用户的基本信息（更详细的信息走 `/api/session`） |
| `auth.roles` | 展示用角色 |
| `auth.capabilities` | UI 权限判断用 |
| `api.base_url` | API 基址，永远是 `/api`（同源） |
| `features.*` | 功能开关——某些功能要求后端有对应配置才显示（如 pan115 imghost） |
| `install.*` | 首次安装 / 恢复模式状态 |

skin 拿这份 bootstrap 的方式：

```ts
// 起手就读 window 注入
const bootstrap = (window as any).__FMBY_BOOTSTRAP__;
if (!bootstrap) {
  throw new Error("FMBY bootstrap missing — 是否被静态文件服务器直接 serve？");
}
```

> ⚠️ **不要在 dev 模式（vite dev）依赖 `__FMBY_BOOTSTRAP__`**——dev 服务器不会注入。开发时请用 `import.meta.env` 或 mock：
> ```ts
> const bootstrap = window.__FMBY_BOOTSTRAP__ ?? defaultDevBootstrap();
> ```

---

## 切换 active skin

管理员在后台改 `active_ui_skin` 设置（PUT `/api/settings/server/general` —— **见注**），后端会：

1. 写库（settings 表）
2. **不重启**：下次有人请求 `/`，路由 fallback 时会读最新的 `active_ui_skin`，即时生效
3. 已经在浏览器里跑着旧 skin 的用户，刷新页面才会换

> **注**：active_ui_skin 字段是 `ServerGeneralSettings` 的一部分，具体 PUT 端点和 payload 详见 [`../api/domains/settings.md`](../api/domains/settings.md)。

**切换不会做的事**：

- ❌ 不会清用户 cookie / session
- ❌ 不会清前端 localStorage / sessionStorage（每个 skin 应该用自己的 namespace 写，避免冲突）
- ❌ 不会通知正在线的用户（除非 skin 自己实现了 SSE 监听）

---

## 上传 / 卸载 skin

### 上传新 skin（运行时）

运维有两种方式给生产环境加 skin：

**方式 A：scp / docker cp 到 data/themes/ 目录**

```bash
# 假设 skin 包是 my-skin.zip（含 manifest.json + dist/）
unzip my-skin.zip -d /tmp/my-skin
docker cp /tmp/my-skin fmby:/app/data/themes/my-skin

# 让 fmby 重新扫描
docker restart fmby
```

**方式 B：管理后台上传 zip**（计划中）

skin 管理上传与运行时重扫 API 尚未进入当前一方契约；不要在第三方 skin 里依赖。

### 卸载 skin

直接删除 `data/themes/{skin-name}/` 目录即可。如果该 skin 是当前 active：

- fmby 启动 / 重扫时检测到 active 不存在 → fallback 到 classic
- 在线用户刷新会切到 fallback skin

**约束**：内置 skin（`themes/` 目录里、`COPY` 进镜像的）不能在运行时删除，要重新构建镜像。

---

## 缓存策略

fmby-server serve 静态资源时会发以下 header：

| 资源 | Cache-Control | 说明 |
|---|---|---|
| SPA HTML（`/`、`/manage/*` 等 fallback） | `no-store` | 不能缓存（要保证 bootstrap 注入是最新的） |
| `/_assets/{skin}/assets/*` 中带 hash 的文件 | `public, max-age=31536000, immutable` | vite 会给这些文件加 hash 后缀，永久缓存 |
| `/_assets/{skin}/*` 其它文件 | `public, max-age=300` | favicon / manifest 等非 hashed 文件短缓存 |
| `/api/*` | `no-store` | API 永不缓存（除非 handler 显式声明） |

skin 作者**不需要**为缓存做任何特殊处理，vite 默认配置已经生成 hashed assets。

---

## 错误处理

### 启动期错误

| 情况 | fmby 行为 |
|---|---|
| 某 skin 的 `manifest.json` 解析失败 | 记 warn 日志，跳过该 skin，继续启动 |
| 某 skin 的 `manifest.json` 字段缺失 / 类型错 | 同上 |
| 某 skin 的 `contract_version` 不兼容 | 同上（详见 `compatibility.md`） |
| `themes/` 和 `data/themes/` 都为空 | **启动失败**，日志提示运维至少需要一个 skin |
| `active_ui_skin` 指向的 skin 不存在 | 自动 fallback 到 classic，记 warn |

### 运行期错误

| 情况 | fmby 行为 |
|---|---|
| skin 的 `index.html` 文件被删了 | 返回 500，建议运维查 skin 完整性 |
| 用户访问 `/_assets/some-deleted-skin/...` | 404 |
| skin 内部 JS 异常 | 浏览器自己的事，fmby 不知道（建议 skin 接入 Sentry / Plausible / 自行记录） |

---

## 多 skin 共存的命名隔离

不同 skin 的资源都在自己的 `/_assets/{skin}/` 命名空间下，所以**不会互相覆盖**。

但 **localStorage / sessionStorage / cookie** 是同一个域共享的。skin 作者建议：

- localStorage key 全部加 namespace 前缀，例如 `myskin:player:lastVolume`
- 不要用纯字面 key（如 `volume`）
- 切换 skin 时，旧 skin 的 storage 不会被清——这通常没事，但如果会引起冲突，请在 `manifest.json` 的 `localStorage_keys` 字段声明你用的 key 集合（schema 提供）

---

## 下一步

- 看 **skin 包目录怎么组织**：[`../skin-package/README.md`](../skin-package/README.md)
- 看 **manifest.json 完整字段**：[`../skin-package/manifest.md`](../skin-package/manifest.md)
- 看 **vite 如何配 base path**：[`../skin-package/build-output.md`](../skin-package/build-output.md)
