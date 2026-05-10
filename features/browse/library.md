# Features · Browse · Library

媒体库浏览页。

## 路由
- `/library`：所有库总览
- `/library/:libraryId`：单库

## 数据
- `GET /api/browse/libraries` → 库元信息
- `GET /api/browse/libraries/{id}/items?page&page_size&q&genre&year&sort`

## 必备 UI

| 区块 | 说明 |
|------|------|
| 顶栏 | 库名 / 类型徽标 / 总数 |
| 筛选侧栏 | 类型、年份、人员、未播、收藏 |
| 网格 / 列表切换 | 视图模式持久化在用户 preferences |
| 排序 | added_at / title / year / rating |
| 搜索 | 库内搜索（q 参数） |
| 分页 | 滚动加载或分页器二选一 |

## 状态
- `empty`：扫描未完成 → "扫描进行中，X% 已索引"
- `forbidden`：用户没该库权限 → 引导联系管理员

## 皮肤建议
- 海报懒加载 + blurhash 占位
- 多选 → 批量操作（标记已看 / 收藏）
- URL 反映筛选（便于分享）
