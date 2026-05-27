# Features · Browse · Profile

个人资料展示页。

## 路由
- `/profile`

## 数据
- `GET /api/session`：当前登录用户基础信息、roles、capabilities，并刷新 CSRF Cookie。
- `GET /api/settings/user/profile`：当前用户资料，包含 `display_name`、`avatar_url`、`default_library_id`、`email`、`bio`。
- 当前一方契约没有独立个人统计接口；个人页统计若要展示，必须来自已有浏览/历史数据的前端派生或后续新增正式接口。

## UI

| 区块 | 说明 |
|------|------|
| 头像 + 昵称 + 角色徽标 | active / disabled 仅自己看到 |
| 可见库列表 | 从 browse/library API 或 bootstrap 能力派生，不读取不存在的 `library_grants` 字段 |
| 统计 | 当前无专用后端统计接口；没有数据时隐藏该区块 |
| 快捷入口 | 设置 / 登出 |

## 状态
- 头像加载失败 → 文字头像 fallback
- 统计来源不可用 → 隐藏统计区不报错

## 皮肤建议
- 改资料 / 改密在 [settings/profile.md] 单独页
- 登出按钮二次确认（避免误触）
