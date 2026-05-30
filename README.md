# fmby-ui-contract

> FMBY 多主题前端 SDK / API 契约 / 设计规范仓库
>
> 这里是给 **设计师、前端开发者、运维** 看的"对外契约"，主仓 `fmby/` 仓库不公开，请优先以本仓库内容为准。

---

## 这是什么

[FMBY](https://github.com/tefuirZ/fmby) 是一个轻量级私人媒体服务器，**支持多套前端 UI 主题**——同一个后端服务可以加载不同设计风格的前端，由站点管理员在后台一键切换。

本仓库定义了"做一套 FMBY 主题"所需的 **全部契约和资料**：

- **API 契约**：后端开放给主题方使用的全部 REST 端点
- **主题包规范**：主题打包的目录结构、`manifest.json` schema、版本兼容矩阵
- **功能清单**：现役 UI 必须覆盖的全部功能矩阵（缺一不能验收）
- **设计规范**：design tokens、响应式断点、无障碍要求
- **开发指南**：从模板起手 → 本地连接后端 → 构建 → 提交的完整流程
- **验收清单**：你的主题包要被合并 / 上线必须通过的检查项

---

## 受众

| 角色 | 应该看哪里 |
|---|---|
| 第一次了解项目的人 | `overview/01-introduction.md` |
| UI 设计师 | `overview/` → `design/` → `features/routes.md` |
| 前端开发者 | `development/getting-started.md` → `development/api-client.md` → `api/` → `features/` |
| 运维 / 管理员 | `overview/02-architecture.md` → `skin-package/lifecycle.md` |
| 评审 / 验收方 | `acceptance/functional.md`、`acceptance/security.md`、`acceptance/smoke-test.md` |

---

## 更新记录

合同变更统一记录在 [`CHANGELOG.md`](./CHANGELOG.md)。实现 skin 或升级 fmby 后端前，先核对对应的 API、功能和安全合同是否发生变化。

---

## 仓库结构

```text
fmby-ui-contract/
├── README.md                    # 你正在看的入口文档
├── overview/                    # 主题作者第一站：项目背景、架构、运行模型
│   ├── 01-introduction.md
│   ├── 02-architecture.md
│   └── 03-runtime-model.md
├── skin-package/                # 主题包是什么：目录结构、manifest、生命周期
│   ├── README.md
│   ├── manifest.md              # manifest.json 完整字段说明
│   ├── build-output.md          # vite base path、文件命名约定
│   ├── lifecycle.md             # 注册 / 激活 / 卸载 / 升级 / 回滚
│   └── compatibility.md         # contract 版本 ↔ fmby 版本兼容矩阵
├── api/                         # ★ API 开放文档
│   ├── README.md
│   ├── conventions.md           # 基址、JSON、分页、时间、ID
│   ├── auth.md                  # 登录 / cookie / CSRF 完整流程
│   ├── errors.md                # 错误模型 + 错误码索引
│   └── domains/
│       ├── site.md              # /api/site/*
│       ├── install.md           # /api/install/*
│       ├── browse.md            # /api/browse/*
│       ├── items.md             # /api/items/*
│       ├── playback.md          # /api/playback/*
│       ├── assets.md            # /api/assets/*
│       ├── settings.md          # /api/settings/*
│       └── manage/*.md          # /api/manage/* 子域
├── features/                    # ★ 不漏功能的核心武器
│   ├── README.md
│   ├── routes.md                # 路由表 + 权限矩阵
│   ├── states.md                # 通用状态：loading / empty / error / forbidden / maintenance
│   └── manage/ browse/ settings/ # 每个现役页面一份契约文档
├── design/                      # 设计参考（非强制；classic 主题为参考实现）
│   ├── tokens-reference.md
│   ├── responsive.md
│   ├── accessibility.md
│   └── i18n.md
├── development/                 # 出主题的工程流程
│   ├── getting-started.md
│   ├── api-client.md
│   ├── debugging.md
│   ├── skin-bundling.md
│   └── release.md
├── acceptance/                  # 验收门
│   ├── functional.md
│   ├── security.md
│   ├── performance.md
│   ├── a11y.md
│   └── smoke-test.md
└── schemas/                     # JSON Schema
    ├── manifest.schema.json
    └── bootstrap.schema.json
```

---

## 快速开始

如果你想做一套主题，建议按这个顺序读：

1. **5 分钟搞清楚这是什么** → [`overview/01-introduction.md`](./overview/01-introduction.md)
2. **20 分钟搞清楚架构** → [`overview/02-architecture.md`](./overview/02-architecture.md) + [`overview/03-runtime-model.md`](./overview/03-runtime-model.md)
3. **30 分钟搞清楚 API 边界** → [`api/README.md`](./api/README.md) + [`api/conventions.md`](./api/conventions.md) + [`api/auth.md`](./api/auth.md)
4. **看清楚要做哪些功能** → [`features/routes.md`](./features/routes.md) + [`features/README.md`](./features/README.md)
5. **抄起来开干** → [`development/getting-started.md`](./development/getting-started.md)
6. **提交前自检** → [`acceptance/functional.md`](./acceptance/functional.md) + [`acceptance/security.md`](./acceptance/security.md)

---

## 核心概念词典

| 名词 | 定义 |
|---|---|
| **skin / theme / UI skin** | 一套独立的前端 UI 实现包，可被 fmby 后端运行时加载（本仓库统一用 **skin** 这个词，避免和"暗色/亮色 theme mode"混淆） |
| **skin package** | 一个 skin 的发布形态：一个目录，含 `manifest.json` 和 build 出来的静态资源 |
| **manifest** | 描述 skin 元数据的 JSON 文件（名字、版本、契约版本兼容性等） |
| **active skin** | 当前管理员选中的 skin，决定终端用户访问站点根路径时返回哪个 `index.html` |
| **skin registry** | fmby 后端启动时扫到的全部 skin 集合 + 当前激活项 |
| **contract version** | 本仓库的版本号；skin 在 `manifest.json` 里声明它兼容的 contract 版本范围 |
| **bootstrap** | fmby 在 SPA `index.html` 里注入的 `window.__FMBY_BOOTSTRAP__` 数据，告诉前端站点名、API 基址、CSRF 拿取方式等 |
| **classic** | fmby 内置的参考实现 skin（即仓库里 `apps/web/` 的 build 产物），实现了 100% 功能清单 |
| **modern**（规划中） | fmby 计划提供的第二套官方 skin，主题作者可参考其代码组织方式 |

---

## 当前状态

- **Contract Version**: `0.1.0-draft`（早期，字段和 schema 可能调整）
- **对应 fmby Version**: `>= 0.2.0`
- **状态**: 当前文档按主仓现有 Web API / classic skin 同步；字段仍可能随 `0.x` 版本调整，破坏性变更会通过 contract 版本推进。

---

## 贡献流程

1. 读 [`development/release.md`](./development/release.md)
2. fork 本仓库或按 [`development/getting-started.md`](./development/getting-started.md) 创建 skin 工程
3. 按 [`features/routes.md`](./features/routes.md) 实现功能（或在 `manifest.capabilities` 明确声明范围）
4. 按 [`acceptance/`](./acceptance/) 自检
5. 提交方式二选一：
   - **PR 进 fmby 主仓** `themes/{your-skin}/`（成为内置 skin）
   - **打包上传** 到生产环境的 `data/themes/{your-skin}/`（运行时 skin，不入主仓）

---

## License

本仓库（文档 / schema / 模板代码）使用 [MIT License](./LICENSE)。

第三方主题包的 license 由各主题作者自行决定，不受本仓库约束。

---

## 相关链接

- 主仓库 fmby（私有）：单二进制后端 + 多主题加载器
- Issue / 讨论：暂未开放，请通过 PR 或私信联系
