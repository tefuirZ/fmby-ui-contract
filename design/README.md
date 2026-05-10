# Design Guidelines

皮肤的视觉表达自由，但以下规范为最低底线，目的是保证 UI 可达、易用、不丢功能。

## 子文档

| 文档 | 范围 |
|------|------|
| [tokens.md](./tokens.md) | 设计 tokens：颜色 / 间距 / 字号 / 阴影 |
| [layout.md](./layout.md) | 信息架构 / 栅格 / 响应式断点 |
| [components.md](./components.md) | 必备组件清单 + 行为规范 |
| [accessibility.md](./accessibility.md) | a11y 底线（焦点 / 对比度 / 键盘） |
| [i18n.md](./i18n.md) | 多语言（zh-CN / en-US 必备） |

## 设计原则

1. **功能不漏**：所有 [features/](../features/) 列出的页面与操作都必须可达
2. **状态完备**：[features/states.md](../features/states.md) 中 7 种状态全部实现
3. **响应式**：1280 / 1024 / 768 / 414 全断点可用
4. **可访问**：键盘可达、焦点可见、对比度 ≥ AA
5. **一致**：同一交互在多页保持一致（按钮位置 / 二次确认 / toast 风格）
6. **跨主题**：light / dark 必备，颜色使用 semantic token 而非 hex 字面量
