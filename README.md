# fmby-ui-contract

> FMBY 多主题前端 SDK / 契约仓库

本仓库提供给第三方 / 团队成员开发 FMBY 自定义 UI 主题的全部资料。

## 状态

🚧 **Bootstrapping** — fmby 主仓加载器（Stage 12U）落地中，本仓库内容会在加载器跑通后第一时间填充：

- [ ] OpenAPI 契约（`openapi.json`，从 fmby 后端 utoipa 自动生成）
- [ ] 设计规范文档（`docs/`，从 fmby `docs/webui/` 同步）
- [ ] 主题包结构规范（`docs/skin-package-spec.md`）
- [ ] 主题包 manifest schema（`schemas/manifest.schema.json`）
- [ ] 模板工程（`templates/skin-vite-react/`）：Vite + React + TS 起手式

## 主题包形态（预告）

```
themes/{skin-name}/
├── manifest.json    # 主题元数据（name, display_name, version, description, author）
├── index.html
└── assets/...       # vite build 产物
```

部署形态：单 binary `fmby-server` + 外置 `themes/` 目录 + 单端口 + Caddy 前置 TLS。
管理员可在后台切换 active_ui_skin，运行时即时生效。

## 协作流程（预告）

1. fork 本仓库
2. 复制 `templates/skin-vite-react/` 起手
3. 按 `docs/` 设计规范出稿 + 实现
4. 调用 OpenAPI 契约里的端点（不直接调内部 API）
5. CI 产出 dist zip，PR 进 fmby 主仓 `themes/{your-skin}/` 或 ops 上传到运行时 data 目录

## License

MIT

## 关联仓库

- 主仓库 fmby（私有）：单二进制后端 + 多主题加载器