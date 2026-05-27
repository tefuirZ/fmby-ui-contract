# Settings

> 用户设置（profile / playback / appearance）+ 服务器设置（general / security / session-policy）。

---

## 端点速查

### 用户设置

| 路径 | 方法 | 用途 |
|---|---|---|
| `/api/settings/user/profile` | GET, PUT | 当前用户资料 |
| `/api/settings/user/playback` | GET, PUT | 当前用户播放偏好 |
| `/api/settings/user/appearance` | GET, PUT | 当前用户外观偏好 |

### 服务器设置

| 路径 | 方法 | 权限 | 用途 |
|---|---|---|---|
| `/api/settings/server/general` | GET, PUT | `manage:access` | 站点名、注册开关、active skin、功能开关 |
| `/api/settings/server/security` | GET, PUT | `manage:access` | 登录限流、锁定、敏感操作确认 |
| `/api/settings/server/session-policy` | GET, PUT | `manage:access` | session TTL、记住我、兼容 fallback |

---

## 用户资料

`GET /api/settings/user/profile`

```json
{
  "user_id": "u_001",
  "username": "alice",
  "display_name": "Alice",
  "avatar_url": null,
  "default_library_id": null,
  "email": "alice@example.com",
  "bio": null,
  "current_password_required": true
}
```

`PUT` 请求：

```json
{
  "display_name": "Alice",
  "avatar_url": null,
  "default_library_id": null,
  "email": "alice@example.com",
  "bio": null,
  "current_password": "required when backend asks"
}
```

---

## 播放偏好

```json
{
  "default_subtitle_language": "zh",
  "default_audio_language": "zh",
  "auto_resume": true,
  "autoplay_next_episode": true,
  "prefer_external_player": false
}
```

`GET` 与 `PUT` 同形，`PUT` 是整体替换。

---

## 外观偏好

```json
{
  "theme": "system",
  "poster_density": "comfortable",
  "reduced_motion": false,
  "home_sections": ["resume", "recently_added"]
}
```

字段含义：

| 字段 | 说明 |
|---|---|
| `theme` | skin 内部亮暗模式，通常为 `light` / `dark` / `system` |
| `poster_density` | 海报密度 |
| `reduced_motion` | 减少动效 |
| `home_sections` | 首页 section 顺序 / 开关 |

注意：`theme` 不是 skin 名。切换 active skin 在 server general。

---

## Server General

```json
{
  "site_name": "FMBY",
  "registration_enabled": true,
  "homepage_message": "",
  "maintenance_banner": "",
  "support_contact": "",
  "active_ui_skin": "classic",
  "pan115_imghost_enabled": false,
  "pan115_provider_enabled": true
}
```

`PUT` 同形。`active_ui_skin` 修改后，下次刷新 / fallback 才会加载新 skin；当前已运行页面不会被服务端主动替换。

可用 skin 列表来自 [`site.md`](./site.md) 的 `GET /api/site/skins`，不在 `server/general` 响应里。

---

## Server Security

```json
{
  "login_mode": "password",
  "login_rate_limit_enabled": true,
  "login_rate_limit_max_attempts": 5,
  "login_rate_limit_window_seconds": 300,
  "failed_login_lockout_enabled": true,
  "failed_login_lockout_threshold": 10,
  "failed_login_lockout_seconds": 1800,
  "sensitive_action_confirmation": "password",
  "require_current_password_for_profile_change": true
}
```

---

## Server Session Policy

```json
{
  "user_session_ttl_seconds": 2592000,
  "admin_session_ttl_seconds": 86400,
  "token_rotation_enabled": true,
  "remember_me_ttl_days": 30,
  "token_rotation_policy": "sliding",
  "single_session_for_admins": false,
  "compat_legacy_session_fallback_enabled": false
}
```

虽然字段名里保留 `token_rotation`，Web UI 仍使用 Cookie session，不使用前端 access / refresh token。

---

## 与其它域的关系

- `bootstrap.site.*` 来自 server general。
- `bootstrap.features.registration_enabled` 来自 server general。
- 登录页是否显示注册入口：优先看 `/api/auth/entry/status`，也可看 bootstrap。
- `GET /api/site/skins` 提供 skin 列表。
- 用户角色 / capability 修改在 [`manage/users.md`](./manage/users.md)。

---

## 错误

错误体见 [`../errors.md`](../errors.md)。常见：

| code | 场景 |
|---|---|
| `AUTH_REQUIRED` | 未登录 |
| `PERM_DENIED` | 缺少管理权限或 CSRF 失败 |
| `VALID_FIELD_INVALID` | 字段值不合法 |
| `VALID_ENTITY_NOT_FOUND` | active_ui_skin 等引用不存在 |

---

## skin 实现建议

- 用户设置页按 profile / playback / appearance 拆 tab。
- 服务器设置只给 `manage:access` 用户展示。
- active skin 切换保存后提示刷新，或直接 `window.location.reload()`。
- 所有用户可见时间按 `Asia/Shanghai` 展示。
