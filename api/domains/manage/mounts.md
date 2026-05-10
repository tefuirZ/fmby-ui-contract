# Manage · Mounts (Storage Sources)

挂载 = StorageProvider 实例。当前支持的 provider：`local` / `pan115` / 其它（按 [domains/settings.md](../settings.md) 中 `features.providers` 列出）。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/mounts` | 列表 |
| POST   | `/api/manage/mounts` | 新建挂载 |
| POST   | `/api/manage/mounts/browse-directories` | 通用目录浏览（建库选根用） |
| GET    | `/api/manage/mounts/{mountId}` | 详情（含凭据状态、容量、最近错误） |
| POST   | `/api/manage/mounts/{mountId}/validate` | 校验：能 stat 根目录、凭据有效 |
| POST   | `/api/manage/mounts/{mountId}/refresh-access` | 刷新凭据（OAuth refresh token / 重新登录提示） |

## DTO

`Mount`：
```jsonc
{
  "id": "uuid",
  "name": "我的 115",
  "provider_type": "local|pan115",
  "root_path": "/",
  "status": "active|degraded|expired|unbound",
  "credentials_status": "ok|expired|missing",
  "capacity": { "total_bytes": 1099511627776, "used_bytes": 123456 },
  "config": { /* provider 特定 */ },
  "created_at": "...",
  "last_validated_at": "..."
}
```

`BrowseDirectoriesReq`（按 mount + path 浏览）：
```jsonc
{
  "mount_id": "uuid",
  "path": "/电影",
  "page_token": "string?"
}
```
返回：`{ data: { entries: [{ name, path, is_dir, size?, modified_at? }], next_page_token? } }`

> 权威：`crates/fmby-api/src/manage/dto/mounts.rs`。

## 关键流程

1. **新建 local mount**：填名 + 物理路径 → POST → 自动 validate
2. **新建 pan115 mount**：见 [pan115.md](./pan115.md)，需要先扫码
3. **浏览选目录**：建库时用 `browse-directories` 树/列表二选一渲染
4. **凭据刷新失败**：`refresh-access` 返回 `412 precondition_failed { reason: "needs_qr" }`，皮肤跳扫码流程

## 错误

- `409 conflict`：name 重复 / 同 provider 同 root 重复
- `412 precondition_failed`：凭据需要重新扫码 / 重新登录
- `502 upstream_error`：provider 网络问题
- `423 locked`：此 mount 还有进行中的扫描，不能改 root_path

## 皮肤实现建议

- 列表行的状态徽标 + 提示按钮（"立即校验" / "重新扫码"）
- pan115 mount 详情页内嵌 [pan115.md](./pan115.md) 的二维码组件
- browse-directories 页面：左树右列表 / 或纯列表面包屑（皮肤自由选）
- 永远不要把 config 里的密钥字段直接渲染在前端 DOM（后端会过滤但皮肤也需自检）
