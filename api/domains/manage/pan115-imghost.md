# Manage · Pan115 Imghost (115 图床子系统)

> 运行时可用性：
>
> - `bootstrap.features.pan115_imghost_enabled` 表示后端图床服务是否已经启用。
> - 管理页路由和导航入口应保持可达；后端未启用时在页面内展示配置引导和不可用提示。
> - 构建层 env 只允许本地开发强制展示入口，不得覆盖后端能力门禁。
>
> 该域的产品定位是“刮削产物镜像系统”。手工上传接口保留，但只作为诊断能力，不再是主运营入口。

把刮削产生的海报、背景图、缩略图、Logo、人物头像镜像到 115 图床，返回 `sha1` + `host_url`（115 永久入口 URL）。新刮削资产、历史回补、失败重试统一进入任务中心执行。

## 端点

### 凭据

| Method | Path | 说明 |
|--------|------|------|
| POST   | `/api/manage/pan115/imghost/qr-login` | 申请图床凭据扫码（独立账号也行，可与 mount 不同号） |
| GET    | `/api/manage/pan115/imghost/qr-status?session_id=` | 长轮询扫码 |
| POST   | `/api/manage/pan115/imghost/activate` | 激活 |
| GET    | `/api/manage/pan115/imghost/credentials` | 当前凭据状态 |
| DELETE | `/api/manage/pan115/imghost/credentials` | 解绑 |

### 资产

| Method | Path | 说明 |
|--------|------|------|
| POST   | `/api/manage/pan115/imghost/upload` | 上传（multipart：`file`） → `{ sha1, host_url, size, width?, height? }` |
| GET    | `/api/manage/pan115/imghost/assets` | 列表 `?page&page_size&q` |
| GET    | `/api/manage/pan115/imghost/raw/{sha1}` | 取图：本地有则直读，无则 302 到 host_url |

### 治理执行模型

- 设置入口：`/api/settings/... naming-scrape`
- 结构化字段：
  - `imghost_governance.enabled`
  - `imghost_governance.scopes`
  - `imghost_governance.retain_local_copy`
- 兼容旧布尔：
  - `imghost_auto_upload`

> scope 合法值：`poster` / `backdrop` / `thumb` / `banner` / `logo` / `person_avatar`

### 任务中心联动

- 新增类别：`Imghost`
- 列表 / 详情来源：`pan115_imghost_mirror_tasks`
- 支持动作：
  - `Retry`
  - `Cancel`

### 调试

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/pan115/imghost/_debug/permanent-url/{sha1}` | 获取永久 URL（life.115.com 形式） |
| GET    | `/api/manage/pan115/imghost/_debug/final-url/{sha1}` | 跟随重定向到最终 CDN URL |

## DTO

`ImghostAsset`：
```jsonc
{
  "sha1": "abc...",
  "host_url": "https://life.115.com/imgload?h=...&i=1&t=0&ss=...&tt=...",
  "size": 123456,
  "mime": "image/jpeg",
  "width": 600,
  "height": 900,
  "uploaded_at": "...",
  "mirror_status": "Uploading|Ok|Failed|Unreachable|Disabled",
  "local_cache_path": "string?"
}
```

`NamingScrapeSettings.imghost_governance`：
```jsonc
{
  "enabled": true,
  "scopes": ["poster", "backdrop", "thumb", "banner", "logo", "person_avatar"],
  "retain_local_copy": true
}
```

`ImghostTask`（任务中心原始载荷）：
```jsonc
{
  "id": "uuid",
  "target_type": "SidecarAsset|ProviderPerson",
  "target_id": "asset-or-person-id",
  "media_item_id": "item-id-or-null",
  "scope": "poster|backdrop|thumb|banner|logo|person_avatar",
  "status": "Queued|Running|RetryWaiting|Succeeded|Failed|Paused|Cancelled",
  "attempt_count": 1,
  "max_attempts": 8,
  "retain_local_copy": true,
  "request_reason": "ScrapeSuccess|SettingsBackfill|ManualRetry|..."
}
```

## 关键流程

```
scrape success / settings backfill / manual retry
    |
    v
enqueue pan115_imghost_mirror_tasks
    |
    v
governance worker claim task
    ├─ 优先使用本地缓存
    ├─ 无本地缓存时回退下载上游 source_url
    ├─ 上传到 115 图床
    ├─ 成功后回写 sidecar_assets / provider_people 的 imghost_* 字段
    └─ retain_local_copy=false 时仅清理新任务本地副本
    |
    v
task center -> Imghost category
```

图床失败不得打回刮削成功态；失败只会在任务中心和日志体系中体现。

## 错误

- `412 precondition_failed`：凭据未绑 / 已过期
- `413 payload_too_large`：单图 > 10 MB
- `415 unsupported_media`：非图片 mime
- `502 upstream_error`：115 上游异常 → mirror_status=failed，本地仍可用
- `507 insufficient_storage`：图床配额耗尽 → mirror_status=quota_exceeded

## 皮肤实现建议

- `/manage/tools/pan115-imghost` 应是治理/观测页，不再主打手工上传
- 页面应始终能渲染基础说明；如果 API 返回“模块未启用 / 未配置密钥”类错误，展示配置引导，不要跳 404
- 设置页必须把 `imghost_governance` 作为结构化表单渲染，scope 用固定多选，不允许自由文本
- `/raw/{sha1}` 是稳定图片入口；实际读取顺序由后端决定：`115 直链 -> 本地缓存 -> 上游图片 URL`
- `bootstrap.features.pan115_imghost_enabled=false` 只代表后端图床数据面不可用，不代表主题可以删除治理入口或把路由变成 404
