# Features · Settings · Server General

站点全局设置（admin）。

## 路由
- `/manage/site/settings` 中的"基本"分组

## 数据
- `GET /api/site/settings`、`PUT /api/site/settings`

## 字段

| 字段 | 说明 |
|------|------|
| site_name | 站点名 |
| site_description | 简介 |
| logo_url | 站点 logo |
| hero_url | 登录页大图 |
| default_library_id | 默认库（首页落地） |
| active_ui_skin | 站点默认皮肤 ID（stage12U） |
| timezone | Asia/Shanghai 等 |
| language | zh-CN / en-US |

## 皮肤建议
- logo / hero 上传走 [pan115-imghost.md] 或本地 multipart（站点设定可独立）
- timezone / language 改动后建议刷新浏览器
- active_ui_skin 切换前显示「将立即生效，未刷新页面的客户保持旧皮肤」
