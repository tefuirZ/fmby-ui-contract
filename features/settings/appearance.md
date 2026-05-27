# Features · Settings · Appearance

外观（含皮肤切换）。

## 路由
- `/settings/appearance`

## 数据
- `GET /api/site/skins`：可选皮肤列表
- `GET/PUT /api/settings/user/appearance`：用户外观偏好
- `GET /api/site/bootstrap` → `active_skin`：站点当前默认

## UI

| 字段 | 说明 |
|------|------|
| 主题模式 | light / dark / system |
| UI 皮肤 | 下拉或卡片选择，可预览 |
| 字体大小 | small / medium / large |
| 减少动效 | bool（无障碍） |

## 皮肤切换
- 切换后整页 reload（避免组件状态残留）
- 加载失败回退站点默认 + 顶部错误条
- 详见 [skin-package/lifecycle.md](../../skin-package/lifecycle.md)

## 皮肤建议
- 缩略图在皮肤包 manifest 提供
- 用户级覆盖时显示「站点默认 X / 我的选择 Y」
- 仅 admin 看到「设为站点默认」按钮（→ server-general）
