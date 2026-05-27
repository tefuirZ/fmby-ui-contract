# Features · Manage · Upstreams

## 路由

- `/manage/media/upstreams`

## 数据

- API：[`../../api/domains/manage/upstreams.md`](../../api/domains/manage/upstreams.md)
- 关联：媒体库 `/manage/media/libraries`、授权 `/manage/site/license`

## UI 范围

| 区块 | 要求 |
|---|---|
| 上游源列表 | 名称、类型、状态、base URL、上次健康检查、上次同步、最近错误 |
| 创建 / 编辑抽屉 | sourceType、baseUrl、authMethod、密钥、userAgent、referer、extraHeaders、enabled |
| 健康检查 | 手动触发并展示 server_name / server_version / message |
| AppleCMS 分类绑定 | 发现分类、绑定本地媒体库、同步单页、同步全部已绑定分类 |
| Emby library 绑定 | 发现 library、绑定本地媒体库、常规同步 |
| Emby 接管导入 | preview、import、job 列表与详情 |

## 状态

- 无 license entitlement：显示授权引导，不伪装成空列表。
- 非超级管理员：显示 403。
- 上游不可达：保留源记录并在行内展示错误，不让整页失败。
- 密钥更新：编辑时如果不重填密钥，必须传 `retainSecret: true`。

## 约束

- 不要把 `password` / `apiKey` / `extraHeaders` 中的敏感值写入 localStorage。
- 同步和导入是不同语义，按钮文案必须区分。
- 导入预览结果不应自动执行 import。
