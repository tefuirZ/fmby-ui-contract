# Development · Skin Bundling

## 产物结构

详见 [../skin-package/build-output.md](../skin-package/build-output.md)。简述：

```
dist/
├─ manifest.json            必须
├─ bootstrap.json           必须
├─ index.html               入口
├─ assets/                  bundled JS / CSS
├─ locales/                 i18n
├─ thumbnails/              皮肤预览图
└─ schemas/ (可选)          自检
```

## 校验

构建后跑：

```bash
node scripts/validate.mjs   # 用 ajv 校验 manifest + bootstrap
```

校验脚本由 [../schemas/](../schemas/) 提供，模板 repo 内置。

## 版本号策略

- `version` 用 SemVer
- breaking 改动 → major +1
- 兼容性范围用 `compat.fmby_min` / `fmby_max`：
  - 已知不兼容某 fmby 版本 → 缩窄
  - 验证通过新版 fmby → 放宽 + 发新版

## 资源路径

- 所有路径相对（`./assets/...`），便于挂在子目录
- 不引外部 CDN（CSP 与离线场景）
- 字体内嵌或自托管

## 性能

- 首屏 JS gzip < 200 KB（推荐 < 100 KB）
- 路由级 code splitting
- 图片懒加载 + blurhash 占位
- 海报用 srcset 适配多分辨率
