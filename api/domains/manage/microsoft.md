# Manage · Microsoft Auth

> Microsoft Graph 授权账号管理，用于 OneDrive / SharePoint 类型挂载。

---

## 权限

所有端点要求：

- 登录态
- `manage:mounts`
- 超级管理员身份
- 相关 license entitlement

---

## 端点速查

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/manage/microsoft/auth/config-status` | OAuth app 配置状态 |
| GET | `/api/manage/microsoft/auth/profiles?providerType=&authProfileId=&tenantId=&driveId=&serviceKind=` | 授权账号列表 |
| POST | `/api/manage/microsoft/auth/start` | 基于 provider/tenant/drive 启动 OAuth |
| POST | `/api/manage/microsoft/auth/complete` | 完成 OAuth callback |
| POST | `/api/manage/microsoft/auth/token/start` | 启动 token 辅助授权 |
| POST | `/api/manage/microsoft/auth/token/complete` | 完成 token 辅助授权 |
| POST | `/api/manage/microsoft/auth/token/drives` | 用 token 枚举 drives |
| POST | `/api/manage/microsoft/auth/token/sites` | 用 token 搜索 sites |
| POST | `/api/manage/microsoft/auth/token/import` | 导入 token 授权账号 |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/enable` | 启用账号 |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/disable` | 禁用账号 |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/recover` | 恢复账号 |
| DELETE | `/api/manage/microsoft/auth/accounts/{account_id}` | 删除账号 |
| GET | `/api/manage/microsoft/auth/accounts/{account_id}/drives` | 账号 drives |
| GET | `/api/manage/microsoft/auth/accounts/{account_id}/sites?q=` | 账号 sites |
| GET | `/api/manage/microsoft/auth/accounts/{account_id}/sites/{site_id}/drives` | site drives |
| GET | `/api/manage/microsoft/auth/accounts/{account_id}/drives/{drive_id}/quota` | drive quota |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/write/create-folder` | 创建文件夹 |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/write/rename` | 重命名 |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/write/move` | 移动 |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/write/delete` | 删除 |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/write/upload-session` | 创建上传会话 |
| POST | `/api/manage/microsoft/auth/accounts/{account_id}/delta` | delta 增量 |

当前 classic skin 主要使用配置状态、profiles、OAuth/token 辅助授权与导入。写文件类端点供挂载能力和后续 UI 使用。

---

## 基础枚举

| 字段 | 值 |
|---|---|
| `provider_type` | `microsoft-global` / `microsoft-china` |
| `service_kind` | `onedrive` / `sharepoint` |
| `status` | `active` / `disabled` / `auth-expired` / `unreachable` / 其它后端状态 |

请求同时接受 camelCase 与 snake_case，classic skin 使用 camelCase。

---

## 配置状态

```json
{
  "items": [
    {
      "provider_type": "microsoft-global",
      "client_id_configured": true,
      "client_secret_configured": true,
      "redirect_uri": "https://fmby.example.com/oauth/microsoft/callback",
      "client_id_source": "env",
      "token_key_status": "ready"
    }
  ]
}
```

---

## 授权账号

```json
{
  "items": [
    {
      "id": "ms_001",
      "auth_profile_id": "profile_001",
      "provider_type": "microsoft-global",
      "tenant_id": "common",
      "drive_id": "drive_001",
      "service_kind": "onedrive",
      "status": "active",
      "principal_id": "principal",
      "user_principal_name": "user@example.com",
      "display_name": "User",
      "last_used_at": null,
      "last_success_at": null,
      "last_error_at": null,
      "last_error_message": null,
      "throttled_until": null,
      "consecutive_throttle_count": 0,
      "created_at": "2026-05-27T10:00:00Z",
      "updated_at": "2026-05-27T10:00:00Z"
    }
  ]
}
```

---

## OAuth 流程

启动：

```json
{
  "providerType": "microsoft-global",
  "tenantId": "common",
  "driveId": "drive_001",
  "serviceKind": "onedrive",
  "authProfileId": null
}
```

响应：

```json
{
  "authorization_id": "auth_001",
  "auth_profile_id": "profile_001",
  "provider_type": "microsoft-global",
  "tenant_id": "common",
  "drive_id": "drive_001",
  "service_kind": "onedrive",
  "redirect_uri": "https://...",
  "authorize_url": "https://login.microsoftonline.com/..."
}
```

完成：

```json
{
  "authorizationId": "auth_001",
  "callbackUrl": "https://fmby.example.com/oauth/microsoft/callback?code=..."
}
```

响应返回授权账号基础信息。

---

## Token 辅助流程

用于在页面内拿到临时 token 后枚举 drive/site，再导入账号。不要把 token 持久化到前端存储。

```json
{
  "providerType": "microsoft-global",
  "accessToken": "...",
  "refreshToken": "...",
  "siteId": "optional"
}
```

drives 响应：

```json
{
  "items": [
    {
      "id": "drive_001",
      "name": "OneDrive",
      "drive_type": "personal",
      "web_url": "https://...",
      "quota": {
        "total": 1000,
        "used": 100,
        "remaining": 900,
        "deleted": 0,
        "state": "normal"
      }
    }
  ]
}
```

导入：

```json
{
  "providerType": "microsoft-global",
  "serviceKind": "onedrive",
  "accessToken": "...",
  "refreshToken": "...",
  "tenantId": "common",
  "driveId": "drive_001",
  "authProfileId": null,
  "siteId": null
}
```

---

## 文件写操作

写操作请求：

| 操作 | body |
|---|---|
| create-folder | `{ "parent_path": null, "name": "Movies" }` |
| rename | `{ "item_path": "/old", "name": "new" }` |
| move | `{ "item_path": "/a", "target_parent_path": "/b", "name": null }` |
| delete | `{ "item_path": "/a" }` |
| upload-session | `{ "item_path": "/a/file.mkv", "conflict_behavior": "rename" }` |
| delta | `{ "path": "/", "delta_link": null }` |

这些端点是管理端能力，不等同于普通播放流读取；UI 必须显示明确确认。
