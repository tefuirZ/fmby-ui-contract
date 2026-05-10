# Manage · Pan115 Imghost (115 图床子系统)

> Feature flag：`features.pan115_imghost`（默认 OFF）。`GET /api/site/info` 中读取；皮肤未亮该 flag 时整块入口隐藏。

把任意小图（海报/截图）上传到 115 图床，返回 `sha1` + `host_url`（115 永久直链）。刮削管线可联动自动镜像（见 [tasks.md naming-scrape `imghost_auto_upload`]）。

## 端点

### 凭据

| Method | Path | 说明 |
|--------|------|------|
| POST   | `/api/manage/pan115/imghost/qr-login` | 申请图床凭据扫码（独立账号也行，可与 mount 不同号） |
| GET    | `/api/manage/pan115/imghost/qr-status` | 长轮询扫码 |
| POST   | `/api/manage/pan115/imghost/activate` | 激活 |
| GET    | `/api/manage/pan115/imghost/credentials` | 当前凭据状态 |
| DELETE | `/api/manage/pan115/imghost/credentials` | 解绑 |

### 资产

| Method | Path | 说明 |
|--------|------|------|
| POST   | `/api/manage/pan115/imghost/upload` | 上传（multipart：`file`） → `{ sha1, host_url, size, width?, height? }` |
| GET    | `/api/manage/pan115/imghost/assets` | 列表 `?page&page_size&q` |
| GET    | `/api/manage/pan115/imghost/raw/{sha1}` | 取图：本地有则直读，无则 302 到 host_url |

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
  "mirror_status": "ok|pending|referer_blocked|quota_exceeded|failed",
  "local_cache_path": "string?"
}
```

> 权威：`crates/fmby-api/src/manage/dto/pan115_imghost.rs`、`crates/pan115-imghost-service/src/lib.rs`。

## 关键流程

```
multipart upload
    |
    v
service.commit_upload
    ├─ sha1 dedup（已存在直接返回旧 host_url）
    ├─ 落本地 (.tmp -> rename)
    └─ spawn fire-and-forget: 推 115 -> 写 host_url
    |
    v
{ sha1, host_url, mirror_status: ok|pending }
```

刮削自动镜像见 [tasks.md naming-scrape] 的 `imghost_auto_upload` 开关。

## 错误

- `412 precondition_failed`：凭据未绑 / 已过期
- `413 payload_too_large`：单图 > 10 MB
- `415 unsupported_media`：非图片 mime
- `502 upstream_error`：115 上游异常 → mirror_status=failed，本地仍可用
- `507 insufficient_storage`：图床配额耗尽 → mirror_status=quota_exceeded

## 皮肤实现建议

- 工具页 `/manage/tools/pan115-imghost`：拖拽上传 + 资产网格 + 复制 host_url 按钮（HTTP 走 fallback）
- 凭据卡片：扫码 + cookie_app `<select>`（与 [pan115.md] 同款）
- mirror_status 徽标：ok(绿) / pending(蓝转动) / referer_blocked(黄) / quota_exceeded(红) / failed(红)
- referer_blocked 时引导用户："此图床受防盗链限制，已使用本地兜底"
- `/raw/{sha1}` 是稳定外链；皮肤可放心嵌 `<img src>`，后端会决定 302 还是直读
- feature flag 关闭时整个二级菜单 + 设置页开关都不渲染
