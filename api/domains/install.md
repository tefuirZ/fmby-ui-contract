# Install Domain

> 首次安装与恢复模式接口。正常已安装站点仍可能返回 `install_required=false` 的状态，skin 应保留 `/install` 页面用于恢复。

---

## 端点速查

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/install/status` | 安装 / 恢复状态总览 |
| POST | `/api/install/probe/database` | 探测数据库，可选执行迁移 |
| POST | `/api/install/probe/redis` | 探测 Redis |
| POST | `/api/install/config` | 保存运行时数据库 / Redis 配置 |
| POST | `/api/install/dependencies/install` | 尝试安装 ffmpeg / ffprobe 依赖 |
| POST | `/api/install/complete` | 写入安装锁，完成安装 |

安装模式接口不要求登录；生产主题必须谨慎展示，所有写操作都需要 `confirm_action` 或明确的请求字段。

---

## `GET /api/install/status`

关键响应字段：

```json
{
  "installed": false,
  "install_required": true,
  "recovery_mode": false,
  "config_editable": true,
  "lock": {
    "exists": false,
    "path": "/data/.fmby-installed",
    "completed_at": null,
    "fmby_version": null,
    "message": "..."
  },
  "config": {
    "database_url_masked": null,
    "database_source": "missing",
    "redis_url_masked": null,
    "redis_source": "missing",
    "data_dir": "/data",
    "config_file": "/data/config.toml",
    "install_lock_file": "/data/.fmby-installed",
    "recovery_token_file": "/data/recovery.token",
    "pan115_kek_file": "/data/pan115.kek"
  },
  "database": {
    "status": "error",
    "can_connect": false,
    "schema_ready": false,
    "user_count": null,
    "admin_user_count": null,
    "message": "..."
  },
  "redis": {
    "status": "skipped",
    "can_connect": false,
    "message": "..."
  },
  "dependencies": {
    "ffprobe": { "name": "ffprobe", "required": true, "installed": false, "version": null, "message": "..." },
    "ffmpeg": { "name": "ffmpeg", "required": true, "installed": false, "version": null, "message": "..." },
    "install_plan": { "supported": false, "package_manager": null, "command": null, "manual_url": null, "message": "..." }
  },
  "system": {
    "os": "linux",
    "arch": "x86_64",
    "allow_host_dependency_install": false
  },
  "messages": []
}
```

枚举：

| 字段 | 值 |
|---|---|
| `status` | `ok` / `warning` / `error` / `skipped` |
| `*_source` | `env` / `file` / `default` / `missing` |

---

## 写操作

### 探测数据库

```json
{
  "database_url": "postgres://...",
  "run_migrations": true
}
```

返回 `DatabaseProbeResponse`。

### 探测 Redis

```json
{
  "redis_url": "redis://..."
}
```

返回 `RedisProbeResponse`。

### 保存配置

```json
{
  "database_url": "postgres://...",
  "redis_url": "redis://...",
  "confirm_action": "save-runtime-config",
  "recovery_token": "optional"
}
```

返回：

```json
{
  "saved": true,
  "restart_required": true,
  "config": {},
  "messages": []
}
```

### 安装依赖

```json
{
  "confirm_action": "install-runtime-dependencies",
  "package_manager": "apt"
}
```

可能长达 15 分钟，classic skin 使用约 930 秒超时。

### 完成安装

```json
{
  "confirm_action": "complete-installation"
}
```

返回：

```json
{
  "completed": true,
  "restart_recommended": true,
  "lock": {}
}
```

---

## 错误

安装接口错误体是 `{ "code", "message", "retryable" }`：

| code | 含义 |
|---|---|
| `INSTALL_BAD_REQUEST` | 请求字段或确认短语错误 |
| `INSTALL_CONFLICT` | 当前状态不允许该操作 |
| `INSTALL_FORBIDDEN` | 配置不可编辑或 recovery token 无效 |
| `INSTALL_INTERNAL_ERROR` | 内部错误 |
