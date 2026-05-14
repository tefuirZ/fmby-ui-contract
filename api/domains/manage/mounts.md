# Manage · Mounts

挂载 = 一个已命名的 `StorageProvider` 实例。当前主线面向 WebUI 的企业级闭环 provider 为：

- `local`
- `alist`
- `openlist`
- `microsoft-global`
- `microsoft-china`
- `pan115`
- `pan115-share`

历史类型 `webdav` / `s3-compatible` 只保留只读历史展示，不允许在当前主线继续新建。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/manage/mounts` | 挂载列表 |
| POST | `/api/manage/mounts` | 新建挂载 |
| GET | `/api/manage/mounts/{mountId}` | 挂载详情 |
| PATCH | `/api/manage/mounts/{mountId}` | 编辑挂载 |
| DELETE | `/api/manage/mounts/{mountId}` | 删除挂载 |
| POST | `/api/manage/mounts/{mountId}/validate` | 校验来源可访问性 |
| POST | `/api/manage/mounts/{mountId}/refresh-access` | 刷新远端访问信息 |
| POST | `/api/manage/mounts/browse-directories` | 通用目录浏览 |

## Provider 矩阵

| provider_type | 创建态目录浏览 | 详情态目录浏览 | 说明 |
|---|---|---|---|
| `local` | 支持 | 支持 | 创建时浏览宿主机绝对路径；媒体库绑定时浏览 mount 根内的相对子目录。 |
| `alist` / `openlist` | 支持 | 支持 | 根路径与媒体库子路径都应优先通过目录浏览器选择，不建议手填。 |
| `microsoft-global` / `microsoft-china` | 支持 | 支持 | 依赖已导入 token + 已选择 drive/site。 |
| `pan115` | 走专用 API | 走专用 API | 根路径保存目录 `cid`；不要把 `browse-directories` 当成普通 115 浏览真相。 |
| `pan115-share` | 支持 | 支持 | 根路径固定为虚拟根 `/`；分享项在 `config_json.shares[]` 内维护，`alias` 是一级虚拟目录。 |

## DTO

`ManagedMountDetailResponse`：

```jsonc
{
  "mount": {
    "id": "mount_xxx",
    "name": "115 分享 - 电影合集",
    "mount_type": "Pan115Share",
    "type_label": "115 分享",
    "path_label": "/电影合集",
    "health_status": "healthy|attention|critical",
    "capabilities": ["list", "random_read", "read_sidecar", "generate_play_target"],
    "reference_counts": {
      "library_source_count": 2,
      "media_source_count": 318,
      "sidecar_asset_count": 42
    }
  },
  "provider_type": "Pan115Share",
  "root_path": "/",
  "config_json": {
    "client_type": "chrome",
    "shares": [
      {
        "id": "share_item_a",
        "alias": "电影合集",
        "share_code": "abc123",
        "receive_code": "qwer",
        "sort_order": 0,
        "enabled": true
      },
      {
        "id": "share_item_b",
        "alias": "纪录片",
        "share_code": "https://115.com/s/xxxx",
        "receive_code": "",
        "sort_order": 1,
        "enabled": true
      }
    ],
    "request_policy": {
      "request_timeout_ms": 30000,
      "min_request_interval_ms": 500
    }
  },
  "capability_state": {
    "can_list": true,
    "can_random_read": true,
    "can_read_sidecar": true,
    "can_generate_play_target": true,
    "can_refresh_credentials": false
  }
}
```

## `browse-directories` 契约

这是当前多来源 WebUI 的关键契约，必须区分两种模式。

### 1. 创建挂载时浏览 provider 原生根

请求：

```jsonc
{
  "provider_type": "AList",
  "config_json": {
    "endpoint": "https://alist.example.com",
    "token": "redacted",
    "request_policy": {
      "request_timeout_ms": 30000,
      "min_request_interval_ms": 300
    }
  },
  "path": "/"
}
```

说明：

- 不传 `root_path`
- 后端按 provider 原生根浏览
- 适用于“新建挂载时选择根路径”

### 2. 媒体库绑定时浏览既有 mount 根内的相对子目录

请求：

```jsonc
{
  "provider_type": "Pan115Share",
  "config_json": {
    "client_type": "chrome",
    "shares": [
      {
        "id": "share_item_a",
        "alias": "电影合集",
        "share_code": "abc123",
        "receive_code": "qwer",
        "sort_order": 0,
        "enabled": true
      }
    ]
  },
  "root_path": "/",
  "path": "/电影合集/4K"
}
```

说明：

- 必须传该 mount 的 `root_path`
- `pan115-share` 的 `root_path` 固定为 `/`，`path` 进入 `/alias/子目录`
- 后端在该 mount 根内继续浏览相对子目录
- 适用于“把已存在挂载的某个子目录绑定到媒体库”

返回：

```jsonc
{
  "current_path": "/电影合集/4K",
  "parent_path": "/电影合集",
  "directories": [
    { "name": "动作片", "path": "/电影合集/4K/动作片" },
    { "name": "纪录片", "path": "/电影合集/4K/纪录片" }
  ]
}
```

## `config_json.request_policy`

远端治理统一入口固定为 `config_json.request_policy`。当前 WebUI 与第三方主题包都应按这个结构写入：

```jsonc
{
  "request_policy": {
    "request_timeout_ms": 30000,
    "min_request_interval_ms": 300,
    "max_retries": 2,
    "retry_backoff_base_ms": 300,
    "retry_backoff_max_ms": 3000,
    "throttle_cooldown_ms": 15000,
    "auth_cooldown_ms": 60000,
    "browse_concurrency": 1
  }
}
```

当前主线的真实消费边界：

- AList / OpenList：已消费 `request_timeout_ms`、`min_request_interval_ms`
- Microsoft：已消费 `request_timeout_ms`、`min_request_interval_ms`
- Pan115：runtime 注入时已消费 `request_timeout_ms`、`min_request_interval_ms`
- Pan115Share：分享目录浏览、播放和下载链路已消费 `request_timeout_ms`、`min_request_interval_ms`

更细的 retries / cooldown / concurrency 仍属于后续扩展字段，但皮肤和外部主题包应继续沿用这份 schema，不要自行发明第二套治理键名。

## 关键实现要求

1. 管理后台不能鼓励管理员手填远端路径。能浏览的来源必须优先给目录浏览器。
2. `pan115-share` 的 `root_path` 固定为虚拟根 `/`；分享链接、提取码、别名、排序和启停状态都在 `config_json.shares[]` 内维护。
3. 媒体库绑定的 `sub_path` 永远相对于 mount 根生效，不允许皮肤把它误解成 provider 全局根路径。
4. 第三方主题包如果接入 `browse-directories`，必须保留“创建挂载浏览”和“媒体库绑定浏览”这两种模式。
5. `pan115-share` 目录导入不需要 Cookie；播放、技术探测、sidecar 和资源读取才需要当前 mount 的分享 Cookie。

## 皮肤实现建议

- 列表页展示：名称、provider 类型、健康状态、关联媒体库数量、不可用绑定数。
- 新建/编辑抽屉按 provider 分区展示：
  - AList/OpenList：服务地址、认证方式、目录浏览器、远端治理
  - Microsoft：token / drive 选择、目录浏览器、远端治理
  - Pan115：专用凭据区、专用根目录选择器、远端治理
  - Pan115Share：多分享项 CRUD、别名、排序、分享 Cookie 绑定、目录浏览器、远端治理
- 永远不要在前端 DOM 直接渲染 token / password / cookie 等敏感值。
