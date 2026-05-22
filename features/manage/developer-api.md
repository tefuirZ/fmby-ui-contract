# Features · Manage · Developer API

## 路由

- `/manage/site/developer-api`

只对具备管理权限的账号可见。

## 数据

- API：[../../api/domains/manage/developer-api.md](../../api/domains/manage/developer-api.md)
- 开放 API 合同：[../../api/open-v1.md](../../api/open-v1.md)

## 页面结构

页面至少包含四个区域：

1. Token 创建面板。
2. Token 列表与吊销。
3. Endpoint catalog。
4. API Explorer。

## Token 创建

必须支持：

1. owner 搜索与选择，数据来自 `GET /api/manage/developer/subjects`。
2. owner 类型展示：`human` / `service`。
3. scope 多选，选项来自 `GET /api/manage/developer/endpoints` 返回的 `scopes`。
4. 过期时间可为空；为空时说明后端默认一年后过期。
5. 创建成功后只展示一次明文 Token。
6. 复制按钮只复制明文 Token，不复制审计字段。

禁止：

1. 默认把 Token 绑定到当前管理员本人。
2. 把明文 Token 写入 localStorage、sessionStorage、IndexedDB、URL 或 query cache。
3. 用自由文本输入 scope。

## Token 列表

必须展示：

1. 名称和备注。
2. `token_prefix`。
3. owner 显示名 / 用户名 / 主体类型。
4. scope 列表。
5. 状态：`Active` / `Expired` / `Revoked`。
6. 创建时间、过期时间、最近使用时间、最近使用 IP。
7. 吊销操作。

吊销操作必须二次确认，并允许填写原因。

## Endpoint Catalog

必须通过 `GET /api/manage/developer/endpoints` 服务端分页加载。

搜索、scope、method、page、page size 必须进入 query key。搜索输入必须 debounce，默认不低于 300ms。

目录项必须展示：

1. method。
2. path。
3. summary。
4. required scope。
5. destructive 标记。
6. notes。

## API Explorer

Bearer 模式固定用于 `/api/open/v1/*`。

必须遵守 catalog 返回的 `constraints`：

1. 只允许相对同源路径。
2. 禁止绝对 URL、协议、host 和端口。
3. 禁止路径穿越片段和编码分隔符。
4. 禁止 query token。
5. 禁止 `/api/auth/*`、`/api/session`、`/api/site/*`、`/api/settings/*`、`/api/install/*`、`/emby/*`、`/jellyfin/*`。
6. Bearer 模式必须 `credentials: omit`。

写接口必须二次确认，确认内容至少包含 method、path、鉴权模式和请求体是否存在。

响应展示必须包含：

1. HTTP status。
2. headers。
3. body。
4. elapsed time。
5. request id。
6. 响应体截断提示。

## 状态矩阵

必须覆盖：

1. catalog loading / empty / error。
2. subjects loading / empty / error。
3. token list loading / empty / error。
4. create pending / success / validation error。
5. revoke pending / success / failure。
6. Explorer request pending / success / failure / body too large。
7. 未知 scope、未知账号类型、未知 Token 状态的显式错误。

## 验收要点

1. catalog 中出现 `open:browse.read` 时页面不能报未知 scope。
2. 管理总览返回 `environment_status = "ok"` 时 dashboard 应展示运行正常。
3. 新增开放 API scope 后，后端 catalog、domain mapper、schema 和文档必须同一次变更同步。
4. 浏览器刷新后不能继续加载旧 HTML 导致旧 chunk 运行；skin 包入口 HTML 应由服务端禁止缓存，hashed 静态资源可长期缓存。
