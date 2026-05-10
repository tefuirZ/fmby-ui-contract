# Features · Settings · Server Session Policy

会话策略（admin）。

## 路由
- `/manage/site/settings` 中的"会话"分组

## 数据
- `PUT /api/site/settings` 子集

## 字段

| 字段 | 说明 |
|------|------|
| access_token_ttl_secs | access_token 时长（默认 15min） |
| refresh_token_ttl_secs | refresh_token 时长（默认 7d） |
| remember_me_ttl_secs | "记住我"时长（默认 30d） |
| max_sessions_per_user | 单用户最大并发会话数（0=不限） |
| force_logout_on_password_change | 改密后是否强踢全部会话 |

## 皮肤建议
- 调整 ttl 后提示影响：「下次登录生效，已发出的 token 不变」
- max_sessions 减小后超出部分按 last_seen 排序自动踢
