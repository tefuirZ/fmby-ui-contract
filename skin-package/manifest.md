# manifest.json 规范

> skin 包根目录的 `manifest.json` 是 fmby 加载器的"身份证"——后端通过它注册、校验、展示 skin。

---

## 完整字段表

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `contract_version` | string (semver) | ✅ | 本 skin 遵循的 contract 版本（必须和 fmby-ui-contract 仓库 tag 对齐） |
| `name` | string (slug) | ✅ | 唯一名，小写字母 / 数字 / 连字符；用作 URL 段（`/_assets/{name}/`）和目录名 |
| `display_name` | string | ✅ | 给人看的名字，会显示在管理后台下拉菜单 |
| `version` | string (semver) | ✅ | skin 自己的版本号 |
| `description` | string | ✅ | 一句话描述（≤ 200 字符） |
| `author` | object | ✅ | 作者信息，见下 |
| `author.name` | string | ✅ | 作者姓名 / 团队名 |
| `author.email` | string | ❌ | 联系邮箱 |
| `author.url` | string (URL) | ❌ | 作者主页 |
| `license` | string (SPDX) | ✅ | 协议名（如 `MIT`、`Apache-2.0`、`GPL-3.0-or-later`） |
| `entry` | string | ✅ | 相对包根目录的入口文件，**必须是** `dist/index.html` |
| `homepage_url` | string (URL) | ❌ | skin 主页（GitHub repo / 文档站等） |
| `repository_url` | string (URL) | ❌ | 源代码仓库 |
| `screenshots` | array<object> | ❌ | 截图列表 |
| `screenshots[].path` | string | ✅* | 相对包根目录，如 `screenshots/home.png` |
| `screenshots[].caption` | string | ❌ | 说明文字 |
| `capabilities` | array<string> | ❌ | 声明用到的 fmby 能力，如 `["pan115_imghost", "playback", "manage"]`，详见下文 |
| `localStorage_keys` | array<string> | ❌ | 声明用到的 localStorage key 前缀，便于切换时清理 / 隔离 |
| `min_fmby_version` | string (semver) | ❌ | 要求的 fmby 后端最低版本 |
| `max_fmby_version` | string (semver) | ❌ | 不兼容的 fmby 后端版本上界（罕用） |
| `tags` | array<string> | ❌ | 标签（如 `["dark", "modern", "mobile-friendly"]`），用于管理后台筛选 |

\* `path` 在数组项中是必填。

---

## 字段详解

### `contract_version`

semver 字符串。fmby 后端启动扫描时会检查：

```
backend.contract_version_supported (range) ⊇ skin.contract_version
```

兼容矩阵详见 [`compatibility.md`](./compatibility.md)。

不兼容的 skin 会在日志里 warn 并被跳过——它仍存在于磁盘，但**不会出现在管理后台下拉菜单**。

### `name`

slug 格式正则：`^[a-z][a-z0-9-]{1,63}$`

- ✅ `classic`, `modern`, `dark-vibe`, `tefu-stylish`
- ❌ `Classic`（大写）、`my_skin`（下划线）、`123-skin`（数字开头）、`-foo`（连字符开头）

**为什么这么严**：因为 `name` 会拼到 URL 里（`/_assets/{name}/...`）。

### `entry`

固定为 `dist/index.html`。fmby 后端会从这个文件读 HTML，注入 bootstrap 后返回给浏览器。

不允许指向 `dist/` 之外（避免目录穿越）。

### `capabilities`

声明你**会调用**的 fmby 能力。后端拿到这个清单可以做：

- 提示运维：用户绑定 pan115 imghost 才能完整体验该 skin
- 在管理后台展示能力列表
- 未来可能用于权限校验（不强制）

合法值（从 `recon` 盘点的功能列表对齐）：

| 值 | 含义 |
|---|---|
| `auth` | 登录 / 会话管理（基本所有 skin 都用） |
| `browse` | 媒体库浏览 |
| `playback` | 播放器（HLS / dash / 直链） |
| `assets` | 海报 / 字幕 / sidecar 资源 |
| `settings` | 用户和服务器设置 |
| `manage` | 后台管理（用户、库、挂载、任务等） |
| `pan115_imghost` | 115 图床治理 / 观测页（前端有专门页面） |
| `pan115_provider` | 115 网盘 provider 管理 / 扫码绑定 |
| `task_center` | 任务中心 |
| `audit_logs` | 审计日志 |
| `runtime_logs` | 运行日志 |

如果省略 `capabilities`，等同于 `["*"]`（所有能力都会用到）。

### `localStorage_keys`

可选，声明 namespace 前缀。例如：

```json
"localStorage_keys": ["myskin:", "myskin-cache:"]
```

后端可以利用这个清单实现"切换 skin 时清空旧 skin 数据"的功能（计划中）。

### `min_fmby_version` / `max_fmby_version`

semver。如果当前后端 fmby 版本不在范围内，skin 会被跳过。

---

## 完整示例

```json
{
  "contract_version": "0.1.0",
  "name": "modern",
  "display_name": "Modern (现代风)",
  "version": "1.2.3",
  "description": "面向移动端优先的暗色主题，主打卡片化和大图流。",
  "author": {
    "name": "tefuir",
    "email": "tefuir@example.com",
    "url": "https://github.com/tefuirZ"
  },
  "license": "MIT",
  "entry": "dist/index.html",
  "homepage_url": "https://github.com/tefuirZ/fmby-skin-modern",
  "repository_url": "https://github.com/tefuirZ/fmby-skin-modern.git",
  "screenshots": [
    { "path": "screenshots/home.png", "caption": "首页 / 推荐流" },
    { "path": "screenshots/player.png", "caption": "播放器" },
    { "path": "screenshots/manage.png", "caption": "后台管理" }
  ],
  "capabilities": ["auth", "browse", "playback", "assets", "settings", "manage"],
  "localStorage_keys": ["modern:"],
  "min_fmby_version": "0.2.0",
  "tags": ["dark", "mobile-first", "card"]
}
```

---

## 校验规则

fmby 后端启动时对每个 `manifest.json` 跑下面校验，**任何一项失败就跳过该 skin**：

1. ✅ JSON 解析成功
2. ✅ 所有必填字段存在
3. ✅ `name` 满足 slug 正则
4. ✅ `name` 在所有已注册 skin 中唯一（重名则后扫到的跳过）
5. ✅ `version` 是合法 semver
6. ✅ `contract_version` 在后端支持范围内
7. ✅ `entry` 文件实际存在
8. ✅ `dist/index.html` 实际存在
9. ✅ `dist/index.html` 内含 `</head>` 字符串（用于注入 bootstrap）
10. ✅ `screenshots[].path` 文件实际存在（缺失的截图被忽略，但其它字段必须合法）

JSON Schema 见 [`../schemas/manifest.schema.json`](../schemas/manifest.schema.json)（可用于本地 IDE 校验和 CI）。

---

## 常见错误

| 错误 | 原因 | 修复 |
|---|---|---|
| `manifest.json: invalid name "My Skin"` | name 含空格 / 大写 | 改成 `my-skin` |
| `manifest.json: contract_version 0.2.0 not supported by backend (supports ^0.1)` | skin 太新或太旧 | 升 / 降 contract_version |
| `dist/index.html missing </head>` | 自己手写的 HTML 漏了 head | 让 vite 处理，不要手工裁剪 |
| `entry path traversal: ../foo` | entry 写了 `..` | entry 必须在 `dist/` 内 |
| `name "classic" already registered` | 重名了 | 改 name |

---

## 给 skin 作者的建议

- 把 `manifest.json` 也纳入 vite 处理（用 `vite-plugin-static-copy` 把它从仓库根复制到 `dist/`），确保 build 后 zip 时直接打包 `dist/` + `manifest.json`
- 在 `package.json` 写 `"version"`，build 时同步到 `manifest.json`（避免手工漏改）
- 在 CI 里跑 manifest schema 校验：`npx ajv validate -s manifest.schema.json -d manifest.json`
- 截图建议 1280x720 PNG，3-5 张以内（管理后台展示有限）

---

## 下一步

- 看 **vite base path 怎么配**：[`build-output.md`](./build-output.md)
- 看 **生命周期管理**：[`lifecycle.md`](./lifecycle.md)
