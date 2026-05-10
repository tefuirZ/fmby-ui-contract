# Development · Getting Started

## 环境

- Node ≥ 20
- 包管理器：pnpm 推荐（也支持 npm / yarn）
- fmby 后端实例（本地 dev 或远端 staging）

## 步骤

### 1. 克隆模板（如有）

```bash
git clone https://github.com/tefuirZ/fmby-ui-contract.git
cd fmby-ui-contract/templates/<framework-template>
```

### 2. 配置 API 端点

`.env.local`：

```
VITE_FMBY_API_BASE=https://staging.fmby.example.com
VITE_FMBY_SKIN_ID=my-awesome-skin
```

### 3. 启动 dev

```bash
pnpm install
pnpm dev
```

dev 会拦截 `/api/*` proxy 到 `VITE_FMBY_API_BASE`。

### 4. 写 manifest

参考 [../schemas/manifest.schema.json](../schemas/manifest.schema.json) 写 `skin/manifest.json`：

```json
{
  "schema_version": "1.0",
  "id": "my-awesome-skin",
  "name": "My Awesome Skin",
  "version": "0.1.0",
  "compat": { "fmby_min": "0.10.0", "fmby_max": "0.x" },
  "entry": { "html": "index.html", "bootstrap": "bootstrap.json" }
}
```

### 5. 构建 + 本地预览

```bash
pnpm build      # 产物在 dist/
pnpm preview    # 本地启动 dist
```

### 6. 部署到 fmby

把 `dist/` 上传到 fmby 的 `themes/` 目录（管理员配置见 [overview/02-architecture.md](../overview/02-architecture.md)），或打包为 zip 通过管理面"上传皮肤"（如已实现）。

## 常见坑

- CORS：dev 必须用 vite proxy，不要直接 fetch 跨域
- 401：token 过期，调 `/api/auth/refresh`，统一在 api-client 做
- 静态资源相对路径：所有皮肤资产用相对路径，便于挂在子目录
