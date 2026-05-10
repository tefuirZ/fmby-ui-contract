# Acceptance · Security

## XSS

- [ ] 所有用户输入渲染时转义（React/Vue 默认；Svelte/原生需自检）
- [ ] dangerouslySetInnerHTML / v-html 严格审查
- [ ] 用户头像 URL 白名单校验（同源 + imghost host）

## Token

- [ ] access_token 不放 URL
- [ ] localStorage 存 token 标准；不放 cookie 除非启用 SameSite=Strict + HttpOnly（皮肤无能力，看后端）
- [ ] 登出彻底清 localStorage + sessionStorage + 内存

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
