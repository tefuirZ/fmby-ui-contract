# Manage · License

> 授权与订阅管理接口。当前 classic skin 页面路径为 `/manage/site/license`。

---

## 权限

所有端点要求登录态 + `system:security` capability。

---

## 端点速查

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/manage/license/status` | 授权状态、权益、用量 |
| POST | `/api/manage/license/device-flow` | 开始设备码激活 |
| POST | `/api/manage/license/device-flow/poll` | 轮询设备码结果 |
| POST | `/api/manage/license/activation-token` | 使用激活 token |
| POST | `/api/manage/license/heartbeat` | 手动心跳 |

写操作会写入审计日志。

---

## 状态 DTO

`LicenseStatusResponse` 关键字段：

```json
{
  "runtime_state": "active",
  "business_access_allowed": true,
  "server_base_url": "https://license.example.com",
  "realtime_enabled": true,
  "realtime_status": "connected",
  "protocol_version": 1,
  "instance_id": "inst_xxx",
  "instance_public_key": "...",
  "activation_id": "act_xxx",
  "license_id": "lic_xxx",
  "lease_id": "lease_xxx",
  "product_code": "fmby",
  "issued_at": "2026-05-27T10:00:00Z",
  "not_before": "2026-05-27T10:00:00Z",
  "expires_at": "2027-05-27T10:00:00Z",
  "grace_expires_at": null,
  "next_heartbeat_at": "2026-05-27T11:00:00Z",
  "last_heartbeat_at": "2026-05-27T10:00:00Z",
  "last_error_code": null,
  "last_error_message": null,
  "last_error_at": null,
  "last_realtime_connected_at": "2026-05-27T10:00:00Z",
  "last_realtime_event_id": null,
  "last_realtime_event_kind": null,
  "last_realtime_event_at": null,
  "last_realtime_error": null,
  "last_realtime_error_at": null,
  "realtime_blocked_reason": null,
  "realtime_blocked_at": null,
  "device_flow": null,
  "entitlements": [
    { "key": "limit.users", "value": 20 }
  ],
  "usage": {
    "user_count": 5,
    "admin_count": 1,
    "library_count": 2,
    "storage_mount_count": 3,
    "pan115_mount_count": 0,
    "pan115_share_mount_count": 0,
    "microsoft_mount_count": 1,
    "microsoft_account_count": 1,
    "upstream_source_count": 1,
    "upstream_emby_count": 1,
    "upstream_apple_cms_count": 0,
    "active_playback_session_count": 0,
    "open_api_token_count": 2
  }
}
```

`runtime_state`: `unactivated` / `pending` / `active` / `grace` / `expired` / `invalid`。
`realtime_status`: `disabled` / `idle` / `ready` / `connected` / `error` / `blocked`。

---

## 激活流程

### 设备码

```http
POST /api/manage/license/device-flow
```

返回：

```json
{
  "status": {
    "device_flow": {
      "device_code": "...",
      "user_code": "ABCD-EFGH",
      "verification_uri": "https://...",
      "verification_uri_complete": "https://...",
      "expires_at": "2026-05-27T10:10:00Z",
      "poll_interval_secs": 5
    }
  }
}
```

按 `poll_interval_secs` 调：

```http
POST /api/manage/license/device-flow/poll
```

响应：

```json
{
  "status": {},
  "poll_status": "pending"
}
```

`poll_status`: `pending` / `authorized` / `expired` / `denied`。

### 激活 token

```json
{
  "activationToken": "..."
}
```

响应：

```json
{
  "status": {}
}
```

后端也接受 `activation_token`。

---

## UI 要求

- `business_access_allowed=false` 时应展示明确阻断态，不要把业务功能显示为普通空态。
- 权益值是 JSON value，skin 必须容忍 bool / integer / string / object。
- 轮询设备码用递归 `setTimeout`，不要 `setInterval`。
