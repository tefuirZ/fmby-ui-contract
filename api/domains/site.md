# Site Domain

> 主题启动前后读取的站点级公开接口。`/api/site/*` 不要求登录，但会在有 Cookie 时返回当前用户 bootstrap 信息。

---

## 端点速查

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/site/bootstrap` | 返回 `window.__FMBY_BOOTSTRAP__` 同形 JSON |
| GET | `/api/site/skins` | 可用 skin 列表与当前 active skin |

---

## `GET /api/site/bootstrap`

该端点与注入到 HTML 的 `window.__FMBY_BOOTSTRAP__` 字段一致。开发期 Vite 不会注入 HTML bootstrap 时，skin 可以主动请求该端点或使用本地 mock。

```json
{
  "contract_version": "0.1.0",
  "fmby_version": "0.2.0",
  "active_skin": "classic",
  "site": {
    "site_name": "FMBY",
    "homepage_message": null,
    "maintenance_banner": null,
    "support_contact": null
  },
  "auth": {
    "csrf_cookie_name": "fmby_csrf",
    "session_cookie_name": "fmby_session",
    "csrf_header_name": "X-CSRF-Token",
    "logged_in": true,
    "user_id": "u_xxx",
    "username": "admin",
    "display_name": "管理员",
    "roles": ["SuperAdmin"],
    "capabilities": ["manage:access"]
  },
  "api": {
    "base_url": "/api"
  },
  "features": {
    "pan115_imghost_enabled": false,
    "pan115_provider_enabled": false,
    "registration_enabled": true
  },
  "install": {
    "required": false,
    "installed": true
  }
}
```

字段规则：

| 字段 | 规则 |
|---|---|
| `api.base_url` | 当前固定 `/api`。不要拼跨域地址 |
| `auth.logged_in` | 仅表示本次请求带来的登录态；权威会话仍建议调 `/api/session` |
| `auth.roles` | 展示用 |
| `auth.capabilities` | UI 权限判断用 |
| `install.required` | true 时应展示 `/install` 流程 |
| `features.*` | 控制功能可用性，但页面不应直接隐藏成 404 |

响应头：`Cache-Control: no-store`。

完整 schema：[`../../schemas/bootstrap.schema.json`](../../schemas/bootstrap.schema.json)。

---

## `GET /api/site/skins`

```json
{
  "active": "classic",
  "skins": [
    {
      "name": "classic",
      "display_name": "Classic",
      "version": "0.1.0",
      "description": "内置参考主题",
      "preview": null
    }
  ]
}
```

该接口用于外观设置页选择站点默认 skin。切换实际写入走 [`settings.md`](./settings.md) 的 `/api/settings/server/general`。

---

## 前端约束

- Router basename 是 `/`；Vite build `base` 才是 `/_assets/{skin}/`。
- HTML bootstrap 与 `/api/site/bootstrap` 都不能缓存。
- 不要读取 `/emby` / `/jellyfin` 作为普通 skin 数据源。
