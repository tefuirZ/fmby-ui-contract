# Design · Accessibility

最低 WCAG 2.1 AA。

## 键盘

- 所有交互元素 Tab 可达
- 焦点环可见，使用 `:focus-visible`
- Modal / Drawer 焦点陷阱 + Esc 关闭
- 列表方向键导航（推荐）

## 视觉

- 文本对比度 ≥ 4.5:1
- 大文本（≥18px / 14px bold）≥ 3:1
- 不仅靠颜色传达信息（状态用图标 + 文字）
- 减少动效：`prefers-reduced-motion: reduce` 时禁用大动画

## 语义

- 用语义化 HTML：`<button>`、`<nav>`、`<main>`、`<aside>`、`<table>`
- 表单 `<label for>` + `aria-describedby` 错误关联
- 图标按钮 `aria-label`
- 列表 `<ul>/<ol>`，不要用 div 模拟

## 可识别

- 图片 `alt`（装饰图 alt=""）
- 海报：`alt="电影标题 海报"`
- 头像：`alt="用户名"`

## 屏幕阅读

- toast 用 `role="status"` 或 `aria-live="polite"`
- 错误用 `role="alert"`
- 加载态 `aria-busy="true"`

## 测试基线

- axe-core 0 violations on 主要页面
- VoiceOver / NVDA 通读首页 + 播放页 + 管理列表无阻塞
