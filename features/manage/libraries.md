# Features · Manage · Libraries

## 路由
- `/manage/media/libraries`

## 数据
- [../../api/domains/manage/libraries.md](../../api/domains/manage/libraries.md)
- 选根目录：`POST /api/manage/mounts/browse-directories`

## UI

**列表**：库名 / 类型 / 源数 / 条目数 / 最近扫描 / 操作  
**新建/编辑抽屉（LibraryDrawer）**：基本信息 + 数据源添加（mount + path 选择器）+ 刮削策略  
**源选根弹窗**：左 mount 列表 + 右目录浏览（树 / 列表 / 面包屑皮肤自由）

## 皮肤建议
- "扫描全库" → toast + 跳任务中心
- source 状态徽标 + 右键菜单（恢复 → source-availability）
- 删除库时显示影响条目数 + 二次确认
