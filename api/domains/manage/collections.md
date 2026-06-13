# Manage · Collections

合集管理面覆盖预置合集、豆瓣片单导入、自定义合集、规则合集和成员维护。

## 端点

| Method | Path | 说明 |
|---|---|---|
| GET | `/api/manage/collections` | 合集列表 |
| POST | `/api/manage/collections` | 新建自定义合集 / 规则合集 |
| GET | `/api/manage/collections/presets` | 预置合集列表 |
| POST | `/api/manage/collections/presets/create` | 按预置创建合集 |
| POST | `/api/manage/collections/imports/douban/preview` | 豆瓣片单预览 |
| POST | `/api/manage/collections/imports/douban/create` | 按豆瓣片单创建合集 |
| POST | `/api/manage/collections/rules/preview` | 规则命中预览 |
| GET | `/api/manage/collections/member-candidates?keyword=` | 本地媒体候选搜索 |
| GET | `/api/manage/collections/{collectionId}` | 合集详情 |
| PATCH | `/api/manage/collections/{collectionId}` | 更新合集基础信息 |
| DELETE | `/api/manage/collections/{collectionId}` | 删除合集 |
| POST | `/api/manage/collections/{collectionId}/sync` | 手动同步导入型合集 |
| PATCH | `/api/manage/collections/{collectionId}/rules` | 更新规则合集规则 |
| POST | `/api/manage/collections/{collectionId}/members/add` | 按媒体条目加入成员 |
| POST | `/api/manage/collections/{collectionId}/members/remove` | 按媒体条目移除成员 |
| PATCH | `/api/manage/collections/{collectionId}/members/{memberId}` | 更新成员标题 / 简介 / 启停 / 轨道顺序 |
| POST | `/api/manage/collections/{collectionId}/members/{memberId}` | 与 PATCH 同语义的兼容写法 |
| POST | `/api/manage/collections/{collectionId}/members/reorder` | 按轨道重排成员 |

## 关键 DTO

`ManagedCollectionDto` 至少包含：

```jsonc
{
  "id": "collection_001",
  "title": "漫威电影宇宙",
  "overview": "按观影顺序整理",
  "poster_url": "/api/assets/collections/collection_001/images/poster",
  "backdrop_url": null,
  "source_kind": "Preset|Douban|Custom|Rule",
  "collection_kind": "custom|rule",
  "preset_key": "mcu",
  "auto_expand_enabled": false,
  "min_effective_members": 2,
  "artwork_mode": "source|auto_collage|none",
  "visibility_status": "visible|insufficient_members|hidden",
  "release_count": 23,
  "watch_count": 23,
  "updated_at": "2026-06-13T12:00:00Z"
}
```

`ManagedCollectionDetailResponse` 至少包含：

```jsonc
{
  "collection": {},
  "tracks": [
    { "key": "release", "title": "上映顺序", "position": 0, "item_count": 23 },
    { "key": "watch", "title": "观影顺序", "position": 1, "item_count": 23 }
  ],
  "members": [],
  "import_sources": [],
  "rules": [],
  "member_overrides": []
}
```

`CreateManagedCollectionRequest`：

```jsonc
{
  "collection_kind": "custom",
  "title": "宫崎骏长片",
  "overview": null,
  "auto_expand_enabled": false,
  "min_effective_members": 2,
  "artwork_mode": "auto_collage",
  "rules": [],
  "member_item_ids": ["item_1", "item_2"]
}
```

`ReorderCollectionMembersRequest`：

```jsonc
{
  "track_key": "watch",
  "member_ids": ["member_a", "member_b", "member_c"]
}
```

## 危险操作

删除合集沿用 `DangerousActionRequest`：

```jsonc
{
  "confirm_action": "delete-collection",
  "session_confirmation": "delete-collection",
  "current_password": null
}
```

约束：

- `confirm_action` 固定为 `delete-collection`。
- 站点敏感策略为 `session` 时，`session_confirmation` 也必须提交 `delete-collection`。
- 站点敏感策略为 `password` 时，前端必须补交当前密码。

## 关键语义

1. 预置合集和豆瓣片单导入都允许后端返回“已有合集”；前端应进入“打开已有”，不要重复创建。
2. 管理端可以看到低成员或空合集，但前台是否可浏览以 `GET /api/collections/{collectionId}` 的真实结果为准。
3. 成员排序语义固定使用专用 `members/reorder` 接口，不回退为整列表 patch。
4. 手动新增成员只面向顶层条目，不允许把 `Season / Episode` 直接塞成合集成员。
