# Features · Browse · Profile

个人资料展示页。

## 路由
- `/profile`

## 数据
- `GET /api/me`：基本信息 + roles + library_grants
- `GET /api/me/stats`（若有）：观看时长 / 收藏数

## UI

| 区块 | 说明 |
|------|------|
| 头像 + 昵称 + 角色徽标 | active / disabled 仅自己看到 |
| 可见库列表 | 按 library_grants |
| 统计 | 总观看时长、收藏数 |
| 快捷入口 | 设置 / 登出 |

## 状态
- 头像加载失败 → 文字头像 fallback
- 统计 503 → 隐藏统计区不报错

## 皮肤建议
- 改资料 / 改密在 [settings/profile.md] 单独页
- 登出按钮二次确认（避免误触）
