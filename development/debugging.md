# Development · Debugging

## 常见错误

### CORS
dev 必须用 vite proxy。生产单端口部署不会有 CORS。

### 401 频繁
- Cookie 未发；检查 `credentials: "same-origin"` 和浏览器 Cookie 策略
- 401 → Cookie session 过期或缺失，跳 `/login?next=...`；Web UI 不使用 refresh token。

### 403
- 用户角色不够；切换 admin 测试
- 后端 ACL 配置错误（不该是皮肤问题）

### 502 / 504
- pan115 上游问题；查后端日志
- 重试 + 提示用户

### 皮肤白屏
- 看 console / network；manifest 加载失败
- 校验 manifest schema

## 工具

- 浏览器 devtools：Network / Console / Application（localStorage）
- React Devtools / Vue Devtools
- axe DevTools：a11y 自检

## Mock 后端

- MSW（Mock Service Worker）拦截 fetch，返回 fixture
- 模板 repo 提供 fixture/ 目录的 JSON 示例

## 日志开关

`localStorage.setItem('fmby:debug', '1')` 后 api-client 输出详细日志。

## 性能

- Lighthouse CI：每次发版跑
- React Profiler：找耗时组件
