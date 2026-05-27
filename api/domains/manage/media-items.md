# Manage · Media Items

媒体条目细管：刮削、艺术图、字幕、元数据手动改。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/media-items` | 列表 `?page&page_size&q&library_id&status&order` |
| GET    | `/api/manage/media-items/{itemId}` | 详情（含所有 source、artwork override、subtitle override） |
| GET    | `/api/manage/media-items/{itemId}/pipeline` | 刮削/识别/扫描的最近一条流水线状态 |
| POST   | `/api/manage/media-items/{itemId}/identify` | 手动指定 TMDB / TVDB / 豆瓣 ID 重识别 |
| POST   | `/api/manage/media-items/{itemId}/scrape` | 触发刮削（按当前 metadata） |
| POST   | `/api/manage/media-items/{itemId}/scrape/refresh` | 强制刷新所有 artwork + 元数据 |
| PATCH  | `/api/manage/media-items/{itemId}/metadata` | 手改字段（标题、年份、简介、人员等） |
| POST   | `/api/manage/media-items/{itemId}/metadata/reset` | 抛弃手改恢复刮削原值 |
| DELETE | `/api/manage/media-items/{itemId}/sources/{sourceId}` | 从该条目移除一个文件源 |
| POST   | `/api/manage/media-items/{itemId}/artwork` | 上传/覆盖一张 artwork（multipart） |
| GET    | `/api/manage/media-items/{itemId}/artwork/{overrideId}` | 取覆盖图（302 或字节流） |
| DELETE | `/api/manage/media-items/{itemId}/artwork/{overrideId}` | 删除覆盖（恢复刮削图） |
| POST   | `/api/manage/media-items/{itemId}/subtitles` | 上传字幕 |
| GET    | `/api/manage/media-items/{itemId}/subtitles/{overrideId}` | 取字幕 |
| PATCH  | `/api/manage/media-items/{itemId}/subtitles/{overrideId}` | 更新字幕语言、默认态、排序等 |
| DELETE | `/api/manage/media-items/{itemId}/subtitles/{overrideId}` | 删除字幕覆盖 |
| POST   | `/api/manage/media-items/{itemId}/refresh-metadata` | 仅元数据刷新（不动 artwork） |
| POST   | `/api/manage/media-items/{itemId}/scan` | 仅扫描该条目（重新派发文件→条目） |

## DTO 概览

`ManagedMediaItemListDto`：`id / library_id / library_name / parent_id / title / original_title / media_type / type_label / year / season_number / episode_number / series_id / series_title / poster_url / source_status / mount_status / metadata_status / has_local_* / has_poster / has_subtitle / updated_at / last_scan_at`。

`ManagedMediaItemDetailResponse`：`item / base_metadata / effective_metadata / remote_metadata / scraped_metadata / scraped_artworks / local_metadata_override / metadata_status / sources / remote_assets / artwork_overrides / subtitle_overrides / latest_metadata_raw_content`。

`IdentifyReq` 当前为入队请求，不直接指定外部 ID：`{ "reason": "manual", "force": true }`。

`ScrapeReq`：`{ "reason": "manual", "force": false }`。

`MetadataPatchReq`：`{ title?, original_title?, sort_title?, year?, overview?, community_rating?, genres?, directors?, actors?, studios?, premiered? }`。

> 权威：`crates/fmby-api/src/manage/dto/media_items.rs`（最大文件，注意拆分）。

## 关键流程

1. **重新识别**：详情页 → identify 入队；当前接口不接收 TMDB/TVDB/Douban ID，具体候选与绑定以后端识别管线为准
2. **手改简介**：PATCH metadata → 标记 `manual_override=true`，下次 scrape 默认不覆盖
3. **artwork 覆盖**：POST artwork（multipart） → 返回更新后的 `ManagedMediaItemDetailResponse`
4. **流水线追踪**：pipeline 端点返回 `item_id / identify_task / identity_binding / scrape_task / current_metadata_source / review_status`，皮肤可链接到 task-center

## 错误

- `404 not_found`：item / source 不存在
- `409 conflict`：同 source 已绑该 item
- `415 unsupported_media`：上传的字幕/图片格式不在白名单
- `413 payload_too_large`：单图 > 10 MB / 字幕 > 5 MB

## 皮肤实现建议

- 列表：海报缩略图 + 标题年份 + 状态徽标 + 操作菜单（识别 / 刮削 / 删除）
- 详情：左侧海报 + 右侧 Tab（基本信息 / 演职员 / 文件源 / artwork / 字幕 / 任务历史）
- 上传 artwork：拖拽 + 预览 + 类型选择（poster / backdrop / logo）
- 手改字段提示用户："标记为手动后，刮削不会覆盖；点重置可恢复"
