# Features · Browse · Discover

首页 / 综合发现。

## 路由
- `/`

## 数据
- `GET /api/browse/home/bootstrap`：首页初始化
- `GET /api/browse/home`：首页 sections
- `GET /api/browse/recently-added`：最近添加
- `GET /api/browse/resume`：继续观看
- `GET /api/browse/libraries`：库列表（侧栏 / 入口卡片）
- `GET /api/site/bootstrap`：站点名、欢迎语、登录状态

## 必备模块

| 模块 | 说明 |
|------|------|
| Hero / Spotlight | 横幅推荐（recommend 顶 N） |
| 库入口卡 | 每库一卡 + 海报墙 |
| 最近添加 | 横向滚动 |
| 继续观看 | `GET /api/browse/resume` |

## 状态
- `empty`：无库 → 引导管理员创建
- 非管理用户看到 empty → "请联系管理员添加库"

## 皮肤建议
- 首屏避免一次拉全部，按需 lazy
- 海报固定比例（2:3），加 srcset 适配多分辨率
- 图片 URL 直接使用后端返回的 `poster_url` / `backdrop_url`；不要拼接未公开的图床 host 字段。
