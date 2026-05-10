# reference/

第三方接手做新 UI 时的**参考资料区**。本目录下所有内容**只读**，不是 contract 的一部分。

## 子目录

### `current-ui/`

fmby 当前生产 Web 前端（`apps/web`，`@fmby/web`）的源码快照。

- 用途：作为 **行为参考 / 视觉参考 / 端点调用样例**。
- 技术栈：Vite + React + TypeScript（详见 `current-ui/package.json`）。
- 已剔除：`node_modules/`、`dist/`、`.vite/`、`coverage/`、`*.tsbuildinfo`、`.map`、`.bak`、`.env*`。
- **不要把它当 contract**：contract 的权威来源是 `/api`、`/features`、`/design`、`/schemas`，本快照仅用于直观对照。
- 不保证持续同步：仓库截取时间见本目录的 git 历史。如需追主干，请回到 fmby 主仓 `apps/web/`。

## 使用建议

1. 先读根目录 `overview.md` + `features/routes.md` + `api/README.md` 建立全局认知。
2. 拿不准某个交互细节时，再来 `current-ui/src/` 找对应页面（路由对照见 `features/routes.md`）。
3. **新主题不要 fork 本目录**：按 `development/getting-started.md` 从空模板起步，按 contract 实现，避免把当前 UI 的偶然实现当成约束。
