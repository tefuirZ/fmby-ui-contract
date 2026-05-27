# Manage · Upstreams

> 上游源网关契约。当前支持 `apple-cms` 与 `emby`，用于把远端目录 / 影片同步到本地媒体库或执行 Emby 接管导入。

---

## 权限

所有端点要求：

- 登录态
- `manage:mounts`
- 超级管理员身份
- 相关来源类型的 license entitlement

普通管理用户没有超级管理员身份时会得到 `403`。

---

## 端点速查

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/manage/upstreams?source_type=&status=` | 上游源列表 |
| POST | `/api/manage/upstreams` | 创建上游源 |
| GET | `/api/manage/upstreams/{source_id}` | 上游源详情 |
| PATCH | `/api/manage/upstreams/{source_id}` | 更新上游源 |
| POST | `/api/manage/upstreams/{source_id}/enable` | 启用 |
| POST | `/api/manage/upstreams/{source_id}/disable` | 禁用 |
| POST | `/api/manage/upstreams/{source_id}/health-check` | 健康检查 |
| GET | `/api/manage/upstreams/{source_id}/apple-cms/categories` | AppleCMS 分类 |
| POST | `/api/manage/upstreams/{source_id}/apple-cms/discover-categories` | 发现 AppleCMS 分类 |
| PUT | `/api/manage/upstreams/{source_id}/apple-cms/category-bindings` | 替换分类到媒体库绑定 |
| POST | `/api/manage/upstreams/{source_id}/apple-cms/sync-page` | 同步单页 |
| POST | `/api/manage/upstreams/{source_id}/apple-cms/sync` | 同步分类或全部已绑定分类 |
| GET | `/api/manage/upstreams/{source_id}/emby/libraries` | Emby library 列表 |
| POST | `/api/manage/upstreams/{source_id}/emby/discover-libraries` | 发现 Emby libraries |
| PUT | `/api/manage/upstreams/{source_id}/emby/library-bindings` | 替换 Emby library 到本地媒体库绑定 |
| POST | `/api/manage/upstreams/{source_id}/emby/sync` | 常规 Emby 元数据同步 |
| POST | `/api/manage/upstreams/{source_id}/emby/import/preview` | Emby 接管导入预览 |
| POST | `/api/manage/upstreams/{source_id}/emby/import` | 执行 Emby 接管导入 |
| GET | `/api/manage/upstreams/{source_id}/emby/import/jobs` | 导入 job 列表 |
| GET | `/api/manage/upstreams/{source_id}/emby/import/jobs/{job_id}` | 导入 job 详情 |

查询参数接受 `source_type` 或兼容 camelCase `sourceType`。

---

## 上游源 DTO

```json
{
  "id": "up_001",
  "name": "Main Emby",
  "source_type": "emby",
  "source_type_label": "Emby",
  "base_url": "https://emby.example.com",
  "auth_method": "api-key",
  "status": "active",
  "username": null,
  "user_agent": null,
  "referer": null,
  "extra_headers": {},
  "has_secret": true,
  "last_health_check_at": "2026-05-27T10:00:00Z",
  "last_sync_at": null,
  "last_error_at": null,
  "last_error_message": null,
  "created_by": "u_admin",
  "created_at": "2026-05-27T09:00:00Z",
  "updated_at": "2026-05-27T09:00:00Z"
}
```

枚举：

| 字段 | 值 |
|---|---|
| `source_type` | `emby` / `apple-cms` |
| `auth_method` | `none` / `username-password` / `api-key` |
| `status` | `active` / `disabled` / `auth-expired` / `unreachable` / `degraded` |

写入请求：

```json
{
  "name": "Main Emby",
  "sourceType": "emby",
  "baseUrl": "https://emby.example.com",
  "authMethod": "api-key",
  "username": null,
  "password": null,
  "apiKey": "...",
  "userAgent": null,
  "referer": null,
  "extraHeaders": {},
  "retainSecret": false,
  "enabled": true
}
```

后端同时接受 snake_case。更新时如果不想改密钥，传 `retainSecret: true`。

---

## 分类 / library 绑定

分类 DTO：

```json
{
  "id": "cat_001",
  "source_id": "up_001",
  "upstream_category_id": "movies",
  "parent_upstream_category_id": null,
  "name": "电影",
  "library_id": "lib_movies",
  "library_name": "电影库",
  "discovered_at": "2026-05-27T10:00:00Z",
  "updated_at": "2026-05-27T10:00:00Z"
}
```

替换绑定请求：

```json
{
  "bindings": [
    { "categoryId": "cat_001", "libraryId": "lib_movies" }
  ]
}
```

后端保存时是替换语义，不是增量 patch。

---

## AppleCMS 同步

单页同步请求：

```json
{
  "categoryId": "cat_001",
  "page": 1,
  "pageSize": 100
}
```

批量同步请求：

```json
{
  "categoryId": null,
  "pageSize": 100,
  "workerCount": 4
}
```

响应包含 `category_count`、`discovered_category_count`、`bound_category_count`、`skipped_unbound_category_count`、`imported_item_count`、`imported_variant_count` 与 `categories` 明细。

---

## Emby 同步与导入

常规同步请求：

```json
{
  "categoryId": null,
  "pageSize": 100
}
```

Emby 接管导入请求：

```json
{
  "categoryId": null,
  "pageSize": 100,
  "importUserData": true
}
```

`preview` 与 `import` 返回同形 `ManageUpstreamEmbyImportDto`：

```json
{
  "job_id": "job_001",
  "source_id": "up_001",
  "mode": "preview",
  "status": "succeeded",
  "page_size": 100,
  "category_count": 2,
  "imported_item_count": 120,
  "imported_variant_count": 120,
  "direct_url_count": 20,
  "strm_url_count": 30,
  "local_file_count": 50,
  "local_file_unbound_count": 5,
  "emby_fallback_count": 10,
  "unreachable_count": 3,
  "unsupported_count": 2,
  "user_progress_imported_count": 18,
  "categories": [],
  "started_at": "2026-05-27T10:00:00Z",
  "finished_at": "2026-05-27T10:01:00Z"
}
```

`mode`: `preview` / `import`。`status`: `running` / `succeeded` / `failed`。

---

## 前端实现注意

- 上游源页应清楚区分"同步"和"接管导入"；导入会创建 / 更新本地媒体与播放源。
- `extra_headers` 可能含敏感业务 header 名，但后端不会回传密钥正文。
- 健康检查可失败并返回 `status=unreachable`，不要把它当作页面级错误。
- 长耗时导入建议按钮态锁定，不要自动轮询高频请求；用 job 列表查看结果。
