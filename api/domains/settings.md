# Settings

> 用户设置（profile / playback / appearance）+ 服务器设置（general / security / session-policy）。

---

## 端点速查

### 用户设置（self）

| 路径 | 方法 | 用途 |
|---|---|---|
| `/api/settings/user/profile` | GET, PUT | 用户基本信息（display_name、avatar、email） |
| `/api/settings/user/playback` | GET, PUT | 播放偏好（默认音轨语言、字幕语言、音量、播放速度） |
| `/api/settings/user/appearance` | GET, PUT | 外观偏好（暗色 / 亮色 / 跟随系统、主色调等） |

任何登录用户都能改自己的。**注意**：`appearance` 字段是**主题模式**（dark/light），不是 skin 名字！skin 名字（active_ui_skin）在 `server/general` 设置里。

### 服务器设置（owner / manager）

| 路径 | 方法 | 用途 | Capability |
|---|---|---|---|
| `/api/settings/server/general` | GET, PUT | 站点名 / 首页文案 / 维护横幅 / **active_ui_skin** | `manage:settings:server` |
| `/api/settings/server/security` | GET, PUT | 密码策略 / 注册开关 / CSRF 设置 | `manage:settings:server` |
| `/api/settings/server/session-policy` | GET, PUT | session TTL / max active sessions per user / 设备策略 | `manage:settings:server` |

---

## DTO 概览

### `GET /api/settings/user/profile`

```json
{
  "display_name": "Alice",
  "email": "alice@example.com",
  "avatar_url": null,
  "locale": "zh-CN"
}
```

### `PUT /api/settings/user/profile`

整体替换：

```json
{
  "display_name": "Alice",
  "email": "alice@example.com",
  "avatar_url": null,
  "locale": "zh-CN"
}
```

未传字段视为不改（实际取决于后端实现，建议总是传完整 payload）。

### `GET /api/settings/user/playback`

```json
{
  "default_audio_language": "chi",
  "default_subtitle_language": "chi",
  "default_subtitle_enabled": true,
  "default_volume": 0.8,
  "default_playback_rate": 1.0,
  "skip_intro_seconds": 0,
  "skip_credits_seconds": 0
}
```

### `GET /api/settings/user/appearance`

```json
{
  "theme_mode": "auto",                 // light / dark / auto
  "primary_color": "#5b9bff",
  "compact_mode": false
}
```

> **重要**：theme_mode 是该 skin 内部的"亮色 / 暗色"切换，**不是切换 skin 本身**。同一 skin 通常实现 light / dark 两套配色，由 theme_mode 切换。

### `GET /api/settings/server/general`

```json
{
  "site_name": "我的小媒体库",
  "homepage_message": "欢迎",
  "maintenance_banner": "",
  "support_contact": "mailto:admin@example.com",
  "active_ui_skin": "classic",          // ← 当前激活的 skin 名
  "available_ui_skins": [               // ← 后端扫描出的 skin 列表（read-only）
    { "name": "classic", "display_name": "Classic", "version": "1.0.0" },
    { "name": "modern", "display_name": "Modern", "version": "1.2.3" }
  ]
}
```

### `PUT /api/settings/server/general`

```json
{
  "site_name": "我的小媒体库",
  "homepage_message": "欢迎",
  "maintenance_banner": "",
  "support_contact": "mailto:admin@example.com",
  "active_ui_skin": "modern"            // ← 改这个就切换 skin
}
```

> `available_ui_skins` 是 read-only，PUT 时不能改。

### `GET /api/settings/server/security`

```json
{
  "registration_enabled": false,
  "registration_requires_code": true,
  "password_min_length": 8,
  "password_require_mixed_case": true,
  "password_require_digits": true,
  "password_require_symbols": false,
  "csrf_strict_origin_check": true
}
```

### `GET /api/settings/server/session-policy`

```json
{
  "session_ttl_seconds": 2592000,         // 30 day
  "session_idle_timeout_seconds": 604800, // 7 day
  "max_active_sessions_per_user": 5,
  "kick_oldest_on_overflow": true,
  "remember_me_default": true
}
```

---

## 关键流程

### 用户改外观偏好

```
useQuery("/api/settings/user/appearance")
  → 当前: { theme_mode: "auto" }

用户切到 "dark" → mutation
  PUT /api/settings/user/appearance
  body: { theme_mode: "dark", primary_color: "#5b9bff", compact_mode: false }
  → 200 + 新值

skin 立刻重新 apply theme（不需重启 / 刷新）
```

### 管理员切换 active skin

```
manageSettingsPage:
  GET /api/settings/server/general
    → { active_ui_skin: "classic", available_ui_skins: [...] }

下拉选 "modern" → 点保存
  PUT /api/settings/server/general
    body: { ..., active_ui_skin: "modern" }
  → 200

下次任何用户刷新页面 → fmby fallback 路由读最新值 → 加载 modern skin
```

---

## 错误

| code | 场景 |
|---|---|
| `forbidden` | 用户无 `manage:settings:server`（改服务器设置） |
| `invalid_value` | 字段值不合法（如 `theme_mode: "purple"`） |
| `skin_not_found` | active_ui_skin 改成不存在的 skin |
| `weak_password_policy` | 改 security 时密码策略太弱被拒 |

---

## 与其它域的关系

- `bootstrap.site.*` 字段来自 `server/general`
- `bootstrap.features.registration_enabled` 来自 `server/security`
- 用户登录页面"是否显示注册按钮" → 看 bootstrap 或读 security
- 用户角色 / capability 的修改 → 在 [`manage/users.md`](./manage/users.md)（不在 settings）

---

## skin 实现建议

- 用户设置页：左侧 tab + 右侧表单，每 tab 一个端点
- 服务器设置页：仅 manager 可见（用 CapabilityGuard）
- skin 切换 dropdown：从 `available_ui_skins` 渲染，当前 = `active_ui_skin`
- theme_mode = auto 时：用 `prefers-color-scheme` media query
- 表单提交后乐观更新 + revalidate

---

## 给 skin 作者的特别提示

active_ui_skin 修改后**不会立刻**让当前 skin 切换——只有刷新页面（或下次 fallback）才会生效。skin 应：

- 提示用户 "已保存，刷新页面后生效"
- 或自动 `window.location.reload()`（更激进）

如果你的 skin 想"内嵌"切换其它 skin 的预览（不实际持久化），那是 skin 自己的功能，与 fmby 后端无关。
