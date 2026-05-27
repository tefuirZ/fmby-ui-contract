# Features · Manage · License

## 路由

- `/manage/site/license`

## 数据

- API：[`../../api/domains/manage/license.md`](../../api/domains/manage/license.md)

## UI 范围

| 区块 | 要求 |
|---|---|
| 当前状态 | runtime_state、business_access_allowed、过期 / 宽限时间、最近错误 |
| 实时连接 | realtime_enabled、realtime_status、最近事件 / 错误 |
| 权益 | entitlements 按 feature / limit / policy / other 分组展示 |
| 用量 | usage 与 limit entitlement 对比 |
| 设备码激活 | user_code、verification_uri、过期时间、轮询状态 |
| 激活 token | 手动输入 token 激活 |
| 手动心跳 | 明确按钮触发，展示结果 |

## 状态

- `business_access_allowed=false`：业务能力不可用，应显示阻断态。
- `runtime_state=grace`：展示宽限截止时间。
- `poll_status=expired|denied`：停止轮询并给出重试入口。
- `403`：当前用户缺少 `system:security`。
