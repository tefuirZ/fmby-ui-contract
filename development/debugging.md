# Development · Debugging

## 常见错误

### CORS
dev 必须用 vite proxy。生产单端口部署不会有 CORS。

### 401 频繁
- token 未存 / 未发；检查 Authorization header
- refresh 失败 → 看是否 refresh_token 过期

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
