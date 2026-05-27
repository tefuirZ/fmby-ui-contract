# Features · Settings · Server Security

站点安全设置（admin）。

## 路由
- `/manage/site/settings` 中的"安全"分组

## 数据
- `GET /api/settings/server/security`
- `PUT /api/settings/server/security`

## 字段

| 字段 | 说明 |
|------|------|
| login_mode | 登录模式；当前 UI 只允许 `password` |
| login_rate_limit_enabled | 是否启用登录限流 |
| login_rate_limit_max_attempts | 限流窗口内最大失败次数 |
| login_rate_limit_window_seconds | 限流窗口秒数 |
| failed_login_lockout_enabled | 是否启用失败锁定 |
| failed_login_lockout_threshold | 连续失败锁定阈值 |
| failed_login_lockout_seconds | 锁定时长 |
| sensitive_action_confirmation | 敏感操作确认方式：`none` / `password` / `session` |
| require_current_password_for_profile_change | 修改个人资料是否要求当前密码 |

## 皮肤建议
- 该页需要 `system:security` capability，不只是普通登录态。
- 锁定策略改动写入审计日志，UI 提示。
