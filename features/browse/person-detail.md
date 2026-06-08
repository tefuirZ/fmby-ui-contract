# Features · Browse · Person Detail

人物合集页。

## 路由
- `/people/:personId`

## 数据
- `GET /api/items/people/{personId}`：人物资料。
- `GET /api/items/people/{personId}/items?page&pageSize`：当前用户可见的关联作品。
- 人物头像：`/api/assets/people/{personId}/primary`。

## 必备 UI

| 区块 | 说明 |
|------|------|
| Hero | 人物头像、姓名、简介 |
| Meta | 关联作品数量、provider 信息 |
| 作品列表 | 海报网格或虚拟网格，按后端分页加载 |
| 状态 | loading / empty / error / not found |

## 行为

- 只有真实 `person.id` 可以进入人物合集。
- 条目详情页演员/导演卡片如果带 `person.id`，整张卡片点击进入 `/people/:personId`。
- 缺少真实人物 ID 的演员/导演只展示，不拼接搜索 URL、上游 URL 或 `person-image-*`。
- 作品列表分页、权限、来源可见性和 `total` 完全以后端返回为准。
- skin 不得从媒体库、首页或搜索结果本地过滤拼出人物合集。

## 图片与降级

- 头像优先使用人物详情响应的 `thumb_url`。
- 无头像时展示姓名首字占位。
- `<img>` 加载失败时降级占位，不让整个页面失败。

## 状态

- `404`：人物不存在，或当前用户没有任何可见关联作品。
- 空列表：人物资料可见但当前分页没有更多结果。
- 错误态必须保留重试入口。
