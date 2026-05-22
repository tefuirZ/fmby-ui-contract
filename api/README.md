# API Contract

> fmby 后端给 skin 提供的所有 HTTP 接口契约。这是 skin 调用 fmby 的**唯一权威入口**。

---

## 怎么读这部分文档

| 文档 | 用途 |
|---|---|
| [`conventions.md`](./conventions.md) | 通用约定：URL、JSON、日期、分页、ID、幂等、CSRF、cookies |
| [`auth.md`](./auth.md) | 鉴权流程详解：登录、注册、CSRF、session、setup |
| [`open-v1.md`](./open-v1.md) | 第三方开放 API：`/api/open/v1/*`、API Token、scope、endpoint catalog |
| [`errors.md`](./errors.md) | 错误响应结构、错误码表、重试策略 |
| [`domains/README.md`](./domains/README.md) | 按业务域分类的端点详解索引 |
| [`domains/*`](./domains/) | 每个业务域一个文件：browse / items / playback / assets / settings / manage/* |

---

## OpenAPI 是 DTO 的源头

**重要**：

- Markdown 文档负责**语义、流程、边界、示例、错误**
- OpenAPI 3.1 spec（fmby 后端 `/api/openapi.json` 自动生成）负责**字段类型、必填项、枚举值**

skin 作者推荐工作流：

1. 看本仓库 markdown 了解某个 API 是干什么的、什么时候调
2. 用 `npx openapi-typescript /openapi.json -o src/api-types.ts` 自动生成 TypeScript 类型
3. 看 markdown 里的"流程图 / 示例 / 错误"补足 spec 不能表达的部分

> ⚠️ stage12U 完成前 fmby 后端尚未集成 utoipa，OpenAPI spec 暂未上线。期间 skin 作者请直接看本仓库 markdown + 现有 classic skin 的 `apps/web/src/api/` 类型定义。

---

## 端点全景（100+ 一方端点）

| 域 | 端点数 | 主要用途 |
|---|---|---|
| **auth** | 8 | 登录 / 注册 / 注销 / 会话查询 / setup 检查 |
| **browse** | 8 | 首页 / 历史 / 媒体库 / 推荐 / 搜索 |
| **items** | 5 | 媒体详情 / 子项 / 后代 / 源 / 刷新 |
| **playback** | 5 | 播放决策 / 会话 / 心跳 / 进度 / 停止 |
| **assets** | 4 | 海报 / 头像 / 字幕 / 原始流（HEAD/GET） |
| **settings** | 6 | 用户三套（profile/playback/appearance）+ 服务器三套 |
| **manage** | ~70 | 后台管理：用户、库、挂载、media-items、reviews、tasks、task-center、pan115、imghost、logs、sessions、registration-codes、source-availability |
| **open-api v1** | 20+ | 第三方 Bearer API：browse / items / assets / playback / manage 包装接口 |
| **emby/jellyfin compat** | (大量) | **不属于一方 skin 契约**，skin 不应依赖 |

---

## 共有约束

所有一方 API 端点：

- ✅ 路径前缀：`/api/`
- ✅ 同源：永远从 skin 当前域请求（不需要配 CORS）
- ✅ Cookie session：`fmby_session` 自动随请求带
- ✅ 写操作（POST / PUT / PATCH / DELETE）必须带 `X-CSRF-Token` header（值 = `fmby_csrf` cookie）
- ✅ 请求 / 响应 body 都是 JSON（少数 streaming 端点除外，如 `/api/assets/streams/*`）
- ✅ 时间字段都是 ISO 8601 UTC 字符串（如 `2026-01-15T10:30:00Z`）
- ✅ 错误响应统一 envelope（见 [`errors.md`](./errors.md)）

详见 [`conventions.md`](./conventions.md)。

## 三条 API 边界

| 边界 | 路径 | 凭证 | 消费方 |
|---|---|---|---|
| 内置 Web API | `/api/*` | Cookie session + CSRF | 内置 skin / 受信前端 |
| 开放 API | `/api/open/v1/*` | `Authorization: Bearer <api_token>` | 第三方开发者 / 自动化脚本 |
| Compat API | `/emby/*`、`/jellyfin/*` | compat token / `api_key` / Emby header | Emby / Jellyfin 兼容客户端 |

skin 页面默认只调用内部 `/api/*`。开放 API 只在开发者 API Explorer 的 Bearer 模式里测试，不能作为普通页面数据源。

---

## 鉴权一图流（速查）

```
┌──────────┐  POST /api/auth/login           ┌──────────────┐
│ 未登录    │ ────────────────────────────→  │ 后端验证密码  │
│ 浏览器    │  body: {username, password}    │ 写 session    │
└──────────┘                                  └──────┬───────┘
                                                      │
       ┌──────────────────────────────────────────────┘
       │ Set-Cookie: fmby_session=xxx; HttpOnly
       │ Set-Cookie: fmby_csrf=yyy; (skin 可读)
       ▼
┌──────────┐  GET /api/browse/home            ┌──────────────┐
│ 已登录    │ ────────────────────────────→  │ 后端读 cookie │
│ skin     │  Cookie: fmby_session            │ 返回数据      │
└──────────┘                                  └──────────────┘

┌──────────┐  POST /api/playback/sessions     ┌──────────────┐
│ 写操作    │ ────────────────────────────→  │ 后端校验 CSRF │
│ skin     │  Cookie: fmby_session, fmby_csrf │ 返回结果      │
│          │  Header: X-CSRF-Token=fmby_csrf  │              │
└──────────┘                                  └──────────────┘
```

详见 [`auth.md`](./auth.md)。

---

## 下一步

- 入门第一步：[`conventions.md`](./conventions.md)
- 如果你是 skin 作者，建议第一份读：[`auth.md`](./auth.md)
- 浏览所有端点详情：[`domains/README.md`](./domains/README.md)
