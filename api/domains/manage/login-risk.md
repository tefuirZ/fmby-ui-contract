# Manage · Login Risk

登录风控手动解除。该域只写 reset marker，不删除失败登录审计。

## 端点

| Method | Path | 权限 | 说明 |
|--------|------|------|------|
| POST | `/api/manage/login-risk/ip/reset` | `manage:access` + `system:security` | 解除指定来源 IP 当前风控窗口内的登录限流影响 |

账号级解除在 [`users.md`](./users.md)：`POST /api/manage/users/{userId}/login-risk/reset`。

## `POST /api/manage/login-risk/ip/reset`

请求体：

```json
{
  "ip_address": "192.168.1.10",
  "confirm_action": "reset-ip-login-risk",
  "session_confirmation": "reset-ip-login-risk",
  "current_password": null
}
```

字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `ip_address` | string | 需要解除的来源 IP，必须是合法 IPv4 或 IPv6；后端会标准化后写入审计 marker |
| `confirm_action` | string | 固定为 `reset-ip-login-risk` |
| `session_confirmation` | string? | 当站点敏感操作策略为 `session` 时必填，值同 `confirm_action` |
| `current_password` | string? | 当站点敏感操作策略为 `password` 时必填 |

响应：

```json
{
  "id": "192.168.1.10",
  "result": "success",
  "message": "IP 登录风控已解除"
}
```

## 审计与语义

- 该操作写入 `audit_logs`，`action = auth.login.ip_risk_reset`，`target_type = AuthIpAttempt`，`target_id = normalized_ip_address`。
- 后续 IP 登录限流统计从该 marker 之后开始计算。
- 不删除 `auth.login.failed` / `compat.login.failed` 失败审计。
- 只解除 IP 登录限流，不解除账号失败锁定。账号失败锁定需要走用户管理的账号级解除。

## 错误

| code | 场景 |
|------|------|
| `AUTH_REQUIRED` | 未登录 |
| `PERM_DENIED` | 缺少 `manage:access` / `system:security` 或 CSRF 失败 |
| `VALID_FIELD_INVALID` | `ip_address` 无效或敏感操作确认不匹配 |

## skin 实现建议

- 放在站点安全策略页的 IP 登录限流设置附近，不放在单个用户行内。
- 使用敏感操作确认组件，确认标识固定显示为 `reset-ip-login-risk`。
- 文案必须明确：IP 解除不影响账号锁定，账号解除不影响 IP 限流，两者都不删除历史失败审计。
