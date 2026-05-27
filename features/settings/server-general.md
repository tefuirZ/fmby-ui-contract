# Features · Settings · Server General

站点全局设置（`manage:access`）。

## 路由
- `/manage/site/settings` 中的"基本"分组

## 数据
- `GET /api/settings/server/general`
- `PUT /api/settings/server/general`

## 字段

| 字段 | 说明 |
|------|------|
| site_name | 站点名 |
| registration_enabled | 是否开放注册入口 |
| homepage_message | 首页文案 |
| maintenance_banner | 维护横幅 |
| support_contact | 支持联系方式 |
| active_ui_skin | 站点默认 skin |
| pan115_imghost_enabled | 115 图床功能开关 |
| pan115_provider_enabled | 115 provider 功能开关 |

## 皮肤建议
- active_ui_skin 切换前显示「将立即生效，未刷新页面的客户保持旧皮肤」
