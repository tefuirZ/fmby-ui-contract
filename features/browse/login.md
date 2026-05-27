# Features · Browse · Login & Register

登录 + 注册（注册码模式）。

## 路由
- `/login?next=:redirect`
- `/register`

## 数据
- `POST /api/auth/login` → `{ status, user, challenge_id, expires_at }`，成功时由后端设置 Cookie
- `POST /api/auth/mfa/totp/verify` → TOTP 二次验证
- `POST /api/auth/register` → 注册码 + 用户名 + 密码
- `GET /api/auth/entry/status` → 是否需要 setup、是否开放注册
- `GET /api/site/bootstrap` → 站点名、功能开关、安装状态

## UI

| 区块 | 说明 |
|------|------|
| 站点品牌 | logo + 名称 |
| 登录表单 | username / password |
| TOTP challenge | status=`mfa_required` 时显示验证码输入 |
| 错误展示 | 401 → "账号或密码错误"，429 → 限流提示 |
| 注册入口 | 仅当 registration_enabled=true 显示 |
| 注册表单 | code / username / password / confirm |

## 状态
- 提交中禁用按钮
- next 参数白名单（同源），防开放重定向
- 注册码无效（410 / 422）→ 行内提示
- 密码强度：前端校验最小长度（与后端一致），强度条

## 皮肤建议
- 登录后跳 next；非法 next 跳 `/`
- 登录页站点名来自 bootstrap；当前契约没有 hero_url
- 注册成功 → 自动登录 + 跳首页
