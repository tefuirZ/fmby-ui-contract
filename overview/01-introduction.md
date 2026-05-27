# 01 - Introduction

> 5 分钟搞清楚 FMBY 多主题机制是什么、为什么存在、和谁有关。

---

## FMBY 是什么

[FMBY](https://github.com/tefuirZ/fmby)（"For My Brothers and Yours"）是一个**轻量级私人媒体服务器**：

- 单二进制 Rust 后端（axum + sqlx + Postgres）
- 内置元数据刮削、剧集识别、封面 / 字幕资产管线
- 兼容 Emby / Jellyfin 客户端协议（`/emby/*`、`/jellyfin/*`），方便存量第三方播放器接入
- **一方 Web UI**：fmby 自己的网页客户端（区别于第三方 Emby/Jellyfin Web）

本仓库聚焦最后一项："一方 Web UI"如何被替换为不同的设计风格。

---

## 为什么有"多主题"机制

主流媒体服务器（Plex、Jellyfin、Emby）的网页 UI 都是**单一前端**，要换风格只能 fork 整个项目或写浏览器插件——成本高、维护苦。

FMBY 选了不同的产品定位：

> **同一个后端服务，可以被不同设计风格的前端复用。运维（管理员）想换风格，进后台改一个下拉菜单就行。**

这个能力对几类场景特别有用：

| 场景 | 价值 |
|---|---|
| 团队 / 小型机构内部部署 | 用品牌色 + 专属交互替换默认 UI，不动后端 |
| 设计师 / 前端开发者社区 | 把 FMBY 当"后端基座"，自由发挥前端创意 |
| 私人玩家 | 可以装好几套风格随时切换（夜间风、复古风、极简风） |
| 商业化部署 | 运营方按客户偏好分发不同主题包，后端代码完全保密 |

---

## "Skin"——本仓库的核心名词

**Skin（主题包）** = 一套独立的前端 UI 实现 + 元数据。

> ⚠️ **避免混淆**：FMBY 用户偏好里有一个 `theme: light | dark | system` 字段，那是"色彩明暗模式"，和本仓库说的 **skin** 不是一回事。
>
> - **skin**：整套 UI（可能包含完全不同的信息架构、组件设计、交互流程）
> - **theme mode**：在同一套 skin 内的"亮色 / 暗色"切换

每个 skin 是一个目录：

```
themes/{skin-name}/
├── manifest.json              # 元数据：name, version, contract_version, capabilities ...
├── dist/
│   ├── index.html
│   └── assets/...             # vite build 产物
└── README.md (可选)
```

skin 由 fmby 后端在**启动时扫描注册**，运行时由管理员通过 `active_ui_skin` 设置项指定哪一套被终端用户看到。详见 `02-architecture.md` 和 `03-runtime-model.md`。

---

## 生态参与者

```
┌────────────────────┐
│ FMBY 后端开发者     │   维护 fmby-server，定义 API 契约和 ThemeRegistry
└─────────┬──────────┘
          │
          │ 发布 contract version + OpenAPI
          ▼
┌────────────────────────────────────────────────────────────┐
│ 本仓库（fmby-ui-contract）                                 │
│  - API 契约    - skin 包规范    - 功能清单    - 设计规范    │
└─────────┬──────────────────────────────────────────────────┘
          │
          │ 第三方按这份契约出 skin
          ▼
┌────────────────────┐    ┌────────────────────┐
│ 第三方 skin 作者    │    │ FMBY 内置 skin     │
│ (社区 / 设计师)     │    │ (classic / modern)  │
└─────────┬──────────┘    └─────────┬──────────┘
          │                         │
          │     skin 包提交           │
          └──────────┬──────────────┘
                    │
                    ▼
         ┌────────────────────┐
         │ 运维 / 管理员       │   通过后台切换 active_ui_skin
         └─────────┬──────────┘
                   │
                   ▼
         ┌────────────────────┐
         │ 终端用户            │   访问站点根路径，看到 active skin
         └────────────────────┘
```

每方的边界：

- **FMBY 后端**：负责 API、数据、加载 skin、管理员后台、登录鉴权。**不负责** skin 内部的页面布局、组件库选型、交互细节。
- **本仓库（contract）**：负责把 API 和功能边界写清楚，所有"做 skin 的人"都看这份。
- **skin 作者**：负责实现一套 UI；只能调用 contract 里列出的 API；不直接访问 DB / 内部 service / 文件系统。
- **运维**：负责把 skin 包部署到 fmby 的 `themes/` 或 `data/themes/` 目录，并在后台切换 `active_ui_skin`。
- **终端用户**：感知不到 skin 切换的复杂度——访问 `https://fmby.example.com/`，浏览器自动加载当前 active skin。

---

## 不涉及哪些场景

为了避免误解，明确列一下**本机制不解决**的事：

1. **不是 micro-frontend**：你不能在一个页面里同时加载多个 skin 的组件。运行时只有一个 active skin。
2. **不是浏览器扩展机制**：你不能在不改 fmby 后端的情况下，往 active skin 里"注入"代码。
3. **不替代 Emby/Jellyfin 第三方播放器**：那条路走 `/emby/*` 兼容层，和 skin 机制完全无关。
4. **不是后端插件系统**：skin 只能改前端 UI，不能改后端逻辑。后端逻辑变更走 fmby 主仓 PR。
5. **skin 不能跨 contract 版本盲目兼容**：每个 skin 必须在 manifest 声明它兼容的 contract 版本，详见 `skin-package/compatibility.md`。

---

## 下一步

- 如果你想了解 **整体架构**：[`02-architecture.md`](./02-architecture.md)
- 如果你想了解 **skin 是怎么被加载和切换的**：[`03-runtime-model.md`](./03-runtime-model.md)
- 如果你想 **直接动手做一个 skin**：[`../development/getting-started.md`](../development/getting-started.md)
