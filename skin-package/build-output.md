# Build Output 约定

> skin 包的 `dist/` 目录是 vite（或其它打包器）的产物。fmby 加载器对它有几条硬性约定。

---

## 必须遵守的约定

### 1. base path 必须是 `/_assets/{skin-name}/`

vite 默认 base 是 `/`，会让所有资源引用变成 `/assets/...`。但 fmby 后端把每个 skin 的资源 serve 在 `/_assets/{name}/` 下，所以必须改 base。

**`vite.config.ts`** 推荐写法：

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import manifest from "./manifest.json";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? `/_assets/${manifest.name}/` : "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
```

或者通过环境变量：

```ts
base: process.env.SKIN_BASE ?? "/",
```

build 时：

```bash
SKIN_BASE=/_assets/my-skin/ pnpm build
```

**为什么**：`dist/index.html` 里 vite 会生成类似：

```html
<script type="module" src="/_assets/my-skin/assets/index-abc123.js"></script>
<link rel="stylesheet" href="/_assets/my-skin/assets/index-def456.css">
```

如果 base 是 `/`，浏览器请求 `/assets/index-abc123.js` 会被 fmby fallback 路由命中，返回 `index.html`——你会看到 "Unexpected token <" 这种诡异报错。

### 2. `dist/index.html` 必须有 `</head>`

fmby 后端会在 `</head>` 之前插入 bootstrap `<script>`。如果你把整个 HTML 极简到只有 body，会校验失败。

**vite 默认** 生成的 `index.html` 一定有 head——只要不手动裁剪，就没问题。

### 3. 入口 HTML 必须叫 `index.html`

`manifest.json.entry = "dist/index.html"`，所以文件名必须严格是这个。

### 4. 所有静态资源必须在 `dist/` 内

vite 默认就这样。不要让 build 输出目录散落到 `public/`、`build/`、根目录等地方。

---

## 推荐的最小 vite 配置

适用于 React 项目，TypeScript：

```ts
// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

export default defineConfig(({ mode }) => {
  const manifest = JSON.parse(readFileSync("./manifest.json", "utf-8"));
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: mode === "production" ? `/_assets/${manifest.name}/` : "/",
    plugins: [react()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: false,        // 生产建议关，体积小
      assetsInlineLimit: 4096, // < 4KB 的资源会 base64 内联，减少请求数
    },
    server: {
      port: 5180,
      proxy: {
        "/api": {
          target: env.VITE_FMBY_BACKEND ?? "http://localhost:18098",
          changeOrigin: true,
        },
      },
    },
  };
});
```

`.env.development`：

```
VITE_FMBY_BACKEND=http://192.168.100.58:18098
```

这样开发期 `pnpm dev` 起 5180 端口的 vite，前端请求 `/api/*` 会被代理到 fmby 后端。

---

## index.html 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FMBY</title>
    <!-- bootstrap 会被 fmby 后端注入到 </head> 之前 -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

vite build 后，`<script src="/src/main.tsx">` 会被替换成 hashed 的 production 路径。

---

## 资源命名 / hashing

vite 默认配置已经会给 assets 加内容 hash：

```
dist/assets/index-abc123.js
dist/assets/index-def456.css
dist/assets/logo-789xyz.png
```

fmby 对这些资源发 `Cache-Control: public, max-age=31536000, immutable`——内容变了 hash 也变，不会有缓存击穿。

**不要关 hash**（比如改成 `entryFileNames: 'index.js'`），否则浏览器会用旧文件。

---

## 公共资源（public/）

vite 的 `public/` 目录里的文件会原封不动复制到 `dist/`，且**不带 hash**。

| 用法 | 推荐 |
|---|---|
| `favicon.ico` / `favicon.svg` | ✅ 放 public |
| 不会变的图片 / 字体 | ⚠️ 放 src 让 vite 处理（拿到 hash） |
| 第三方 SDK 的本地拷贝 | ✅ 放 public |
| 开发期的 mock 数据 | ❌ 别扔 public |

vite 会把 public 内的文件复制到 `dist/`，所以 fmby 也能 serve（走 `/_assets/{skin}/{filename}`）。

---

## 环境变量

vite 的 `import.meta.env` 在 build 期固化。**别**用它来读运行时配置（如 fmby API base url）——用 bootstrap 注入的字段：

```ts
const apiBase = window.__FMBY_BOOTSTRAP__.api.base_url;  // ✅ 运行时
const buildTag = import.meta.env.VITE_BUILD_TAG;          // ✅ build 期固化
```

---

## 多 skin 在同一 monorepo

如果你想用一个 monorepo 维护多个 skin，结构建议：

```
fmby-skins-monorepo/
├── packages/
│   ├── modern/
│   │   ├── manifest.json
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── src/
│   │   └── dist/
│   ├── dark-vibe/
│   │   └── ... (同上)
│   └── shared/                   # 共享组件 / 工具
└── pnpm-workspace.yaml
```

每个 skin 独立 build，独立 manifest，独立 `name`。

---

## 体积建议

| 维度 | 建议上限 |
|---|---|
| 单 skin gzip 后总大小 | < 2 MB |
| 单 JS chunk gzip 后 | < 500 KB |
| 首屏 JS 请求数 | < 10 |
| 字体文件 | < 200 KB / 个，subset 一定要做 |

超出不会报错，但会让用户首次加载 ≥ 3 秒，影响体验。

---

## CI 校验脚本

在 skin 仓库的 CI 里跑下面脚本，可在 PR 阶段拦下大部分问题：

```bash
#!/usr/bin/env bash
set -euo pipefail

pnpm install --frozen-lockfile
pnpm build

# 1. manifest schema 校验
npx ajv validate \
  -s ./node_modules/fmby-ui-contract/schemas/manifest.schema.json \
  -d ./manifest.json

# 2. 必须文件存在
test -f dist/index.html || (echo "missing dist/index.html" && exit 1)
grep -q "</head>" dist/index.html || (echo "missing </head>" && exit 1)

# 3. base path 检查
NAME=$(jq -r .name manifest.json)
grep -q "/_assets/${NAME}/" dist/index.html \
  || (echo "base path 不正确，请检查 vite base 配置" && exit 1)

# 4. 体积检查（gzip 总和）
TOTAL=$(find dist -type f -name "*.js" -o -name "*.css" \
  | xargs -I {} sh -c 'gzip -c "{}" | wc -c' | awk '{s+=$1} END {print s}')
test "$TOTAL" -lt 2097152 || (echo "skin 太大: $TOTAL bytes (max 2MB)" && exit 1)

echo "✅ skin build 校验通过"
```

---

## 下一步

- 看 **生命周期**：[`lifecycle.md`](./lifecycle.md)
- 看 **bootstrap schema**：[`../schemas/bootstrap.schema.json`](../schemas/bootstrap.schema.json)
