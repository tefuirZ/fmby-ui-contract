# Features · Browse · Library

媒体库浏览页。

## 路由
- `/libraries`：所有库总览
- `/libraries/:libraryId`：单库

## 数据
- `GET /api/browse/libraries` → 库元信息
- `GET /api/browse/libraries/{libraryId}?page&pageSize&search&mediaType&watched&sort&resolution`

## 必备 UI

| 区块 | 说明 |
|------|------|
| 顶栏 | 库名 / 类型徽标 / 总数 |
| 筛选侧栏 | 类型、观看状态、分辨率 |
| 网格 / 列表切换 | 视图模式持久化在用户 preferences |
| 排序 | 以后端当前 `sort` 支持值为准；未知值不要本地兜底成另一种排序 |
| 搜索 | 库内搜索（`search` 参数） |
| 分页 | 滚动加载或分页器二选一 |

## 状态
- `empty`：扫描未完成 → "扫描进行中，X% 已索引"
- `forbidden`：用户没该库权限 → 引导联系管理员

## 皮肤建议
- 海报懒加载 + blurhash 占位
- 不要依赖当前合同未提供的收藏 / 批量标记接口
- URL 反映筛选（便于分享）
