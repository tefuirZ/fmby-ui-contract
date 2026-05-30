# Acceptance · Security

## XSS

- [ ] 所有用户输入渲染时转义（React/Vue 默认；Svelte/原生需自检）
- [ ] dangerouslySetInnerHTML / v-html 严格审查
- [ ] 用户头像 URL 白名单校验（同源 + imghost host）

## Token

- [ ] 站内登录使用 Cookie session + CSRF，不把 session token 放 URL
- [ ] API Token 明文只在创建成功时展示一次，不写入 localStorage / sessionStorage / IndexedDB / query cache
- [ ] Bearer API Token 只在开发者 API Explorer 的 `/api/open/v1/*` 测试流里使用，且 `credentials: omit`
- [ ] 不在 console、错误上报、审计展示或 URL 中输出 Authorization / Cookie / API Token
- [ ] 登出彻底清前端内存状态，不伪造或自行生成 CSRF token

## WebSocket

- [ ] 第一方 `/api/playback/realtime/ws` 只使用 Cookie session + Origin 校验，不把 session、token、api key 或 Bearer 放入 query/header
- [ ] `scope=admin` 只作为订阅范围处理，不作为认证材料处理
- [ ] WS URL 从 `window.location.origin` 派生，不接受外部绝对地址或协议相对 URL
- [ ] 管理端 WS payload 不展示、不缓存播放直链、stream token、Cookie、Authorization、PG / Redis URL、provider 凭据或授权材料
- [ ] realtime envelope、session id、用户 id、client info、token、api key、URL 不写入 localStorage / sessionStorage / IndexedDB
- [ ] WS 断线、解析失败或被后端拒绝时进入 degraded / disabled，并保留 HTTP fallback
- [ ] `/embywebsocket` / `/jellyfinwebsocket` 的 compat `api_key` 不复用到第一方 `/api/playback/realtime/ws`

## 跳转

- [ ] `next` 参数白名单（同源），防开放重定向
- [ ] 外链加 `rel="noopener noreferrer"`

## 上传

- [ ] mime + size 前端预校验
- [ ] 图片预览前先后端返回再渲染（防客户端篡改）

## 第三方

- [ ] 不引外部 CDN（CSP）
- [ ] npm 依赖跑 audit；high/critical 不上线

## 调试

- [ ] 生产构建关 source-map（或单独发到内部）
- [ ] 调试日志 production 全关
- [ ] 不在 console 输出 token / 密码

## 配置

- [ ] CSP header 由后端发；皮肤不应触发 `unsafe-inline`
- [ ] HTTPS 强制（生产）
