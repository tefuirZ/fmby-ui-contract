# Features · Settings · Server Session Policy

会话策略（`manage:access`）。

## 路由
- `/manage/site/settings` 中的"会话"分组

## 数据
- `GET /api/settings/server/session-policy`
- `PUT /api/settings/server/session-policy`

## 字段

| 字段 | 说明 |
|------|------|
| user_session_ttl_seconds | 普通用户 session TTL |
| admin_session_ttl_seconds | 管理用户 session TTL |
| token_rotation_enabled | 是否启用 token rotation |
| remember_me_ttl_days | 记住我天数 |
| token_rotation_policy | token rotation 策略 |
| single_session_for_admins | 管理用户是否单端登录 |
| compat_legacy_session_fallback_enabled | 兼容层 legacy session fallback |

## 皮肤建议
- 调整 TTL 后提示影响：「现有 session 可能在下一次校验 / 续期时体现」
- 单端策略变化后提示用户重新登录验证
