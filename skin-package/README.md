# Skin Package

> 一个 **skin 包** 是 fmby 主题的最小分发单元——一个目录，里面包含 manifest 和 build 后的静态资源。

---

## 目录长什么样

```
my-skin/
├── manifest.json           # 必须：skin 元信息
├── dist/                   # 必须：vite build 产物
│   ├── index.html          # 必须：入口 HTML
│   ├── assets/             # 必须：JS / CSS / 字体 / 图片，由 vite 生成
│   │   ├── index-abc123.js
│   │   ├── index-def456.css
│   │   └── ...
│   └── (其它静态资源)
├── screenshots/            # 推荐：截图，用于管理后台展示
│   ├── home.png
│   ├── player.png
│   └── manage.png
├── README.md               # 推荐：作者说明、致谢、license
└── LICENSE                 # 推荐：开源协议
```

---

## 子文档

- [`manifest.md`](./manifest.md) — `manifest.json` 完整字段定义、校验规则、错误情况、完整示例
- [`build-output.md`](./build-output.md) — vite base path、文件命名约定、index.html 必须的占位
- [`lifecycle.md`](./lifecycle.md) — 注册 / 激活 / 卸载 / 升级 / 回滚
- [`compatibility.md`](./compatibility.md) — contract 版本和 fmby 版本的兼容矩阵

---

## 内置 skin vs 上传 skin

| 类型 | 位置 | 谁负责 | 何时生效 |
|---|---|---|---|
| 内置（built-in） | `/app/themes/{name}/` | 镜像作者，`COPY` 进镜像 | 容器启动 |
| 运行时上传 | `/app/data/themes/{name}/` | 运维 / 管理员 | 重扫 / 重启后 |

两者结构完全相同，区别仅在于来源。

---

## 完整最小包示例

最小可工作的 skin 包：

```
my-skin/
├── manifest.json
└── dist/
    ├── index.html
    └── assets/
        └── main-abc123.js
```

`manifest.json`：

```json
{
  "contract_version": "0.1.0",
  "name": "my-skin",
  "display_name": "My Skin",
  "version": "1.0.0",
  "description": "我的第一个 fmby 主题",
  "author": {
    "name": "Alice",
    "email": "alice@example.com"
  },
  "license": "MIT",
  "entry": "dist/index.html"
}
```

`dist/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>My Skin</title>
  <!-- bootstrap 由 fmby 后端注入到这里 -->
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/_assets/my-skin/assets/main-abc123.js"></script>
</body>
</html>
```

打包成 zip 上传，或解压到 `data/themes/my-skin/`，重启 fmby 后即可在管理后台选用。
