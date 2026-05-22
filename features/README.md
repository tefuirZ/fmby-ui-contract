# Features — UI Inventory

第三方做新皮肤时的"功能不漏"清单。每个功能落点都对应一个或多个 [api/domains](../api/domains/) 端点。

## 顶层结构

```
/login                             登录页
/register                          注册页（开放注册时显示）
/                                  首页 / Discover（按 site_settings 默认）
/discover                          推荐 / 热门 / 最近添加
/library/:libraryId                单库浏览
/library/:libraryId/items/:itemId  详情
/play/:itemId                      播放页
/profile                           个人资料
/settings/*                        个人设置
/manage/*                          管理面（admin 限定）
```

详见 [routes.md](./routes.md)、[states.md](./states.md)。

## 子文档

### 浏览侧（终端用户）

| 文档 | 范围 |
|------|------|
| [browse/discover.md](./browse/discover.md) | 首页 / 推荐流 |
| [browse/library.md](./browse/library.md) | 媒体库列表 + 筛选 |
| [browse/item-detail.md](./browse/item-detail.md) | 条目详情：海报、演职员、相关 |
| [browse/play.md](./browse/play.md) | 播放页：源选择、外部播放、进度 |
| [browse/login.md](./browse/login.md) | 登录 + 注册 + 注册码 |
| [browse/profile.md](./browse/profile.md) | 个人资料 / 头像 |

### 管理侧（admin）

| 文档 | 范围 |
|------|------|
| [manage/dashboard.md](./manage/dashboard.md) | 概览 + 高级状态 |
| [manage/users.md](./manage/users.md) | 用户 + 角色模板 + 注册码 |
| [manage/sessions.md](./manage/sessions.md) | 会话管理 |
| [manage/libraries.md](./manage/libraries.md) | 媒体库 + 数据源 |
| [manage/mounts.md](./manage/mounts.md) | 挂载（含 pan115 扫码） |
| [manage/media-items.md](./manage/media-items.md) | 资源管理 + 单条详情 |
| [manage/media-reviews.md](./manage/media-reviews.md) | 审核工单 |
| [manage/tasks.md](./manage/tasks.md) | 扫描 / 探针 / 命名刮削 / 命名清理 |
| [manage/task-center.md](./manage/task-center.md) | 任务中心 |
| [manage/logs.md](./manage/logs.md) | 审计 / 运行日志 |
| [manage/developer-api.md](./manage/developer-api.md) | 开放 API Token / endpoint catalog / API Explorer |
| [manage/pan115-imghost.md](./manage/pan115-imghost.md) | 115 图床治理 / 观测 |

### 个人 / 站点设置

| 文档 | 范围 |
|------|------|
| [settings/profile.md](./settings/profile.md) | 资料 / 改密 |
| [settings/playback.md](./settings/playback.md) | 播放偏好（外部播放器、码率） |
| [settings/appearance.md](./settings/appearance.md) | 外观（含皮肤切换 → 见 [overview/03-runtime-model.md]） |
| [settings/server-general.md](./settings/server-general.md) | 站点名 / 默认皮肤 |
| [settings/server-security.md](./settings/server-security.md) | 注册策略 / 密码策略 |
| [settings/server-session-policy.md](./settings/server-session-policy.md) | session 时长 / 多端策略 |

## 交叉参考

- 路由总表：[routes.md](./routes.md)
- 状态机（loading / empty / error / forbidden / unauthorized）：[states.md](./states.md)
- 端点权威：[../api/domains/](../api/domains/)
