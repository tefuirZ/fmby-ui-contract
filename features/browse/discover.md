# Features · Browse · Discover

首页 / 综合发现。

## 路由
- `/` （重定向）
- `/discover`

## 数据
- `GET /api/browse/recent`：最近添加（按 added_at desc）
- `GET /api/browse/recommend`：推荐（后端策略，可能为空）
- `GET /api/browse/libraries`：库列表（侧栏 / 入口卡片）
- `GET /api/site/info`：站点名、logo、欢迎语

## 必备模块

| 模块 | 说明 |
|------|------|
| Hero / Spotlight | 横幅推荐（recommend 顶 N） |
| 库入口卡 | 每库一卡 + 海报墙 |
| 最近添加 | 横向滚动 |
| 继续观看 | `GET /api/me/continue-watching`（若可用） |
| 收藏 | `GET /api/me/favorites`（若可用） |

## 状态
- `empty`：无库 → 引导管理员创建
- 非 admin 看到 empty → "请联系管理员添加库"

## 皮肤建议
- 首屏避免一次拉全部，按需 lazy
- 海报固定比例（2:3），加 srcset 适配多分辨率
- 优先用 `imghost_host_url` 直链，回退本地
