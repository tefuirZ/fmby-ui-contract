# Features · Settings · Server Security

站点安全设置（admin）。

## 路由
- `/manage/site/settings` 中的"安全"分组

## 数据
- `GET /api/settings/server/security`
- `PUT /api/settings/server/security`
- `POST /api/manage/login-risk/ip/reset`

## 字段

| 字段 | 说明 |
|------|------|
| login_mode | 登录模式；当前 UI 只允许 `password` |
| login_rate_limit_enabled | 是否启用来源 IP 登录限流 |
| login_rate_limit_max_attempts | IP 限流窗口内最大失败次数 |
| login_rate_limit_window_seconds | IP 限流窗口秒数 |
| failed_login_lockout_enabled | 是否启用账号失败锁定 |
| failed_login_lockout_threshold | 账号失败锁定阈值 |
| failed_login_lockout_seconds | 账号锁定时长 |
| sensitive_action_confirmation | 敏感操作确认方式：`none` / `password` / `session` |
| require_current_password_for_profile_change | 修改个人资料是否要求当前密码 |

## 交互

- IP 登录限流和账号失败锁定必须分区展示，不能继续用“登录限流 / 失败保护”模糊文案混在一起。
- IP 登录限流区必须提供“解除 IP 风控”入口：输入来源 IP，使用敏感操作确认，调用 `POST /api/manage/login-risk/ip/reset`。
- 账号失败锁定区只说明账号级解除入口在用户管理；不要在站点安全页做按用户名解除。
- 文案必须说明两类解除互不替代：账号解除不影响 IP 限流，IP 解除不影响账号失败锁定。
- 解除动作不得在前端删除、隐藏或改写失败登录审计。

## 皮肤建议
- 该页需要 `system:security` capability，不只是普通登录态。
- 锁定策略改动和风控解除都会写入审计日志，UI 提示。
