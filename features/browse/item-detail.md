# Features · Browse · Item Detail

条目详情页（电影 / 单集 / 整剧通用）。

## 路由
- `/item/:itemId`

## 数据
- `GET /api/items/{id}`：基本信息 + sources + artwork
- `GET /api/items/{id}/children`：季 / 集直接子项
- `GET /api/items/{id}/descendants`：剧集后代
- `GET /api/items/{id}/sources`：播放源

## 必备 UI

| 区块 | 说明 |
|------|------|
| Hero | backdrop 大图 + 海报 + 标题年份评分 |
| 行动栏 | 立即播放 / 收藏 / 标记已看 / 在外部播放 |
| 简介 | overview + tagline + 类型标签 |
| 演职员 | 横向滚动 |
| 文件源 | 多源时让用户选（清晰度 / 容器） |
| 季 / 集 | 剧集二级选择器 |
| 相关推荐 | 网格 |

## 状态
- 多源：默认按 quality_priority 自动选
- 单源不可达：禁用播放按钮 + 提示「资源暂不可用」（链 source-availability）

## 皮肤建议
- backdrop 优先 imghost 直链 + cache_path 兜底
- 演员卡支持点击搜索同人作品（如果后端有）
- 长简介默认折叠 + "展开"
