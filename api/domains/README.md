# API Domains

> 按业务域分类的端点详解。每份文档列出所有端点、请求 / 响应概要、关键流程、错误。

---

## 公开侧（普通用户）

skin 实现"用户端"功能至少要支持下面 5 个域：

| 文档 | 域 | 端点数 | 用途 |
|---|---|---|---|
| [`browse.md`](./browse.md) | browse | 8 | 首页 / 媒体库 / 历史 / 搜索 / 推荐 |
| [`items.md`](./items.md) | items | 5 | 媒体详情 / 子项 / 源 |
| [`playback.md`](./playback.md) | playback | 5 | 播放决策 / 会话 / 心跳 |
| [`assets.md`](./assets.md) | assets | 4 | 海报 / 字幕 / 视频流 |
| [`settings.md`](./settings.md) | settings | 6 | 用户三套 + 服务器三套 |

---

## 管理侧（manager / owner）

skin 实现"后台管理"还需要以下域。**可分模块逐步实现**——比如先做用户、库、挂载，后续再补 task-center / pan115 / imghost。

| 文档 | 域 | 端点数 | 用途 |
|---|---|---|---|
| [`manage/dashboard.md`](./manage/dashboard.md) | dashboard | 2 | 后台首页概览 / 高级 |
| [`manage/users.md`](./manage/users.md) | users | 9 | 用户 + 角色模板 + 批量操作 |
| [`manage/registration-codes.md`](./manage/registration-codes.md) | registration-codes | 4 | 邀请码 / 批次管理 |
| [`manage/sessions.md`](./manage/sessions.md) | sessions | 2 | 在线会话查询 / 注销 |
| [`manage/libraries.md`](./manage/libraries.md) | libraries | 4 | 媒体库 + 扫描 + 源清理 |
| [`manage/mounts.md`](./manage/mounts.md) | mounts | 5 | 挂载点 + 浏览目录 + 校验 |
| [`manage/media-items.md`](./manage/media-items.md) | media-items | 15 | 单条媒体管理（识别 / 刮削 / 元数据 / 美工 / 字幕） |
| [`manage/media-reviews.md`](./manage/media-reviews.md) | media-reviews | 5 | 待审媒体队列 |
| [`manage/tasks.md`](./manage/tasks.md) | tasks | 10 | 扫描 / 探测 / 命名刮削 / 命名清理 |
| [`manage/task-center.md`](./manage/task-center.md) | task-center | 4 | 统一任务中心 |
| [`manage/source-availability.md`](./manage/source-availability.md) | source-availability | 1 | 单源恢复 |
| [`manage/logs.md`](./manage/logs.md) | logs | 2 | 审计 / 运行日志 |
| [`manage/pan115.md`](./manage/pan115.md) | pan115 | 8 | 115 网盘账号 / 扫码 / 浏览 |
| [`manage/pan115-imghost.md`](./manage/pan115-imghost.md) | pan115-imghost | 9 | 图床凭据 / 上传 / 资源 / 调试 |

---

## 兼容层（不属于一方契约）

`/emby/*` 和 `/jellyfin/*` 是 fmby 提供的兼容层，给三方播放器（如 Infuse、Senplayer）使用。**skin 不应依赖**，不在本仓库范围。

如果你想让自己的 skin 也支持兼容层调用，需要自己处理它的 quirks（多版本兼容、字段差异、auth 模型差异）。建议优先一方 API。

---

## 怎么读 domain 文档

每份 domain 文档结构统一：

```
# {Domain Name}

> 一句话总结。

## 端点速查         <- 表格：path / method / 用途
## 鉴权与权限        <- 哪些 capability 需要
## 关键流程          <- 流程图 / 时序
## 端点详解          <- 每个端点 req / resp / 错误
## 与其它域的关系     <- 上下游
```

约定：

- DTO 字段精确定义请看 OpenAPI spec（stage12U 后期上线）
- 当前 stage 期间，markdown 给出**关键字段** + 链接到现有 classic skin 的 type 定义作为参考
- 错误码引用 [`../errors.md`](../errors.md) 总表，不重复列举

---

## 跨域共享 DTO

下列 DTO 在多个域出现，建议 skin 抽出公共 type：

| DTO | 出现位置 | 字段 |
|---|---|---|
| `MediaItemSummary` | browse, items, manage/media-items | id, title, year, kind, primary_image_url, parent_id |
| `Library` | browse, items, manage/libraries | id, name, kind, sources_count |
| `User` | auth, manage/users | id, username, display_name, roles, capabilities |
| `PaginationMeta` | 所有分页响应 | page, page_size, total, total_pages |

详见各域文档 + classic skin `apps/web/src/api/types/` 目录。
