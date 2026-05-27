# 02 - Architecture

> 20 分钟搞清楚 FMBY 多主题加载器的整体架构、部署形态和安全边界。

---

## 整体拓扑

下面是 FMBY 在 **生产环境**（容器 + 反代）下的请求流：

```
┌─────────────────┐      HTTPS / HTTP3
│ 终端用户浏览器   │ ─────────────────────────┐
└─────────────────┘                          │
                                              ▼
                              ┌──────────────────────────────┐
                              │ Caddy (反代 / TLS / HTTP/3)   │
                              │  - Let's Encrypt 自动续期     │
                              │  - 强制 HTTPS                 │
                              │  - 静态资源 gzip / brotli      │
                              └──────────────┬───────────────┘
                                              │ HTTP / 单端口
                                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ fmby-server  (单二进制, axum, 监听 :18098)                             │
│                                                                       │
│  ┌────────────────────┐   ┌────────────────────┐                      │
│  │  /api/* 路由       │   │  /_assets/{skin}/*  │                      │
│  │  - site / install  │   │   ServeDir(per-skin)│                      │
│  │  - auth / browse   │   └────────────────────┘                      │
│  │  - items           │   ┌────────────────────┐                      │
│  │  - playback        │   │  /api/openapi.json │                      │
│  │  - assets          │   │   (utoipa 生成)    │                      │
│  │  - settings        │   └────────────────────┘                      │
│  │  - manage/*        │   ┌────────────────────┐                      │
│  └────────────────────┘   │  /* (fallback)     │                      │
│                            │   返回 active skin │                      │
│                            │   index.html       │                      │
│                            └────────────────────┘                      │
│                                                                       │
│  ┌────────────────────────────────────────────┐                      │
│  │  ThemeRegistry (in-memory, 启动时扫描)      │                      │
│  │   - /app/themes/* (内置, 镜像 COPY)         │                      │
│  │   - /app/data/themes/* (运行时上传)         │                      │
│  └────────────────────────────────────────────┘                      │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┬─────────────────────┐
        ▼                 ▼                     ▼
   ┌─────────┐       ┌────────┐         ┌─────────────┐
   │ Postgres│       │ Redis  │         │ 后端存储     │
   │ (主数据)│       │ (缓存) │         │ (本地 / 115  │
   └─────────┘       └────────┘         │  / WebDAV)  │
                                         └─────────────┘
```

**关键点**：

- ✅ **单端口** 出去（fmby-server 同时 serve API + 静态资源），同源——零 CORS 问题
- ✅ **反代外置**：Caddy 在容器外或 sidecar 里，TLS / 缓存 / HTTP/3 全归它
- ✅ **skin 资源外置**：`themes/` 和 `data/themes/` 是磁盘目录，不打进 binary（运维可独立替换）
- ✅ **后端可单跑**：开发期 Caddy 可跳过，浏览器直连 `:18098` 也能工作

---

## 设计哲学

### 1. 单二进制 + 外置资源

fmby-server 编译产物是**单个可执行文件**，没有任何运行时依赖（除了 Postgres / Redis）。

skin 资源**不打进 binary**，而是独立的目录。这样做的好处：

| 收益 | 说明 |
|---|---|
| 运维替换 skin 不需要重新发布后端 | 改文件 + 改下拉菜单即可 |
| 第三方上传新 skin 无需触碰 fmby 镜像 | 走 `data/themes/` 目录 |
| 加载逻辑统一 | 内置 / 上传都是 "扫目录 → 注册"，没有特殊路径 |
| Docker 分发简单 | `COPY themes/* /app/themes/`，多主题打到一个镜像 |

### 2. 单端口架构

为什么不分 API 端口和静态资源端口？

- **CORS 噩梦**：分端口意味着前端需要配置 CORS、后端要发 `Access-Control-*`、cookie 要 `SameSite=None`，部署一旦换域名 / 换端口又得改。
- **反代复杂度**：Caddy 要写两套 upstream，子路径转发容易踩坑。
- **零附加价值**：fmby-server 的 ServeDir 性能完全够用（reqwest / hyper benchmark 显示 axum + tower-http ServeDir 在 SSD 上每秒 5w+ 静态请求）。

所以**容器内 fmby-server 永远只占一个端口**，反代前置加 TLS 即可。

### 3. 反代用 Caddy（非 nginx）

| 维度 | Caddy | nginx |
|---|---|---|
| 自动 TLS | ✅ 内置 Let's Encrypt | ⚠️ 要装 certbot 配 cron |
| HTTP/3 | ✅ 内置 | ⚠️ 实验性，需重编译 |
| 配置语法 | ✅ Caddyfile 5 行能跑 | ⚠️ 文档过期、配错容易 |
| 静态资源 | ✅ 默认开 brotli | ⚠️ 需手动加 module |

最小 Caddyfile 示例：

```caddy
fmby.example.com {
    encode gzip zstd
    reverse_proxy fmby-server:18098
}
```

就 3 行——TLS、HTTP/3、压缩、反代全有了。

### 4. classic 是参考实现，不是强制规范

仓库内置的 `classic` skin（即 fmby 主仓 `apps/web/`）是 **reference implementation**——它实现了 100% 功能清单，可以作为：

- ✅ 学习样本（看 React + TanStack Query + Radix UI 怎么接 fmby API）
- ✅ 抄写底座（fork 后改样式 / 改组件库）
- ✅ 验收基准（你的 skin 至少要做到 classic 的功能覆盖度）

但它**不是**：

- ❌ 唯一正确的实现方式
- ❌ 必须使用 React 的依据（你完全可以用 Vue / Solid / 原生 JS）
- ❌ 设计风格的标准（classic 偏 Plex 风，不代表后续 skin 必须类似）

---

## 安全边界

skin 跑在浏览器里、和后端 API 是同源关系。下面这张表定义了 **skin 能做什么 / 不能做什么**：

| 能力 | 允许 | 禁止 |
|---|---|---|
| 读 fmby API（公开 / 鉴权后） | ✅ 全部端点都开放给 skin | — |
| 操作 cookie session | ✅ 浏览器自动管理 | ❌ 不允许伪造 / 篡改 session token |
| 读 CSRF token | ✅ 通过 `fmby_csrf` cookie | ❌ 不允许把 token 上送给第三方 |
| 调 `/emby/*` 兼容层 | ⚠️ **不建议**（兼容层 DTO 不稳定） | ❌ 不要把它当一方 API 用 |
| 调 `/jellyfin/*` 兼容层 | ⚠️ 同上 | ❌ 同上 |
| 直接访问数据库 | — | ❌ 完全禁止（skin 跑在浏览器里也访问不到） |
| 读 fmby 进程文件系统 | — | ❌ 浏览器不可能做到 |
| 上传任意文件到服务器 | ✅ 仅通过 fmby 提供的上传端点（如 `/api/manage/pan115/imghost/upload`） | ❌ 不要直接 POST 到第三方服务（CSP 限制） |
| 加载第三方 JS / 字体 / CDN | ⚠️ 可以但**不推荐**（生产可能没外网） | ❌ 不要依赖 CDN 才能跑 |
| 调用 `window.opener` / 跳第三方域 | ⚠️ 可以但要清理 referrer | ❌ 不要劫持 fmby 用户身份去第三方 |

**Content Security Policy（计划中）**：fmby 后端会给 `index.html` 自动注入 CSP 头，禁止 inline script、限制资源源。skin 必须通过 vite 正常 build 过 CSP 检查（不能在 HTML 里写 `<script>...</script>`）。

---

## 三方关系图

skin 作者只和 **API + bootstrap 注入** 打交道。后端的兼容层、内部 service、Postgres / Redis、provider 抽象，对 skin 完全不可见。

```
┌──────────────────────────────────────────────────────────┐
│                    skin (浏览器内)                         │
│   - 路由 / 组件 / 交互                                     │
│   - 状态管理 / 缓存                                        │
│   - 调用 fetch / axios                                     │
└─────────────────┬───────────────────┬───────────────────┘
                  │                   │
                  ▼                   ▼
       ┌──────────────────┐    ┌──────────────────┐
       │ /api/* 一方契约   │    │ window.__FMBY_    │
       │                  │    │ BOOTSTRAP__       │
       │ (本仓库 api/ 定义) │    │ bootstrap (一次性) │
       └──────────────────┘    └──────────────────┘
                  │
                  ▼
       ┌──────────────────────────────────────────┐
       │ fmby-api 路由层 (axum handlers)          │
       └──────────────────────────────────────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
┌─────────────┐       ┌────────────────────────┐
│ service 层   │       │ fmby-compat (Emby/Jelly)│
│ (业务逻辑)   │       │   ❌ skin 不应碰         │
└─────────────┘       └────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ repo / domain / db / storage / provider       │
│   ❌ 全部对 skin 不可见                         │
└──────────────────────────────────────────────┘
```

---

## 部署形态

### 形态 A：单容器（推荐生产）

```
┌──────────────────┐     ┌────────────────────────┐
│ Caddy 容器        │ ─→  │ fmby-server 容器        │
│  - 80 / 443      │     │  - 18098                │
│  - TLS           │     │  - /app/themes/* (内置) │
└──────────────────┘     │  - /app/data/themes/    │
                          │    (volume 挂载)         │
                          └────────────┬───────────┘
                                       │
                          ┌────────────┴───────────┐
                          ▼                        ▼
                     ┌─────────┐              ┌────────┐
                     │ Postgres│              │ Redis  │
                     └─────────┘              └────────┘
```

`docker-compose.yml` 关键节选：

```yaml
services:
  caddy:
    image: caddy:2
    ports: ["443:443", "80:80"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on: [fmby]

  fmby:
    image: fmby:latest          # 内含 themes/{classic, modern}/
    expose: ["18098"]            # 不直接暴露
    volumes:
      - fmby_data:/app/data      # 含 data/themes/ (运行时上传 skin)
      - ./fmby.env:/app/.env
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16
    volumes: [pg_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
```

### 形态 B：bare metal / 单机调试

```
本机 18098 端口  ←── 浏览器直连（开发期可跳过 Caddy）
```

开发期可以直接 `cargo run -p fmby-server` 起后端，浏览器访问 `http://localhost:18098` 就能看到 active skin。

### 形态 C：开发期前后端分离（vite dev）

```
┌────────────────┐         ┌──────────────────┐
│ vite dev :5180 │ ──────→ │ fmby-server :18098│
└────────────────┘  proxy  └──────────────────┘
       ▲
       │
   浏览器直连
```

这是 fmby 主仓 `apps/web/` 当前的开发方式。vite dev server 的 `proxy` 把 `/api/*` 转发到 18098。**这只是开发态**，生产不要用。

详见 [`../development/getting-started.md`](../development/getting-started.md)。

---

## 容量规划

下面是一些 ballpark 数字（实测），方便评估：

| 指标 | 量级 |
|---|---|
| skin 包大小（classic build 后） | ~2 MB（gzip 后 ~600 KB） |
| 单 skin 资源数（assets） | 50-200 个文件 |
| ThemeRegistry 启动扫描耗时 | < 50 ms（10 个 skin 量级） |
| ServeDir 单文件吞吐 | 5w+ qps（SSD） |
| 内置 skin 数量上限 | 无硬限制，建议 ≤ 20 |
| 运行时上传 skin 数量上限 | 同上 |

---

## 下一步

- 想了解 **运行时模型**（启动扫描 / 路由优先级 / bootstrap 注入 / 切换时机）：[`03-runtime-model.md`](./03-runtime-model.md)
- 想看 **skin 包目录长什么样**：[`../skin-package/README.md`](../skin-package/README.md)
- 想看 **API 怎么调**：[`../api/README.md`](../api/README.md)
