# Acceptance Checklist

皮肤上架前自检清单。逐条手过 + 自动化双轨。

## 子文档

| 文档 | 范围 |
|------|------|
| [functional.md](./functional.md) | 功能不漏（features 全清单逐项） |
| [a11y.md](./a11y.md) | 无障碍验收 |
| [performance.md](./performance.md) | 性能基线（Lighthouse / WebVitals） |
| [security.md](./security.md) | 安全自检（XSS / token 处理 / 路径白名单） |
| [smoke-test.md](./smoke-test.md) | 冒烟脚本（Playwright 等） |

## 自动化要求

- 至少一份 e2e 脚本覆盖：登录 → 浏览 → 详情 → 播放 → 登出
- a11y：axe-core 0 critical
- Lighthouse：performance ≥ 75 / a11y ≥ 90 / best-practices ≥ 90

## 人工验收

- 在 1280 / 768 / 414 三宽度逐页过
- light + dark 主题切换无样式断裂
- 中英文切换文案不溢出
- 键盘 Tab 一遍主流程无遗漏
