# Development Guide

皮肤开发者从 0 到上架的完整路径。

## 子文档

| 文档 | 范围 |
|------|------|
| [getting-started.md](./getting-started.md) | 环境准备 / 模板克隆 / 本地预览 |
| [api-client.md](./api-client.md) | 接 API 的最佳实践（fetch / 重试 / token 刷新） |
| [skin-bundling.md](./skin-bundling.md) | 构建产物 / manifest 校验 / 版本号策略 |
| [debugging.md](./debugging.md) | 本地调试 / mock 后端 / 错误排查 |
| [release.md](./release.md) | 发布流程 / 兼容声明 / 升级矩阵 |

## 推荐技术栈

- **构建**：Vite / Rollup（产物 ES module + CSS）
- **框架**：React / Vue / Svelte / Solid（任选）
- **样式**：CSS Modules / Tailwind / styled-components
- **类型**：TypeScript（推荐）

## 不强制但建议

- 使用 [schemas/](../schemas/) 做 manifest / bootstrap 校验
- 用 [templates/](../templates/) 中的模板起步（如有）
- 提交前跑 [acceptance/](../acceptance/) 自检脚本
